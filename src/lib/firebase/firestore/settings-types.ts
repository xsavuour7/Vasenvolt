import { Timestamp, DocumentData, WithFieldValue, FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase/firestore';

export type NotificationFrequency = 'immediate' | 'daily' | 'weekly' | 'monthly';
export type TimeRange = 'day' | 'week' | 'month' | 'year' | 'custom';
export type ExportFormat = 'pdf' | 'csv' | 'json';

export interface NotificationPreferences {
  email: {
    enabled: boolean;
    frequency: NotificationFrequency;
    types: {
      alerts: boolean;
      reports: boolean;
      maintenance: boolean;
      system: boolean;
    };
  };
  push: {
    enabled: boolean;
    frequency: NotificationFrequency;
    types: {
      alerts: boolean;
      reports: boolean;
      maintenance: boolean;
      system: boolean;
    };
  };
  thresholds: {
    energyConsumption: number;
    cost: number;
    deviceStatus: boolean;
  };
  quietHours?: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  sound?: {
    enabled: boolean;
    type: 'default' | 'bell' | 'chime' | 'ding';
  };
}

export interface DisplayPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  currency: string;
  units: {
    energy: 'kWh' | 'MWh' | 'GWh';
    power: 'W' | 'kW' | 'MW';
    temperature: 'C' | 'F';
    distance: 'm' | 'ft';
  };
  charts: {
    defaultTimeRange: TimeRange;
    showGrid: boolean;
    showLegend: boolean;
    animation: boolean;
  };
}

export interface DataPreferences {
  autoBackup: boolean;
  backupFrequency: NotificationFrequency;
  retentionPeriod: number; // in days
  exportFormat: ExportFormat;
  dataSharing: {
    analytics: boolean;
    diagnostics: boolean;
    marketing: boolean;
  };
  privacy: {
    showDeviceNames: boolean;
    showLocation: boolean;
    showEnergyData: boolean;
  };
}

export interface UserSettings {
  id?: string;
  userId: string;
  notifications: NotificationPreferences;
  display: DisplayPreferences;
  data: DataPreferences;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  version: number;
}

// Firestore data converter
export const settingsConverter: FirestoreDataConverter<UserSettings, DocumentData> = {
  toFirestore: (settings: WithFieldValue<UserSettings>): DocumentData => {
    return {
      userId: settings.userId,
      notifications: settings.notifications,
      display: settings.display,
      data: settings.data,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
      version: settings.version,
    };
  },

  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>): UserSettings => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId,
      notifications: data.notifications,
      display: data.display,
      data: data.data,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      version: data.version,
    };
  },
}; 