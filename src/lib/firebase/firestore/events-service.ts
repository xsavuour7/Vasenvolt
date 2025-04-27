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
} from 'firebase/firestore';
import {
  Event,
  EventType,
  EventSeverity,
  EventStatus,
  eventConverter,
  SystemEvent,
  UserEvent,
  DeviceEvent,
  EnergyEvent,
  SecurityEvent,
  MaintenanceEvent,
  AuditEvent,
} from './events-types';
import { DeviceType } from './device-types';

export class EventsService {
  private static readonly COLLECTION = 'events';

  // Basic CRUD Operations
  static async getEvent(eventId: string): Promise<Event | null> {
    if (!firestore) throw new Error('Firestore not initialized');
    const eventRef = doc(firestore, this.COLLECTION, eventId).withConverter(eventConverter);
    const snapshot = await getDoc(eventRef);
    return snapshot.exists() ? snapshot.data() : null;
  }

  static async getEventsByUser(
    userId: string,
    options: {
      type?: EventType;
      severity?: EventSeverity;
      status?: EventStatus;
      limit?: number;
      startAfter?: string;
    } = {}
  ): Promise<Event[]> {
    if (!firestore) throw new Error('Firestore not initialized');
    const eventRef = collection(firestore, this.COLLECTION).withConverter(eventConverter);
    let q = query(eventRef, where('userId', '==', userId));

    if (options.type) q = query(q, where('type', '==', options.type));
    if (options.severity) q = query(q, where('severity', '==', options.severity));
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

  static async createEvent(event: Omit<Event, 'id' | 'metadata'>): Promise<Event> {
    if (!firestore) throw new Error('Firestore not initialized');
    const eventRef = collection(firestore, this.COLLECTION).withConverter(eventConverter);
    const metadata = {
      createdAt: Timestamp.now(),
      lastUpdated: Timestamp.now(),
      version: 1,
      tags: [],
      notes: ''
    };
    const docRef = await addDoc(eventRef, { ...event, metadata } as unknown as WithFieldValue<Event>);
    const snapshot = await getDoc(docRef.withConverter(eventConverter));
    return snapshot.data()!;
  }

  static async updateEvent(
    eventId: string,
    updates: Partial<Omit<Event, 'id' | 'userId' | 'type' | 'metadata'>>
  ): Promise<void> {
    if (!firestore) throw new Error('Firestore not initialized');
    const eventRef = doc(firestore, this.COLLECTION, eventId).withConverter(eventConverter);
    const metadata = {
      lastUpdated: Timestamp.now()
    };
    await updateDoc(eventRef, { ...updates, metadata });
  }

  static async deleteEvent(eventId: string): Promise<void> {
    if (!firestore) throw new Error('Firestore not initialized');
    const eventRef = doc(firestore, this.COLLECTION, eventId);
    await deleteDoc(eventRef);
  }

  // Status Management
  static async markAsResolved(eventId: string): Promise<void> {
    if (!firestore) throw new Error('Firestore not initialized');
    const eventRef = doc(firestore, this.COLLECTION, eventId).withConverter(eventConverter);
    const metadata = {
      lastUpdated: Timestamp.now(),
      resolvedAt: Timestamp.now()
    };
    await updateDoc(eventRef, { status: 'resolved', metadata });
  }

  static async markAsArchived(eventId: string): Promise<void> {
    if (!firestore) throw new Error('Firestore not initialized');
    const eventRef = doc(firestore, this.COLLECTION, eventId).withConverter(eventConverter);
    const metadata = {
      lastUpdated: Timestamp.now(),
      archivedAt: Timestamp.now()
    };
    await updateDoc(eventRef, { status: 'archived', metadata });
  }

  // Batch Operations
  static async markAllAsResolved(
    options: {
      type?: EventType;
      severity?: EventSeverity;
      source?: string;
    } = {}
  ): Promise<void> {
    const eventsRef = collection(firestore, this.COLLECTION);
    let q = query(eventsRef, where('status', '==', 'active'));

    if (options.type) {
      q = query(q, where('type', '==', options.type));
    }
    if (options.severity) {
      q = query(q, where('severity', '==', options.severity));
    }
    if (options.source) {
      q = query(q, where('source', '==', options.source));
    }

    const snapshot = await getDocs(q);
    const batch = writeBatch(firestore);
    const now = Timestamp.now();
    
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        status: 'resolved' as EventStatus,
        'metadata.resolvedAt': now,
        'metadata.updatedAt': now,
      });
    });
    
    await batch.commit();
  }

  static async deleteAllArchived(
    options: {
      type?: EventType;
      severity?: EventSeverity;
      source?: string;
    } = {}
  ): Promise<void> {
    const eventsRef = collection(firestore, this.COLLECTION);
    let q = query(eventsRef, where('status', '==', 'archived'));

    if (options.type) {
      q = query(q, where('type', '==', options.type));
    }
    if (options.severity) {
      q = query(q, where('severity', '==', options.severity));
    }
    if (options.source) {
      q = query(q, where('source', '==', options.source));
    }

    const snapshot = await getDocs(q);
    const batch = writeBatch(firestore);
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  }

  // Type-specific Event Creation
  static async createSystemEvent(
    userId: string,
    severity: EventSeverity,
    title: string,
    description: string,
    component: string,
    action: string,
    details: Record<string, any>
  ): Promise<SystemEvent> {
    const event: Omit<SystemEvent, 'id' | 'metadata'> = {
      userId,
      type: 'system',
      severity,
      status: 'active',
      title,
      description,
      component,
      action,
      details
    };
    return this.createEvent(event) as Promise<SystemEvent>;
  }

  static async createUserEvent(
    userId: string,
    severity: EventSeverity,
    title: string,
    description: string,
    action: string,
    target: string,
    details: Record<string, any>
  ): Promise<UserEvent> {
    const event: Omit<UserEvent, 'id' | 'metadata'> = {
      userId,
      type: 'user',
      severity,
      status: 'active',
      title,
      description,
      action,
      target,
      details
    };
    return this.createEvent(event) as Promise<UserEvent>;
  }

  static async createDeviceEvent(
    userId: string,
    severity: EventSeverity,
    title: string,
    description: string,
    deviceId: string,
    deviceType: DeviceType,
    action: string,
    details: Record<string, any>
  ): Promise<DeviceEvent> {
    if (!firestore) throw new Error('Firestore not initialized');
    const event: Omit<DeviceEvent, 'id' | 'metadata'> = {
      userId,
      type: 'device',
      severity,
      title,
      description,
      deviceId,
      deviceType,
      action,
      details,
      status: 'active'
    };
    return this.createEvent(event) as Promise<DeviceEvent>;
  }

  static async createEnergyEvent(
    userId: string,
    severity: EventSeverity,
    title: string,
    description: string,
    source: 'solar' | 'battery' | 'grid' | 'generator',
    action: string,
    value: number,
    unit: string,
    details: Record<string, any>
  ): Promise<EnergyEvent> {
    const event: Omit<EnergyEvent, 'id' | 'metadata'> = {
      userId,
      type: 'energy',
      severity,
      status: 'active',
      title,
      description,
      source,
      action,
      value,
      unit,
      details
    };
    return this.createEvent(event) as Promise<EnergyEvent>;
  }

  static async createSecurityEvent(
    userId: string,
    severity: EventSeverity,
    title: string,
    description: string,
    action: string,
    level: 'low' | 'medium' | 'high' | 'critical',
    details: Record<string, any>
  ): Promise<SecurityEvent> {
    const event: Omit<SecurityEvent, 'id' | 'metadata'> = {
      userId,
      type: 'security',
      severity,
      status: 'active',
      title,
      description,
      action,
      level,
      details
    };
    return this.createEvent(event) as Promise<SecurityEvent>;
  }

  static async createMaintenanceEvent(
    userId: string,
    severity: EventSeverity,
    title: string,
    description: string,
    deviceId: string,
    action: string,
    maintenanceType: 'preventive' | 'corrective' | 'predictive',
    details: Record<string, any>
  ): Promise<MaintenanceEvent> {
    const event: Omit<MaintenanceEvent, 'id' | 'metadata'> = {
      userId,
      type: 'maintenance',
      severity,
      status: 'active',
      title,
      description,
      deviceId,
      action,
      maintenanceType,
      details
    };
    return this.createEvent(event) as Promise<MaintenanceEvent>;
  }

  static async createAuditEvent(
    userId: string,
    severity: EventSeverity,
    title: string,
    description: string,
    action: string,
    target: string,
    changes: Record<string, { old: any; new: any }>,
    details: Record<string, any>
  ): Promise<AuditEvent> {
    const event: Omit<AuditEvent, 'id' | 'metadata'> = {
      userId,
      type: 'audit',
      severity,
      status: 'active',
      title,
      description,
      action,
      target,
      changes,
      details
    };
    return this.createEvent(event) as Promise<AuditEvent>;
  }

  // Real-time Listeners
  static onEventUpdate(
    eventId: string,
    callback: (event: Event | null) => void
  ): Unsubscribe {
    if (!firestore) throw new Error('Firestore not initialized');
    const eventRef = doc(firestore, this.COLLECTION, eventId).withConverter(eventConverter);
    return onSnapshot(eventRef, (snapshot) => {
      callback(snapshot.exists() ? snapshot.data() : null);
    });
  }

  static onUserEventsUpdate(
    userId: string,
    callback: (events: Event[]) => void,
    options: {
      type?: EventType;
      severity?: EventSeverity;
      status?: EventStatus;
      limit?: number;
    } = {}
  ): Unsubscribe {
    if (!firestore) throw new Error('Firestore not initialized');
    const eventRef = collection(firestore, this.COLLECTION).withConverter(eventConverter);
    let q = query(eventRef, where('userId', '==', userId));

    if (options.type) q = query(q, where('type', '==', options.type));
    if (options.severity) q = query(q, where('severity', '==', options.severity));
    if (options.status) q = query(q, where('status', '==', options.status));
    if (options.limit) q = query(q, firestoreLimit(options.limit));

    q = query(q, orderBy('metadata.createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data()));
    });
  }

  // Utility Methods
  static async getEventStats(userId: string): Promise<{
    totalEvents: number;
    byType: Record<EventType, number>;
    bySeverity: Record<EventSeverity, number>;
    byStatus: Record<EventStatus, number>;
  }> {
    if (!firestore) throw new Error('Firestore not initialized');
    const snapshot = await getDocs(query(collection(firestore, this.COLLECTION), where('userId', '==', userId)));

    const stats = {
      totalEvents: 0,
      byType: {} as Record<EventType, number>,
      bySeverity: {} as Record<EventSeverity, number>,
      byStatus: {} as Record<EventStatus, number>
    };

    snapshot.docs.forEach(doc => {
      const event = doc.data() as Event;
      stats.totalEvents++;
      stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;
      stats.bySeverity[event.severity] = (stats.bySeverity[event.severity] || 0) + 1;
      stats.byStatus[event.status] = (stats.byStatus[event.status] || 0) + 1;
    });

    return stats;
  }
} 