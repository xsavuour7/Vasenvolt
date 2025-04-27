import { Timestamp, DocumentData, WithFieldValue, FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase/firestore';

export type UserRole = 'admin' | 'manager' | 'user' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';
export type SubscriptionPlan = 'free' | 'basic' | 'pro' | 'enterprise';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
    showLocation: boolean;
  };
}

export interface UserProfile {
  id?: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  role: UserRole;
  status: UserStatus;
  subscription: {
    plan: SubscriptionPlan;
    startDate: Timestamp;
    endDate?: Timestamp;
    autoRenew: boolean;
  };
  preferences: UserPreferences;
  metadata: {
    lastLogin: Timestamp;
    lastActive: Timestamp;
    loginCount: number;
    devices: string[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
  };
}

export interface UserStats {
  userId: string;
  devices: {
    total: number;
    active: number;
    offline: number;
  };
  energy: {
    totalConsumption: number;
    averageDaily: number;
    peakUsage: number;
    savings: number;
  };
  notifications: {
    total: number;
    unread: number;
    alerts: number;
    reports: number;
  };
  lastUpdated: Timestamp;
}

// Firestore data converter
export const userProfileConverter: FirestoreDataConverter<UserProfile, DocumentData> = {
  toFirestore: (profile: WithFieldValue<UserProfile>): DocumentData => {
    return {
      uid: profile.uid,
      email: profile.email,
      displayName: profile.displayName,
      photoURL: profile.photoURL,
      phoneNumber: profile.phoneNumber,
      role: profile.role,
      status: profile.status,
      subscription: {
        plan: profile.subscription.plan,
        startDate: profile.subscription.startDate,
        endDate: profile.subscription.endDate,
        autoRenew: profile.subscription.autoRenew,
      },
      preferences: {
        theme: profile.preferences.theme,
        language: profile.preferences.language,
        timezone: profile.preferences.timezone,
        notifications: {
          email: profile.preferences.notifications.email,
          push: profile.preferences.notifications.push,
          frequency: profile.preferences.notifications.frequency,
        },
        privacy: {
          showEmail: profile.preferences.privacy.showEmail,
          showPhone: profile.preferences.privacy.showPhone,
          showLocation: profile.preferences.privacy.showLocation,
        },
      },
      metadata: {
        lastLogin: profile.metadata.lastLogin,
        lastActive: profile.metadata.lastActive,
        loginCount: profile.metadata.loginCount,
        devices: profile.metadata.devices,
        createdAt: profile.metadata.createdAt,
        updatedAt: profile.metadata.updatedAt,
      },
    };
  },

  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>): UserProfile => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      uid: data.uid,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      phoneNumber: data.phoneNumber,
      role: data.role,
      status: data.status,
      subscription: {
        plan: data.subscription.plan,
        startDate: data.subscription.startDate,
        endDate: data.subscription.endDate,
        autoRenew: data.subscription.autoRenew,
      },
      preferences: {
        theme: data.preferences.theme,
        language: data.preferences.language,
        timezone: data.preferences.timezone,
        notifications: {
          email: data.preferences.notifications.email,
          push: data.preferences.notifications.push,
          frequency: data.preferences.notifications.frequency,
        },
        privacy: {
          showEmail: data.preferences.privacy.showEmail,
          showPhone: data.preferences.privacy.showPhone,
          showLocation: data.preferences.privacy.showLocation,
        },
      },
      metadata: {
        lastLogin: data.metadata.lastLogin,
        lastActive: data.metadata.lastActive,
        loginCount: data.metadata.loginCount,
        devices: data.metadata.devices,
        createdAt: data.metadata.createdAt,
        updatedAt: data.metadata.updatedAt,
      },
    };
  },
};

export const userStatsConverter: FirestoreDataConverter<UserStats, DocumentData> = {
  toFirestore: (stats: WithFieldValue<UserStats>): DocumentData => {
    return {
      userId: stats.userId,
      devices: {
        total: stats.devices.total,
        active: stats.devices.active,
        offline: stats.devices.offline,
      },
      energy: {
        totalConsumption: stats.energy.totalConsumption,
        averageDaily: stats.energy.averageDaily,
        peakUsage: stats.energy.peakUsage,
        savings: stats.energy.savings,
      },
      notifications: {
        total: stats.notifications.total,
        unread: stats.notifications.unread,
        alerts: stats.notifications.alerts,
        reports: stats.notifications.reports,
      },
      lastUpdated: stats.lastUpdated,
    };
  },

  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>): UserStats => {
    const data = snapshot.data();
    return {
      userId: data.userId,
      devices: {
        total: data.devices.total,
        active: data.devices.active,
        offline: data.devices.offline,
      },
      energy: {
        totalConsumption: data.energy.totalConsumption,
        averageDaily: data.energy.averageDaily,
        peakUsage: data.energy.peakUsage,
        savings: data.energy.savings,
      },
      notifications: {
        total: data.notifications.total,
        unread: data.notifications.unread,
        alerts: data.notifications.alerts,
        reports: data.notifications.reports,
      },
      lastUpdated: data.lastUpdated,
    };
  },
}; 