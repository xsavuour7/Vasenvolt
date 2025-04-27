import { Timestamp, DocumentData, WithFieldValue, FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase/firestore';
import { Device } from './types';

export type GroupType = 'location' | 'function' | 'system' | 'custom';
export type GroupStatus = 'active' | 'inactive' | 'maintenance' | 'archived';

export interface GroupMetadata {
  createdAt: Date;
  lastUpdated: Date;
  version: number;
  tags: string[];
  notes?: string;
}

export interface BaseGroup {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: GroupType;
  status: GroupStatus;
  deviceIds: string[];
  metadata: GroupMetadata;
}

export interface LocationGroup extends BaseGroup {
  type: 'location';
  location: {
    building: string;
    floor?: string;
    room?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface FunctionGroup extends BaseGroup {
  type: 'function';
  function: {
    category: string;
    subcategory?: string;
    purpose: string;
  };
}

export interface SystemGroup extends BaseGroup {
  type: 'system';
  system: {
    type: string;
    subsystem?: string;
    dependencies: string[];
  };
}

export interface CustomGroup extends BaseGroup {
  type: 'custom';
  custom: {
    attributes: Record<string, any>;
  };
}

export type DeviceGroup = LocationGroup | FunctionGroup | SystemGroup | CustomGroup;

// Firestore data converter
export const deviceGroupConverter: FirestoreDataConverter<DeviceGroup, DocumentData> = {
  toFirestore: (data: WithFieldValue<DeviceGroup>): DocumentData => {
    const group = data as DeviceGroup;
    const baseData = {
      userId: group.userId,
      name: group.name,
      description: group.description,
      type: group.type,
      status: group.status,
      deviceIds: group.deviceIds,
      metadata: {
        createdAt: Timestamp.fromDate(group.metadata.createdAt),
        lastUpdated: Timestamp.fromDate(group.metadata.lastUpdated),
        version: group.metadata.version,
        tags: group.metadata.tags,
        notes: group.metadata.notes
      }
    };

    switch (group.type) {
      case 'location':
        return {
          ...baseData,
          location: group.location
        };
      case 'function':
        return {
          ...baseData,
          function: group.function
        };
      case 'system':
        return {
          ...baseData,
          system: group.system
        };
      case 'custom':
        return {
          ...baseData,
          custom: group.custom
        };
    }
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>): DeviceGroup => {
    const data = snapshot.data();
    const baseGroup = {
      id: snapshot.id,
      userId: data.userId,
      name: data.name,
      description: data.description,
      type: data.type,
      status: data.status,
      deviceIds: data.deviceIds,
      metadata: {
        createdAt: data.metadata.created.createdAt.toDate(),
        lastUpdated: data.metadata.lastUpdated.toDate(),
        version: data.metadata.version,
        tags: data.metadata.tags,
        notes: data.metadata.notes
      }
    };

    switch (data.type) {
      case 'location':
        return {
          ...baseGroup,
          location: data.location
        } as LocationGroup;
      case 'function':
        return {
          ...baseGroup,
          function: data.function
        } as FunctionGroup;
      case 'system':
        return {
          ...baseGroup,
          system: data.system
        } as SystemGroup;
      case 'custom':
        return {
          ...baseGroup,
          custom: data.custom
        } as CustomGroup;
      default:
        throw new Error(`Unknown group type: ${data.type}`);
    }
  }
}; 