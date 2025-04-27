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
  orderBy,
  limit as firestoreLimit,
  Timestamp,
  onSnapshot,
  Unsubscribe,
  startAfter,
  endBefore,
  WithFieldValue,
  writeBatch,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { Device } from './types';
import { DeviceType } from './device-types';
import {
  DeviceGroup,
  GroupType,
  GroupStatus,
  deviceGroupConverter,
  LocationGroup,
  FunctionGroup,
  SystemGroup,
  CustomGroup
} from './device-groups-types';

export class DeviceGroupsService {
  private static readonly COLLECTION = 'deviceGroups';

  // Basic CRUD Operations
  static async getGroup(groupId: string): Promise<DeviceGroup | null> {
    if (!firestore) throw new Error('Firestore not initialized');
    const groupRef = doc(firestore, this.COLLECTION, groupId).withConverter(deviceGroupConverter);
    const snapshot = await getDoc(groupRef);
    return snapshot.exists() ? snapshot.data() : null;
  }

  static async getGroupsByUser(
    userId: string,
    options: {
      type?: GroupType;
      status?: GroupStatus;
      limit?: number;
      startAfter?: string;
    } = {}
  ): Promise<DeviceGroup[]> {
    if (!firestore) throw new Error('Firestore not initialized');
    const groupRef = collection(firestore, this.COLLECTION).withConverter(deviceGroupConverter);
    let q = query(groupRef, where('userId', '==', userId));

    if (options.type) q = query(q, where('type', '==', options.type));
    if (options.status) q = query(q, where('status', '==', options.status));
    if (options.limit) q = query(q, firestoreLimit(options.limit));
    if (options.startAfter) {
      const lastDoc = await getDoc(doc(firestore, this.COLLECTION, options.startAfter));
      if (lastDoc.exists()) {
        q = query(q, startAfter(lastDoc));
      }
    }

    q = query(q, orderBy('metadata.createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  static async createGroup(group: Omit<DeviceGroup, 'id' | 'metadata'>): Promise<DeviceGroup> {
    if (!firestore) throw new Error('Firestore not initialized');
    const groupRef = collection(firestore, this.COLLECTION).withConverter(deviceGroupConverter);
    const metadata = {
      createdAt: Timestamp.now(),
      lastUpdated: Timestamp.now(),
      version: 1,
      tags: [],
      notes: ''
    };
    const docRef = await addDoc(groupRef, { ...group, metadata } as unknown as WithFieldValue<DeviceGroup>);
    const snapshot = await getDoc(docRef.withConverter(deviceGroupConverter));
    return snapshot.data()!;
  }

  static async updateGroup(
    groupId: string,
    updates: Partial<Omit<DeviceGroup, 'id' | 'userId' | 'type' | 'metadata'>>
  ): Promise<void> {
    if (!firestore) throw new Error('Firestore not initialized');
    const groupRef = doc(firestore, this.COLLECTION, groupId).withConverter(deviceGroupConverter);
    const metadata = {
      lastUpdated: Timestamp.now()
    };
    await updateDoc(groupRef, { ...updates, metadata });
  }

  static async deleteGroup(groupId: string): Promise<void> {
    if (!firestore) throw new Error('Firestore not initialized');
    const groupRef = doc(firestore, this.COLLECTION, groupId);
    await deleteDoc(groupRef);
  }

  // Device Management
  static async addDeviceToGroup(groupId: string, deviceId: string): Promise<void> {
    if (!firestore) throw new Error('Firestore not initialized');
    const groupRef = doc(firestore, this.COLLECTION, groupId);
    await updateDoc(groupRef, {
      deviceIds: arrayUnion(deviceId),
      metadata: {
        lastUpdated: Timestamp.now()
      }
    });
  }

  static async removeDeviceFromGroup(groupId: string, deviceId: string): Promise<void> {
    if (!firestore) throw new Error('Firestore not initialized');
    const groupRef = doc(firestore, this.COLLECTION, groupId);
    await updateDoc(groupRef, {
      deviceIds: arrayRemove(deviceId),
      metadata: {
        lastUpdated: Timestamp.now()
      }
    });
  }

  static async addDevicesToGroup(groupId: string, deviceIds: string[]): Promise<void> {
    const groupRef = doc(firestore, this.COLLECTION, groupId);
    const batch = writeBatch(firestore);
    
    deviceIds.forEach(deviceId => {
      batch.update(groupRef, {
        deviceIds: arrayUnion(deviceId),
      });
    });
    
    batch.update(groupRef, {
      updatedAt: new Date(),
    });
    
    await batch.commit();
  }

  static async removeDevicesFromGroup(groupId: string, deviceIds: string[]): Promise<void> {
    const groupRef = doc(firestore, this.COLLECTION, groupId);
    const batch = writeBatch(firestore);
    
    deviceIds.forEach(deviceId => {
      batch.update(groupRef, {
        deviceIds: arrayRemove(deviceId),
      });
    });
    
    batch.update(groupRef, {
      updatedAt: new Date(),
    });
    
    await batch.commit();
  }

  // Group Operations
  static async mergeGroups(groupIds: string[], newGroup: Omit<DeviceGroup, 'id' | 'metadata'>): Promise<DeviceGroup> {
    if (!firestore) throw new Error('Firestore not initialized');
    
    // Get all groups to merge
    const groups = await Promise.all(groupIds.map(id => this.getGroup(id)));
    const validGroups = groups.filter((group): group is DeviceGroup => group !== null);
    
    if (validGroups.length === 0) {
      throw new Error('No valid groups to merge');
    }

    // Combine device IDs
    const combinedDeviceIds = [...new Set(validGroups.flatMap(group => group.deviceIds))];
    
    // Create new merged group
    const mergedGroup = await this.createGroup({
      ...newGroup,
      deviceIds: combinedDeviceIds
    });

    // Delete old groups
    await Promise.all(groupIds.map(id => this.deleteGroup(id)));

    return mergedGroup;
  }

  static async splitGroup(
    groupId: string,
    newGroups: Array<Omit<DeviceGroup, 'id' | 'metadata'>>
  ): Promise<DeviceGroup[]> {
    if (!firestore) throw new Error('Firestore not initialized');
    
    const originalGroup = await this.getGroup(groupId);
    if (!originalGroup) {
      throw new Error('Group not found');
    }

    // Create new groups
    const createdGroups = await Promise.all(
      newGroups.map(group => this.createGroup(group))
    );

    // Delete original group
    await this.deleteGroup(groupId);

    return createdGroups;
  }

  // Real-time Listeners
  static onGroupUpdate(
    groupId: string,
    callback: (group: DeviceGroup | null) => void
  ): Unsubscribe {
    if (!firestore) throw new Error('Firestore not initialized');
    const groupRef = doc(firestore, this.COLLECTION, groupId).withConverter(deviceGroupConverter);
    return onSnapshot(groupRef, (snapshot) => {
      callback(snapshot.exists() ? snapshot.data() : null);
    });
  }

  static onUserGroupsUpdate(
    userId: string,
    callback: (groups: DeviceGroup[]) => void,
    options: {
      type?: GroupType;
      status?: GroupStatus;
      limit?: number;
    } = {}
  ): Unsubscribe {
    if (!firestore) throw new Error('Firestore not initialized');
    const groupRef = collection(firestore, this.COLLECTION).withConverter(deviceGroupConverter);
    let q = query(groupRef, where('userId', '==', userId));

    if (options.type) q = query(q, where('type', '==', options.type));
    if (options.status) q = query(q, where('status', '==', options.status));
    if (options.limit) q = query(q, firestoreLimit(options.limit));

    q = query(q, orderBy('metadata.createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data()));
    });
  }

  // Utility Methods
  static async getGroupStats(userId: string): Promise<{
    total: number;
    byType: Record<GroupType, number>;
    byStatus: Record<GroupStatus, number>;
    totalDevices: number;
    averageDevicesPerGroup: number;
  }> {
    if (!firestore) throw new Error('Firestore not initialized');
    const groupRef = collection(firestore, this.COLLECTION).withConverter(deviceGroupConverter);
    const q = query(groupRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    const stats = {
      total: 0,
      byType: {} as Record<GroupType, number>,
      byStatus: {} as Record<GroupStatus, number>,
      totalDevices: 0,
      averageDevicesPerGroup: 0
    };

    snapshot.docs.forEach(doc => {
      const group = doc.data();
      stats.total++;
      stats.byType[group.type] = (stats.byType[group.type] || 0) + 1;
      stats.byStatus[group.status] = (stats.byStatus[group.status] || 0) + 1;
      stats.totalDevices += group.deviceIds.length;
    });

    stats.averageDevicesPerGroup = stats.total > 0 ? stats.totalDevices / stats.total : 0;

    return stats;
  }
} 