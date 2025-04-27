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
  limit,
  Timestamp,
  onSnapshot,
  Unsubscribe,
  WithFieldValue,
  writeBatch,
} from 'firebase/firestore';
import {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  NotificationChannel,
  notificationConverter,
  AlertNotification,
  ReportNotification,
  MaintenanceNotification,
  SystemNotification,
} from './notifications-types';

export class NotificationsService {
  private static readonly COLLECTION = 'notifications';

  // Basic CRUD Operations
  static async getNotification(id: string): Promise<Notification | null> {
    const notificationRef = doc(firestore, this.COLLECTION, id).withConverter(notificationConverter);
    const snapshot = await getDoc(notificationRef);
    return snapshot.exists() ? snapshot.data() : null;
  }

  static async getNotifications(
    userId: string,
    options: {
      type?: NotificationType;
      status?: NotificationStatus;
      priority?: NotificationPriority;
      limit?: number;
    } = {}
  ): Promise<Notification[]> {
    const notificationsRef = collection(firestore, this.COLLECTION).withConverter(notificationConverter);
    let q = query(notificationsRef, where('userId', '==', userId));

    if (options.type) {
      q = query(q, where('type', '==', options.type));
    }
    if (options.status) {
      q = query(q, where('status', '==', options.status));
    }
    if (options.priority) {
      q = query(q, where('priority', '==', options.priority));
    }
    if (options.limit) {
      q = query(q, limit(options.limit));
    }

    q = query(q, orderBy('metadata.createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  static async createNotification(notification: Omit<Notification, 'id' | 'metadata'>): Promise<Notification> {
    const notificationsRef = collection(firestore, this.COLLECTION).withConverter(notificationConverter);
    const now = Timestamp.now();
    
    const newNotification = {
      ...notification,
      metadata: {
        createdAt: now,
        readAt: undefined,
        archivedAt: undefined,
        expiresAt: undefined,
      },
    } as unknown as WithFieldValue<Notification>;

    const docRef = await addDoc(notificationsRef, newNotification);
    const snapshot = await getDoc(docRef.withConverter(notificationConverter));
    return snapshot.data()!;
  }

  static async updateNotification(
    id: string,
    updates: Partial<Omit<Notification, 'id' | 'userId' | 'type' | 'metadata'>>
  ): Promise<void> {
    const notificationRef = doc(firestore, this.COLLECTION, id);
    await updateDoc(notificationRef, {
      ...updates,
      'metadata.updatedAt': Timestamp.now(),
    });
  }

  static async deleteNotification(id: string): Promise<void> {
    const notificationRef = doc(firestore, this.COLLECTION, id);
    await deleteDoc(notificationRef);
  }

  // Status Management
  static async markAsRead(id: string): Promise<void> {
    const notificationRef = doc(firestore, this.COLLECTION, id);
    await updateDoc(notificationRef, {
      status: 'read' as NotificationStatus,
      'metadata.readAt': Timestamp.now(),
      'metadata.updatedAt': Timestamp.now(),
    });
  }

  static async markAsArchived(id: string): Promise<void> {
    const notificationRef = doc(firestore, this.COLLECTION, id);
    await updateDoc(notificationRef, {
      status: 'archived' as NotificationStatus,
      'metadata.archivedAt': Timestamp.now(),
      'metadata.updatedAt': Timestamp.now(),
    });
  }

  // Batch Operations
  static async markAllAsRead(userId: string): Promise<void> {
    const notificationsRef = collection(firestore, this.COLLECTION);
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('status', '==', 'unread')
    );
    const snapshot = await getDocs(q);
    
    const batch = writeBatch(firestore);
    const now = Timestamp.now();
    
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        status: 'read' as NotificationStatus,
        'metadata.readAt': now,
        'metadata.updatedAt': now,
      });
    });
    
    await batch.commit();
  }

  static async deleteAllArchived(userId: string): Promise<void> {
    const notificationsRef = collection(firestore, this.COLLECTION);
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('status', '==', 'archived')
    );
    const snapshot = await getDocs(q);
    
    const batch = writeBatch(firestore);
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  }

  // Type-specific Operations
  static async createAlertNotification(
    userId: string,
    alertId: string,
    alertType: string,
    severity: string,
    title: string,
    message: string,
    priority: NotificationPriority = 'medium',
    channels: NotificationChannel[] = ['in-app']
  ): Promise<Notification> {
    const notification: Omit<AlertNotification, 'id' | 'metadata'> = {
      userId,
      type: 'alert',
      title,
      message,
      priority,
      status: 'unread',
      channels,
      alertId,
      alertType,
      severity,
    };
    return this.createNotification(notification);
  }

  static async createReportNotification(
    userId: string,
    reportId: string,
    reportType: string,
    title: string,
    message: string,
    downloadUrl?: string,
    priority: NotificationPriority = 'low',
    channels: NotificationChannel[] = ['email']
  ): Promise<Notification> {
    const notification: Omit<ReportNotification, 'id' | 'metadata'> = {
      userId,
      type: 'report',
      title,
      message,
      priority,
      status: 'unread',
      channels,
      reportId,
      reportType,
      downloadUrl,
    };
    return this.createNotification(notification);
  }

  static async createSystemNotification(
    userId: string,
    component: string,
    title: string,
    message: string,
    action?: string,
    details?: Record<string, unknown>,
    priority: NotificationPriority = 'medium',
    channels: NotificationChannel[] = ['in-app']
  ): Promise<Notification> {
    const notification: Omit<SystemNotification, 'id' | 'metadata'> = {
      userId,
      type: 'system',
      title,
      message,
      priority,
      status: 'unread',
      channels,
      component,
      action,
      details,
    };
    return this.createNotification(notification);
  }

  // Real-time Listeners
  static onNotificationUpdate(
    userId: string,
    callback: (notification: Notification | null) => void
  ): Unsubscribe {
    const notificationsRef = collection(firestore, this.COLLECTION).withConverter(notificationConverter);
    const q = query(notificationsRef, where('userId', '==', userId));
    
    return onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          callback(change.doc.data());
        }
      });
    });
  }

  // Utility Methods
  static async getUnreadCount(userId: string): Promise<number> {
    const notificationsRef = collection(firestore, this.COLLECTION);
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('status', '==', 'unread')
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  static async getNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    archived: number;
    byType: Record<NotificationType, number>;
    byPriority: Record<NotificationPriority, number>;
  }> {
    const notificationsRef = collection(firestore, this.COLLECTION);
    const q = query(notificationsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    const stats = {
      total: snapshot.size,
      unread: 0,
      archived: 0,
      byType: {} as Record<NotificationType, number>,
      byPriority: {} as Record<NotificationPriority, number>,
    };
    
    snapshot.docs.forEach(doc => {
      const data = doc.data() as Notification;
      if (data.status === 'unread') stats.unread++;
      if (data.status === 'archived') stats.archived++;
      
      const type = data.type as NotificationType;
      const priority = data.priority as NotificationPriority;
      
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
    });
    
    return stats;
  }
} 