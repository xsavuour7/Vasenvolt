import { BaseDevice, DeviceStatus } from './device-types';

// User Profile
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  lastLogin: Date;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    language: string;
  };
}

// Analytics Data
export interface AnalyticsData {
  id: string;
  userId: string;
  timestamp: Date;
  energyConsumption: number;
  peakHours: string[];
  cost: number;
  deviceUsage: {
    [deviceId: string]: {
      consumption: number;
      duration: number;
    };
  };
}

// Report
export interface Report {
  id: string;
  userId: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate: Date;
  endDate: Date;
  data: AnalyticsData[];
  createdAt: Date;
  status: 'pending' | 'completed' | 'failed';
}

// Recommendation
export interface Recommendation {
  id: string;
  userId: string;
  type: 'energy_saving' | 'cost_reduction' | 'efficiency';
  title: string;
  description: string;
  impact: {
    savings: number;
    reduction: number;
  };
  status: 'pending' | 'applied' | 'dismissed';
  createdAt: Date;
  appliedAt?: Date;
}

// Settings
export interface UserSettings {
  userId: string;
  notifications: {
    email: boolean;
    push: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
  };
  dataCollection: {
    interval: number; // minutes
    devices: string[];
  };
  billing: {
    plan: 'free' | 'basic' | 'premium';
    paymentMethod?: string;
    nextBillingDate?: Date;
  };
}

export interface Device extends BaseDevice {
  id: string;
  status: DeviceStatus;
  lastUpdated: Date;
  powerConsumption?: number;
  settings: {
    autoPowerOff?: boolean;
    powerThreshold?: number;
    operatingMode?: 'normal' | 'eco' | 'performance';
    temperatureThreshold?: number;
    voltageThreshold?: number;
    schedule?: {
      startTime?: string;
      endTime?: string;
    };
    [key: string]: any;
  };
} 