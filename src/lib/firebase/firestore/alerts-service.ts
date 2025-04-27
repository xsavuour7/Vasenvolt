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
  WithFieldValue,
} from 'firebase/firestore';
import {
  Alert,
  AlertType,
  AlertSeverity,
  AlertStatus,
  alertConverter,
  DeviceStatusAlert,
  EnergyConsumptionAlert,
  PowerOutageAlert,
  MaintenanceAlert,
  SecurityAlert,
  SystemAlert,
} from './alerts-types';

export class AlertsService {
  private static readonly COLLECTION = 'alerts';

  // Basic CRUD Operations
  static async getAlert(alertId: string): Promise<Alert | null> {
    const alertRef = doc(firestore, this.COLLECTION, alertId).withConverter(alertConverter);
    const snapshot = await getDoc(alertRef);
    return snapshot.exists() ? snapshot.data() : null;
  }

  static async getAlerts(userId: string, options?: {
    type?: AlertType;
    severity?: AlertSeverity;
    status?: AlertStatus;
    deviceId?: string;
    deviceGroupId?: string;
    limit?: number;
  }): Promise<Alert[]> {
    const alertsRef = collection(firestore, this.COLLECTION).withConverter(alertConverter);
    let q = query(alertsRef, where('userId', '==', userId));

    if (options?.type) {
      q = query(q, where('type', '==', options.type));
    }
    if (options?.severity) {
      q = query(q, where('severity', '==', options.severity));
    }
    if (options?.status) {
      q = query(q, where('status', '==', options.status));
    }
    if (options?.deviceId) {
      q = query(q, where('deviceId', '==', options.deviceId));
    }
    if (options?.deviceGroupId) {
      q = query(q, where('deviceGroupId', '==', options.deviceGroupId));
    }

    q = query(q, orderBy('createdAt', 'desc'));
    if (options?.limit) {
      q = query(q, firestoreLimit(options.limit));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  static async createAlert<T extends Alert>(
    alert: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'acknowledgedAt' | 'resolvedAt'>
  ): Promise<T> {
    const alertsRef = collection(firestore, this.COLLECTION).withConverter(alertConverter);
    const now = Timestamp.now();
    
    // Create a new alert with all required properties
    const newAlert = {
      ...alert,
      createdAt: now,
      updatedAt: now,
      acknowledgedAt: null,
      resolvedAt: null,
      status: 'active' as AlertStatus,
    } as unknown as WithFieldValue<Alert>;
    
    const docRef = await addDoc(alertsRef, newAlert);
    const snapshot = await getDoc(docRef.withConverter(alertConverter));
    return snapshot.data() as T;
  }

  static async updateAlert(
    alertId: string,
    updates: Partial<Alert>
  ): Promise<void> {
    const alertRef = doc(firestore, this.COLLECTION, alertId);
    await updateDoc(alertRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  }

  static async deleteAlert(alertId: string): Promise<void> {
    const alertRef = doc(firestore, this.COLLECTION, alertId);
    await deleteDoc(alertRef);
  }

  // Status Management
  static async acknowledgeAlert(alertId: string): Promise<void> {
    await this.updateAlert(alertId, {
      status: 'acknowledged',
      acknowledgedAt: Timestamp.now(),
    });
  }

  static async resolveAlert(alertId: string): Promise<void> {
    await this.updateAlert(alertId, {
      status: 'resolved',
      resolvedAt: Timestamp.now(),
    });
  }

  // Type-specific Operations
  static async createDeviceStatusAlert(
    alert: Omit<DeviceStatusAlert, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<DeviceStatusAlert> {
    return this.createAlert<DeviceStatusAlert>(alert);
  }

  static async createEnergyConsumptionAlert(
    alert: Omit<EnergyConsumptionAlert, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<EnergyConsumptionAlert> {
    return this.createAlert<EnergyConsumptionAlert>(alert);
  }

  static async createPowerOutageAlert(
    alert: Omit<PowerOutageAlert, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PowerOutageAlert> {
    return this.createAlert<PowerOutageAlert>(alert);
  }

  static async createMaintenanceAlert(
    alert: Omit<MaintenanceAlert, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<MaintenanceAlert> {
    return this.createAlert<MaintenanceAlert>(alert);
  }

  static async createSecurityAlert(
    alert: Omit<SecurityAlert, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<SecurityAlert> {
    return this.createAlert<SecurityAlert>(alert);
  }

  static async createSystemAlert(
    alert: Omit<SystemAlert, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<SystemAlert> {
    return this.createAlert<SystemAlert>(alert);
  }

  // Query Operations
  static async getActiveAlerts(userId: string): Promise<Alert[]> {
    return this.getAlerts(userId, { status: 'active' });
  }

  static async getCriticalAlerts(userId: string): Promise<Alert[]> {
    return this.getAlerts(userId, { severity: 'critical' });
  }

  static async getDeviceAlerts(deviceId: string): Promise<Alert[]> {
    return this.getAlerts('', { deviceId });
  }

  static async getDeviceGroupAlerts(deviceGroupId: string): Promise<Alert[]> {
    return this.getAlerts('', { deviceGroupId });
  }

  // Real-time Listeners
  static onAlertsUpdate(
    userId: string,
    callback: (alerts: Alert[]) => void
  ): Unsubscribe {
    const alertsRef = collection(firestore, this.COLLECTION).withConverter(alertConverter);
    const q = query(
      alertsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data()));
    });
  }

  static onDeviceAlertsUpdate(
    deviceId: string,
    callback: (alerts: Alert[]) => void
  ): Unsubscribe {
    const alertsRef = collection(firestore, this.COLLECTION).withConverter(alertConverter);
    const q = query(
      alertsRef,
      where('deviceId', '==', deviceId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data()));
    });
  }

  // Utility Methods
  static async acknowledgeAllAlerts(userId: string): Promise<void> {
    const activeAlerts = await this.getActiveAlerts(userId);
    const updates = activeAlerts.map(alert =>
      this.acknowledgeAlert(alert.id!)
    );
    await Promise.all(updates);
  }

  static async getAlertStats(userId: string): Promise<{
    total: number;
    active: number;
    acknowledged: number;
    resolved: number;
    byType: Record<AlertType, number>;
    bySeverity: Record<AlertSeverity, number>;
  }> {
    const alerts = await this.getAlerts(userId);
    
    const stats = {
      total: alerts.length,
      active: 0,
      acknowledged: 0,
      resolved: 0,
      byType: {
        device_status: 0,
        energy_consumption: 0,
        power_outage: 0,
        maintenance: 0,
        security: 0,
        system: 0,
      },
      bySeverity: {
        info: 0,
        warning: 0,
        error: 0,
        critical: 0,
      },
    };

    alerts.forEach(alert => {
      // Count by status
      if (alert.status === 'active') stats.active++;
      else if (alert.status === 'acknowledged') stats.acknowledged++;
      else if (alert.status === 'resolved') stats.resolved++;

      // Count by type
      stats.byType[alert.type]++;

      // Count by severity
      stats.bySeverity[alert.severity]++;
    });

    return stats;
  }
} 