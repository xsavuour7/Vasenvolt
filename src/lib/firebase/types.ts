import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  lastLogin: Timestamp;
  role: 'user' | 'admin';
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    language: string;
  };
}

export interface AnalyticsData {
  id: string;
  userId: string;
  timestamp: Timestamp;
  energyConsumption: {
    total: number;
    peak: number;
    offPeak: number;
  };
  peakHours: {
    start: string;
    end: string;
  };
  cost: {
    total: number;
    peak: number;
    offPeak: number;
  };
  deviceUsage: {
    [deviceId: string]: {
      consumption: number;
      duration: number;
      cost: number;
    };
  };
}

export interface Report {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Timestamp;
  period: {
    start: Timestamp;
    end: Timestamp;
  };
  summary: {
    totalConsumption: number;
    totalCost: number;
    peakUsage: number;
    recommendations: string[];
  };
}

export interface Recommendation {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Timestamp;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'dismissed';
  category: 'energy' | 'cost' | 'usage' | 'maintenance';
}

export interface UserSettings {
  userId: string;
  notifications: {
    email: boolean;
    push: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
  };
  dataCollection: {
    enabled: boolean;
    frequency: 'hourly' | 'daily' | 'weekly';
    devices: string[];
  };
  billing: {
    plan: 'free' | 'basic' | 'premium';
    paymentMethod?: string;
    billingCycle: 'monthly' | 'yearly';
  };
} 