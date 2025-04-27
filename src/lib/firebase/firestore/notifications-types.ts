import { Timestamp, DocumentData, WithFieldValue, FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase/firestore';

export type NotificationType = 'alert' | 'report' | 'system' | 'device' | 'energy' | 'maintenance' | 'security';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';
export type NotificationStatus = 'unread' | 'read' | 'archived';
export type NotificationChannel = 'email' | 'push' | 'in-app' | 'sms';

export interface BaseNotification {
  id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  channels: NotificationChannel[];
  metadata: {
    createdAt: Timestamp;
    readAt?: Timestamp;
    archivedAt?: Timestamp;
    expiresAt?: Timestamp;
  };
}

export interface AlertNotification extends BaseNotification {
  type: 'alert';
  alertId: string;
  alertType: string;
  severity: string;
}

export interface ReportNotification extends BaseNotification {
  type: 'report';
  reportId: string;
  reportType: string;
  downloadUrl?: string;
}

export interface SystemNotification extends BaseNotification {
  type: 'system';
  component: string;
  action?: string;
  details?: Record<string, unknown>;
}

export interface DeviceNotification extends BaseNotification {
  type: 'device';
  deviceId: string;
  deviceName: string;
  eventType: string;
  metrics?: Record<string, unknown>;
}

export interface EnergyNotification extends BaseNotification {
  type: 'energy';
  consumption: number;
  threshold: number;
  timeRange: string;
  savings?: number;
}

export interface MaintenanceNotification extends BaseNotification {
  type: 'maintenance';
  deviceId: string;
  deviceName: string;
  maintenanceType: string;
  dueDate: Timestamp;
  instructions?: string;
}

export interface SecurityNotification extends BaseNotification {
  type: 'security';
  eventType: string;
  ipAddress?: string;
  location?: string;
  deviceInfo?: string;
}

export type Notification = 
  | AlertNotification 
  | ReportNotification 
  | SystemNotification 
  | DeviceNotification 
  | EnergyNotification 
  | MaintenanceNotification 
  | SecurityNotification;

// Firestore data converter
export const notificationConverter: FirestoreDataConverter<Notification, DocumentData> = {
  toFirestore: (notification: WithFieldValue<Notification>): DocumentData => {
    const baseData = {
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      status: notification.status,
      channels: notification.channels,
      metadata: {
        createdAt: notification.metadata.createdAt,
        readAt: notification.metadata.readAt,
        archivedAt: notification.metadata.archivedAt,
        expiresAt: notification.metadata.expiresAt,
      },
    };

    // Add type-specific fields
    switch (notification.type) {
      case 'alert':
        return {
          ...baseData,
          alertId: notification.alertId,
          alertType: notification.alertType,
          severity: notification.severity,
        };
      case 'report':
        return {
          ...baseData,
          reportId: notification.reportId,
          reportType: notification.reportType,
          downloadUrl: notification.downloadUrl,
        };
      case 'system':
        return {
          ...baseData,
          component: notification.component,
          action: notification.action,
          details: notification.details,
        };
      case 'device':
        return {
          ...baseData,
          deviceId: notification.deviceId,
          deviceName: notification.deviceName,
          eventType: notification.eventType,
          metrics: notification.metrics,
        };
      case 'energy':
        return {
          ...baseData,
          consumption: notification.consumption,
          threshold: notification.threshold,
          timeRange: notification.timeRange,
          savings: notification.savings,
        };
      case 'maintenance':
        return {
          ...baseData,
          deviceId: notification.deviceId,
          deviceName: notification.deviceName,
          maintenanceType: notification.maintenanceType,
          dueDate: notification.dueDate,
          instructions: notification.instructions,
        };
      case 'security':
        return {
          ...baseData,
          eventType: notification.eventType,
          ipAddress: notification.ipAddress,
          location: notification.location,
          deviceInfo: notification.deviceInfo,
        };
      default:
        return baseData;
    }
  },

  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>): Notification => {
    const data = snapshot.data();
    const baseNotification = {
      id: snapshot.id,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      priority: data.priority,
      status: data.status,
      channels: data.channels,
      metadata: {
        createdAt: data.metadata.createdAt,
        readAt: data.metadata.readAt,
        archivedAt: data.metadata.archivedAt,
        expiresAt: data.metadata.expiresAt,
      },
    };

    // Add type-specific fields
    switch (data.type) {
      case 'alert':
        return {
          ...baseNotification,
          alertId: data.alertId,
          alertType: data.alertType,
          severity: data.severity,
        } as AlertNotification;
      case 'report':
        return {
          ...baseNotification,
          reportId: data.reportId,
          reportType: data.reportType,
          downloadUrl: data.downloadUrl,
        } as ReportNotification;
      case 'system':
        return {
          ...baseNotification,
          component: data.component,
          action: data.action,
          details: data.details,
        } as SystemNotification;
      case 'device':
        return {
          ...baseNotification,
          deviceId: data.deviceId,
          deviceName: data.deviceName,
          eventType: data.eventType,
          metrics: data.metrics,
        } as DeviceNotification;
      case 'energy':
        return {
          ...baseNotification,
          consumption: data.consumption,
          threshold: data.threshold,
          timeRange: data.timeRange,
          savings: data.savings,
        } as EnergyNotification;
      case 'maintenance':
        return {
          ...baseNotification,
          deviceId: data.deviceId,
          deviceName: data.deviceName,
          maintenanceType: data.maintenanceType,
          dueDate: data.dueDate,
          instructions: data.instructions,
        } as MaintenanceNotification;
      case 'security':
        return {
          ...baseNotification,
          eventType: data.eventType,
          ipAddress: data.ipAddress,
          location: data.location,
          deviceInfo: data.deviceInfo,
        } as SecurityNotification;
      default:
        return baseNotification as Notification;
    }
  },
}; 