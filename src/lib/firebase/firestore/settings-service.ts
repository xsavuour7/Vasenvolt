"use client";

import { firestore } from '../config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  onSnapshot,
  Unsubscribe,
  DocumentData,
  WithFieldValue,
  FieldValue,
  DocumentSnapshot,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import {
  UserSettings,
  NotificationPreferences,
  DisplayPreferences,
  DataPreferences,
  settingsConverter,
  NotificationChannel,
  ThemeMode,
  Language,
  TimeRange
} from './settings-types';

type FirestoreUserSettings = {
  userId: string;
  notifications: NotificationPreferences;
  display: DisplayPreferences;
  data: DataPreferences;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

function toFirestoreSettings(settings: Omit<UserSettings, 'id' | 'createdAt' | 'updatedAt'>): WithFieldValue<DocumentData> {
  return {
    ...settings,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
}

function toPartialFirestoreSettings(data: Partial<UserSettings>): WithFieldValue<DocumentData> {
  const result: Partial<WithFieldValue<DocumentData>> = {};
  
  if (data.userId) result.userId = data.userId;
  if (data.notifications) result.notifications = data.notifications;
  if (data.display) result.display = data.display;
  if (data.data) result.data = data.data;
  
  result.updatedAt = Timestamp.now();
  
  return result;
}

export class SettingsService {
  private static readonly COLLECTION = 'settings';
  private static readonly DEFAULT_SETTINGS: Omit<UserSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
    notifications: {
      email: {
        enabled: true,
        frequency: 'immediate',
        types: {
          alerts: true,
          reports: true,
          maintenance: true,
          system: true,
        },
      },
      push: {
        enabled: true,
        frequency: 'immediate',
        types: {
          alerts: true,
          reports: true,
          maintenance: true,
          system: true,
        },
      },
      thresholds: {
        energyConsumption: 1000,
        cost: 100,
        deviceStatus: true,
      },
    },
    display: {
      theme: 'system',
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'YYYY-MM-DD',
      numberFormat: 'en-US',
      currency: 'USD',
      units: {
        energy: 'kWh',
        power: 'kW',
        temperature: 'C',
        distance: 'm',
      },
      charts: {
        defaultTimeRange: 'week',
        showGrid: true,
        showLegend: true,
        animation: true,
      },
    },
    data: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionPeriod: 365,
      exportFormat: 'pdf',
      dataSharing: {
        analytics: true,
        diagnostics: true,
        marketing: false,
      },
      privacy: {
        showDeviceNames: true,
        showLocation: true,
        showEnergyData: true,
      },
    },
    version: 1,
  };

  // Basic CRUD Operations
  static async getSettings(userId: string): Promise<UserSettings | null> {
    const settingsRef = doc(firestore, this.COLLECTION, userId).withConverter(settingsConverter);
    const snapshot = await getDoc(settingsRef);
    return snapshot.exists() ? snapshot.data() : null;
  }

  static async createSettings(userId: string): Promise<UserSettings> {
    const settingsRef = collection(firestore, this.COLLECTION).withConverter(settingsConverter);
    const now = Timestamp.now();
    const newSettings = {
      ...this.DEFAULT_SETTINGS,
      userId,
      createdAt: now,
      updatedAt: now,
    } as unknown as WithFieldValue<UserSettings>;
    
    const docRef = await addDoc(settingsRef, newSettings);
    const snapshot = await getDoc(docRef.withConverter(settingsConverter));
    return snapshot.data()!;
  }

  static async updateSettings(
    userId: string,
    updates: Partial<UserSettings>
  ): Promise<void> {
    const settingsRef = doc(firestore, this.COLLECTION, userId);
    await updateDoc(settingsRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  }

  static async deleteSettings(userId: string): Promise<void> {
    const settingsRef = doc(firestore, this.COLLECTION, userId);
    await deleteDoc(settingsRef);
  }

  // Notification Preferences
  static async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    const settingsRef = doc(firestore, this.COLLECTION, userId);
    await updateDoc(settingsRef, {
      'notifications': preferences,
      updatedAt: Timestamp.now(),
    });
  }

  // Display Preferences
  static async updateDisplayPreferences(
    userId: string,
    preferences: Partial<DisplayPreferences>
  ): Promise<void> {
    const settingsRef = doc(firestore, this.COLLECTION, userId);
    await updateDoc(settingsRef, {
      'display': preferences,
      updatedAt: Timestamp.now(),
    });
  }

  // Data Preferences
  static async updateDataPreferences(
    userId: string,
    preferences: Partial<DataPreferences>
  ): Promise<void> {
    const settingsRef = doc(firestore, this.COLLECTION, userId);
    await updateDoc(settingsRef, {
      'data': preferences,
      updatedAt: Timestamp.now(),
    });
  }

  // Real-time Listeners
  static onSettingsUpdate(
    userId: string,
    callback: (settings: UserSettings | null) => void
  ): Unsubscribe {
    const settingsRef = doc(firestore, this.COLLECTION, userId).withConverter(settingsConverter);
    return onSnapshot(settingsRef, (snapshot) => {
      callback(snapshot.exists() ? snapshot.data() : null);
    });
  }

  // Utility Methods
  static async getOrCreateSettings(userId: string): Promise<UserSettings> {
    const existingSettings = await this.getSettings(userId);
    if (existingSettings) {
      return existingSettings;
    }
    return this.createSettings(userId);
  }

  static async resetSettings(userId: string): Promise<UserSettings> {
    await this.deleteSettings(userId);
    return this.createSettings(userId);
  }

  static async migrateSettings(userId: string): Promise<void> {
    const settings = await this.getSettings(userId);
    if (!settings) return;

    const currentVersion = settings.version || 1;
    if (currentVersion < this.DEFAULT_SETTINGS.version) {
      // Perform migration based on version difference
      const updates: Partial<UserSettings> = {
        version: this.DEFAULT_SETTINGS.version,
      };

      // Add any new fields from default settings
      Object.entries(this.DEFAULT_SETTINGS).forEach(([key, value]) => {
        if (!(key in settings)) {
          (updates as any)[key] = value;
        }
      });

      await this.updateSettings(userId, updates);
    }
  }
} 