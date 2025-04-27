import { Timestamp, DocumentData, WithFieldValue, FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase/firestore';
import { convertToTimestamps, convertToDates } from '../utils/date-utils';

export type AlertType = 'system' | 'device' | 'energy' | 'security' | 'maintenance' | 'performance';
export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'archived';
export type AlertPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface AlertMetadata {
  createdAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  archivedAt?: Date;
  expiresAt?: Date;
  version: number;
  tags: string[];
  notes?: string;
}

export interface BaseAlert {
  id: string;
  userId: string;
  type: AlertType;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  priority: AlertPriority;
  metadata: AlertMetadata;
}

export interface SystemAlert extends BaseAlert {
  type: 'system';
  component: string;
  errorCode?: string;
  stackTrace?: string;
  context: Record<string, any>;
}

export interface DeviceAlert extends BaseAlert {
  type: 'device';
  deviceId: string;
  deviceType: string;
  metrics: {
    value: number;
    threshold: number;
    unit: string;
  };
}

export interface EnergyAlert extends BaseAlert {
  type: 'energy';
  source: string;
  metrics: {
    value: number;
    threshold: number;
    unit: string;
  };
}

export interface SecurityAlert extends BaseAlert {
  type: 'security';
  eventType: string;
  source: string;
  location?: string;
  context: Record<string, any>;
}

export interface MaintenanceAlert extends BaseAlert {
  type: 'maintenance';
  deviceId: string;
  maintenanceType: string;
  dueDate: Date;
  lastMaintenance?: Date;
}

export interface PerformanceAlert extends BaseAlert {
  type: 'performance';
  component: string;
  metrics: {
    value: number;
    threshold: number;
    unit: string;
  };
}

export type Alert = SystemAlert | DeviceAlert | EnergyAlert | SecurityAlert | MaintenanceAlert | PerformanceAlert;

const DATE_PATHS = [
  'metadata.createdAt',
  'metadata.acknowledgedAt',
  'metadata.resolvedAt',
  'metadata.archivedAt',
  'metadata.expiresAt',
  'dueDate',
  'lastMaintenance'
];

export const alertConverter: FirestoreDataConverter<Alert> = {
  toFirestore(alert: WithFieldValue<Alert>): DocumentData {
    return convertToTimestamps(alert, DATE_PATHS);
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Alert {
    const data = snapshot.data();
    return convertToDates(data, DATE_PATHS) as Alert;
  }
}; 