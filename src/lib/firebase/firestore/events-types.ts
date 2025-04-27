import { Timestamp, DocumentData, WithFieldValue, FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase/firestore';
import { DeviceType } from './device-types';
import { GroupType } from './device-groups-types';

export type EventType = 'system' | 'user' | 'device' | 'energy' | 'security' | 'maintenance' | 'audit';
export type EventSeverity = 'info' | 'warning' | 'error' | 'critical';
export type EventStatus = 'active' | 'resolved' | 'archived';

export interface EventMetadata {
  createdAt: Date;
  lastUpdated: Date;
  resolvedAt?: Date;
  archivedAt?: Date;
  expiresAt?: Date;
  version: number;
  tags: string[];
  notes?: string;
}

export interface BaseEvent {
  id: string;
  userId: string;
  type: EventType;
  severity: EventSeverity;
  status: EventStatus;
  title: string;
  description: string;
  metadata: EventMetadata;
}

export interface SystemEvent extends BaseEvent {
  type: 'system';
  component: string;
  action: string;
  details: Record<string, any>;
}

export interface UserEvent extends BaseEvent {
  type: 'user';
  action: string;
  target: string;
  details: Record<string, any>;
}

export interface DeviceEvent extends BaseEvent {
  type: 'device';
  deviceId: string;
  deviceType: DeviceType;
  action: string;
  details: Record<string, any>;
}

export interface EnergyEvent extends BaseEvent {
  type: 'energy';
  source: 'solar' | 'battery' | 'grid' | 'generator';
  action: string;
  value: number;
  unit: string;
  details: Record<string, any>;
}

export interface SecurityEvent extends BaseEvent {
  type: 'security';
  action: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
}

export interface MaintenanceEvent extends BaseEvent {
  type: 'maintenance';
  deviceId: string;
  action: string;
  maintenanceType: 'preventive' | 'corrective' | 'predictive';
  details: Record<string, any>;
}

export interface AuditEvent extends BaseEvent {
  type: 'audit';
  action: string;
  target: string;
  changes: Record<string, { old: any; new: any }>;
  details: Record<string, any>;
}

export type Event = SystemEvent | UserEvent | DeviceEvent | EnergyEvent | SecurityEvent | MaintenanceEvent | AuditEvent;

export const eventConverter: FirestoreDataConverter<Event, DocumentData> = {
  toFirestore: (data: WithFieldValue<Event>): DocumentData => {
    const event = data as Event;
    const baseData = {
      userId: event.userId,
      type: event.type,
      severity: event.severity,
      status: event.status,
      title: event.title,
      description: event.description,
      metadata: {
        createdAt: Timestamp.fromDate(event.metadata.createdAt),
        lastUpdated: Timestamp.fromDate(event.metadata.lastUpdated),
        resolvedAt: event.metadata.resolvedAt ? Timestamp.fromDate(event.metadata.resolvedAt) : null,
        archivedAt: event.metadata.archivedAt ? Timestamp.fromDate(event.metadata.archivedAt) : null,
        expiresAt: event.metadata.expiresAt ? Timestamp.fromDate(event.metadata.expiresAt) : null,
        version: event.metadata.version,
        tags: event.metadata.tags,
        notes: event.metadata.notes
      }
    };

    switch (event.type) {
      case 'system':
        return {
          ...baseData,
          component: event.component,
          action: event.action,
          details: event.details
        };
      case 'user':
        return {
          ...baseData,
          action: event.action,
          target: event.target,
          details: event.details
        };
      case 'device':
        return {
          ...baseData,
          deviceId: event.deviceId,
          deviceType: event.deviceType,
          action: event.action,
          details: event.details
        };
      case 'energy':
        return {
          ...baseData,
          source: event.source,
          action: event.action,
          value: event.value,
          unit: event.unit,
          details: event.details
        };
      case 'security':
        return {
          ...baseData,
          action: event.action,
          level: event.level,
          details: event.details
        };
      case 'maintenance':
        return {
          ...baseData,
          deviceId: event.deviceId,
          action: event.action,
          maintenanceType: event.maintenanceType,
          details: event.details
        };
      case 'audit':
        return {
          ...baseData,
          action: event.action,
          target: event.target,
          changes: event.changes,
          details: event.details
        };
    }
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>): Event => {
    const data = snapshot.data();
    const baseEvent = {
      id: snapshot.id,
      userId: data.userId,
      type: data.type,
      severity: data.severity,
      status: data.status,
      title: data.title,
      description: data.description,
      metadata: {
        createdAt: data.metadata.createdAt.toDate(),
        lastUpdated: data.metadata.lastUpdated.toDate(),
        resolvedAt: data.metadata.resolvedAt?.toDate(),
        archivedAt: data.metadata.archivedAt?.toDate(),
        expiresAt: data.metadata.expiresAt?.toDate(),
        version: data.metadata.version,
        tags: data.metadata.tags,
        notes: data.metadata.notes
      }
    };

    switch (data.type) {
      case 'system':
        return {
          ...baseEvent,
          component: data.component,
          action: data.action,
          details: data.details
        } as SystemEvent;
      case 'user':
        return {
          ...baseEvent,
          action: data.action,
          target: data.target,
          details: data.details
        } as UserEvent;
      case 'device':
        return {
          ...baseEvent,
          deviceId: data.deviceId,
          deviceType: data.deviceType,
          action: data.action,
          details: data.details
        } as DeviceEvent;
      case 'energy':
        return {
          ...baseEvent,
          source: data.source,
          action: data.action,
          value: data.value,
          unit: data.unit,
          details: data.details
        } as EnergyEvent;
      case 'security':
        return {
          ...baseEvent,
          action: data.action,
          level: data.level,
          details: data.details
        } as SecurityEvent;
      case 'maintenance':
        return {
          ...baseEvent,
          deviceId: data.deviceId,
          action: data.action,
          maintenanceType: data.maintenanceType,
          details: data.details
        } as MaintenanceEvent;
      case 'audit':
        return {
          ...baseEvent,
          action: data.action,
          target: data.target,
          changes: data.changes,
          details: data.details
        } as AuditEvent;
      default:
        throw new Error(`Unknown event type: ${data.type}`);
    }
  }
}; 