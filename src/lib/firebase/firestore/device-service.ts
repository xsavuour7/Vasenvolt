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
  Timestamp,
  onSnapshot,
  Unsubscribe,
  limit as firestoreLimit,
  WithFieldValue,
  writeBatch,
  arrayUnion,
  arrayRemove,
  DocumentData,
  QueryDocumentSnapshot,
  FirestoreDataConverter,
  setDoc,
  Firestore,
  startAfter,
  DocumentSnapshot,
  QuerySnapshot,
  FieldValue,
  CollectionReference
} from 'firebase/firestore';
import { 
  Device,
  DeviceGroup,
  DeviceAlert,
  DeviceLog,
  DeviceStatus,
  DeviceType,
  DeviceConnectionStatus,
  DevicePowerStatus,
  deviceConverter,
  deviceGroupConverter,
  deviceAlertConverter,
  deviceLogConverter,
  SensorDevice,
  ControllerDevice,
  MonitorDevice,
  GatewayDevice,
  BatteryDevice,
  InverterDevice,
  ChargerDevice,
  isSensorDevice,
  isControllerDevice,
  isMonitorDevice,
  isGatewayDevice,
  isBatteryDevice,
  isInverterDevice,
  isChargerDevice,
  BaseDevice,
  FirestoreDevice
} from './device-types';
import { db } from '@/lib/firebase';

export class DeviceService {
  private static readonly COLLECTIONS = {
    DEVICES: 'devices',
    GROUPS: 'deviceGroups',
    ALERTS: 'deviceAlerts',
    LOGS: 'deviceLogs'
  };

  private readonly devicesCollection: CollectionReference<Device>;
  private readonly db: Firestore;

  constructor(db: Firestore) {
    this.db = db;
    this.devicesCollection = collection(db, DeviceService.COLLECTIONS.DEVICES).withConverter(deviceConverter);
  }

  // Device Operations
  async getDevice(id: string): Promise<Device | null> {
    const deviceRef = doc(this.devicesCollection, id);
    const deviceSnap = await getDoc(deviceRef);
    return deviceSnap.exists() ? deviceSnap.data() : null;
  }

  static async getDevices(
    options: {
      type?: DeviceType;
      status?: DeviceStatus;
      connectionStatus?: DeviceConnectionStatus;
      powerStatus?: DevicePowerStatus;
      limit?: number;
    } = {}
  ): Promise<Device[]> {
    if (!firestore) throw new Error('Firestore not initialized');
    const devicesRef = collection(firestore, DeviceService.COLLECTIONS.DEVICES).withConverter(deviceConverter);
    let q = query(devicesRef);

    if (options.type) {
      q = query(q, where('type', '==', options.type));
    }
    if (options.status) {
      q = query(q, where('status', '==', options.status));
    }
    if (options.connectionStatus) {
      q = query(q, where('connectionStatus', '==', options.connectionStatus));
    }
    if (options.powerStatus) {
      q = query(q, where('powerStatus', '==', options.powerStatus));
    }
    if (options.limit) {
      q = query(q, firestoreLimit(options.limit));
    }

    q = query(q, orderBy('metadata.lastUpdated', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  static async createDevice(device: Omit<Device, 'id'>): Promise<Device> {
    if (!firestore) throw new Error('Firestore not initialized');
    const devicesRef = collection(firestore, DeviceService.COLLECTIONS.DEVICES).withConverter(deviceConverter);
    const now = Timestamp.now();
    
    // Create a properly typed Firestore document
    const deviceData: DocumentData = {
      ...device,
      metadata: {
        createdAt: now,
        lastUpdated: now,
        lastMaintenance: device.metadata.lastMaintenance ? Timestamp.fromDate(device.metadata.lastMaintenance) : undefined,
        lastError: device.metadata.lastError ? Timestamp.fromDate(device.metadata.lastError) : undefined,
        lastDataReceived: device.metadata.lastDataReceived ? Timestamp.fromDate(device.metadata.lastDataReceived) : undefined
      },
      lastUpdated: now
    };
    
    const docRef = await addDoc(devicesRef, deviceData);
    const snapshot = await getDoc(docRef.withConverter(deviceConverter));
    const createdDevice = snapshot.data();
    if (!createdDevice) throw new Error('Failed to create device');
    return createdDevice;
  }

  static async updateDevice(deviceId: string, device: Partial<Device>): Promise<void> {
    if (!firestore) throw new Error('Firestore not initialized');
    const deviceRef = doc(firestore, DeviceService.COLLECTIONS.DEVICES, deviceId).withConverter(deviceConverter);
    const snapshot = await getDoc(deviceRef);
    if (!snapshot.exists()) throw new Error('Device not found');
    
    const currentDevice = snapshot.data();
    const now = Timestamp.now();
    
    // Create a properly typed Firestore document
    const updatedDeviceData: DocumentData = {
      ...currentDevice,
      ...device,
      metadata: {
        ...currentDevice.metadata,
        lastUpdated: now,
        lastMaintenance: device.metadata?.lastMaintenance ? Timestamp.fromDate(device.metadata.lastMaintenance) : currentDevice.metadata.lastMaintenance,
        lastError: device.metadata?.lastError ? Timestamp.fromDate(device.metadata.lastError) : currentDevice.metadata.lastError,
        lastDataReceived: device.metadata?.lastDataReceived ? Timestamp.fromDate(device.metadata.lastDataReceived) : currentDevice.metadata.lastDataReceived
      },
      lastUpdated: now
    };
    
    await updateDoc(deviceRef, updatedDeviceData);
  }

  static async deleteDevice(deviceId: string): Promise<void> {
    if (!firestore) throw new Error('Firestore not initialized');
    const deviceRef = doc(firestore, DeviceService.COLLECTIONS.DEVICES, deviceId);
    await deleteDoc(deviceRef);
  }

  // Device Group Operations
  static async getDeviceGroup(groupId: string): Promise<DeviceGroup | null> {
    if (!firestore) throw new Error('Firestore not initialized');
    const groupRef = doc(firestore, DeviceService.COLLECTIONS.GROUPS, groupId).withConverter(deviceGroupConverter);
    const snapshot = await getDoc(groupRef);
    return snapshot.exists() ? snapshot.data() : null;
  }

  static async getDeviceGroups(userId: string): Promise<DeviceGroup[]> {
    if (!firestore) throw new Error('Firestore not initialized');
    const groupsRef = collection(firestore, DeviceService.COLLECTIONS.GROUPS).withConverter(deviceGroupConverter);
    const q = query(
      groupsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  static async createDeviceGroup(group: Omit<DeviceGroup, 'id'>): Promise<DeviceGroup> {
    if (!firestore) throw new Error('Firestore not initialized');
    const groupsRef = collection(firestore, DeviceService.COLLECTIONS.GROUPS).withConverter(deviceGroupConverter);
    const docRef = await addDoc(groupsRef, group);
    return { ...group, id: docRef.id };
  }

  // Alert Operations
  static async getDeviceAlerts(deviceId: string): Promise<DeviceAlert[]> {
    if (!firestore) throw new Error('Firestore not initialized');
    const alertsRef = collection(firestore, DeviceService.COLLECTIONS.ALERTS).withConverter(deviceAlertConverter);
    const q = query(
      alertsRef,
      where('deviceId', '==', deviceId),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  static async createDeviceAlert(alert: Omit<DeviceAlert, 'id'>): Promise<DeviceAlert> {
    if (!firestore) throw new Error('Firestore not initialized');
    const alertsRef = collection(firestore, DeviceService.COLLECTIONS.ALERTS).withConverter(deviceAlertConverter);
    const docRef = await addDoc(alertsRef, alert);
    return { ...alert, id: docRef.id };
  }

  static async resolveAlert(alertId: string): Promise<void> {
    if (!firestore) throw new Error('Firestore not initialized');
    const alertRef = doc(firestore, DeviceService.COLLECTIONS.ALERTS, alertId).withConverter(deviceAlertConverter);
    await updateDoc(alertRef, {
      resolved: true,
      resolvedAt: Timestamp.now()
    });
  }

  // Log Operations
  static async getDeviceLogs(deviceId: string, limit: number = 100): Promise<DeviceLog[]> {
    if (!firestore) throw new Error('Firestore not initialized');
    const logsRef = collection(firestore, DeviceService.COLLECTIONS.LOGS).withConverter(deviceLogConverter);
    const q = query(
      logsRef,
      where('deviceId', '==', deviceId),
      orderBy('timestamp', 'desc'),
      firestoreLimit(limit)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  static async createDeviceLog(log: Omit<DeviceLog, 'id'>): Promise<DeviceLog> {
    if (!firestore) throw new Error('Firestore not initialized');
    const logsRef = collection(firestore, DeviceService.COLLECTIONS.LOGS).withConverter(deviceLogConverter);
    const docRef = await addDoc(logsRef, log);
    return { ...log, id: docRef.id };
  }

  // Real-time Listeners
  static onDeviceUpdate(deviceId: string, callback: (device: Device) => void): Unsubscribe {
    if (!firestore) throw new Error('Firestore not initialized');
    const deviceRef = doc(firestore, DeviceService.COLLECTIONS.DEVICES, deviceId).withConverter(deviceConverter);
    return onSnapshot(deviceRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data());
      }
    });
  }

  static onDeviceAlerts(deviceId: string, callback: (alerts: DeviceAlert[]) => void): Unsubscribe {
    if (!firestore) throw new Error('Firestore not initialized');
    const alertsRef = collection(firestore, DeviceService.COLLECTIONS.ALERTS).withConverter(deviceAlertConverter);
    const q = query(
      alertsRef,
      where('deviceId', '==', deviceId),
      where('resolved', '==', false),
      orderBy('timestamp', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data()));
    });
  }

  // Utility Methods
  static async updateDeviceStatus(deviceId: string, status: DeviceStatus): Promise<void> {
    await this.updateDevice(deviceId, { status });
  }

  static async getDevicesByType(type: DeviceType): Promise<Device[]> {
    if (!firestore) throw new Error('Firestore not initialized');
    const devicesRef = collection(firestore, DeviceService.COLLECTIONS.DEVICES).withConverter(deviceConverter);
    const q = query(devicesRef, where('type', '==', type));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  async getDevices(): Promise<Device[]> {
    const devicesSnap = await getDocs(this.devicesCollection);
    return devicesSnap.docs.map(doc => doc.data());
  }

  async getDeviceById(id: string): Promise<Device | null> {
    const deviceRef = doc(this.devicesCollection, id);
    const deviceSnap = await getDoc(deviceRef);
    return deviceSnap.exists() ? deviceSnap.data() : null;
  }

  async createDevice(device: Omit<Device, 'id' | 'metadata'>): Promise<Device> {
    const deviceRef = doc(this.devicesCollection);
    const now = Timestamp.now();
    const newDeviceData = {
      ...device,
      metadata: {
        createdAt: now,
        lastUpdated: now
      }
    } as WithFieldValue<Device>;
    
    await setDoc(deviceRef, newDeviceData);
    const deviceSnap = await getDoc(deviceRef);
    return deviceSnap.data()!;
  }

  async updateDevice(id: string, updates: Partial<Device>): Promise<void> {
    const deviceRef = doc(this.devicesCollection, id);
    const deviceSnap = await getDoc(deviceRef);
    
    if (!deviceSnap.exists()) {
      throw new Error('Device not found');
    }

    const currentDevice = deviceSnap.data();
    const updatedDeviceData = {
      ...currentDevice,
      ...updates,
      metadata: {
        ...currentDevice.metadata,
        lastUpdated: Timestamp.now()
      }
    } as WithFieldValue<Device>;

    await updateDoc(deviceRef, updatedDeviceData);
  }

  static subscribeToDevice(
    deviceId: string,
    onUpdate: (device: Device) => void,
    onError: (error: Error) => void
  ): Unsubscribe {
    if (!firestore) throw new Error('Firestore not initialized');
    const deviceRef = doc(firestore, DeviceService.COLLECTIONS.DEVICES, deviceId).withConverter(deviceConverter);
    
    return onSnapshot(
      deviceRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onUpdate(snapshot.data());
        }
      },
      (error) => {
        onError(error);
      }
    );
  }

  // Type-specific helper methods
  static async getSensorDevices(): Promise<SensorDevice[]> {
    const devices = await this.getDevicesByType('sensor');
    return devices.filter(isSensorDevice) as SensorDevice[];
  }

  static async getControllerDevices(): Promise<ControllerDevice[]> {
    const devices = await this.getDevicesByType('controller');
    return devices.filter(isControllerDevice) as ControllerDevice[];
  }

  static async getMonitorDevices(): Promise<MonitorDevice[]> {
    const devices = await this.getDevicesByType('monitor');
    return devices.filter(isMonitorDevice) as MonitorDevice[];
  }

  static async getGatewayDevices(): Promise<GatewayDevice[]> {
    const devices = await this.getDevicesByType('gateway');
    return devices.filter(isGatewayDevice) as GatewayDevice[];
  }

  static async getBatteryDevices(): Promise<BatteryDevice[]> {
    const devices = await this.getDevicesByType('battery');
    return devices.filter(isBatteryDevice) as BatteryDevice[];
  }

  static async getInverterDevices(): Promise<InverterDevice[]> {
    const devices = await this.getDevicesByType('inverter');
    return devices.filter(isInverterDevice) as InverterDevice[];
  }

  static async getChargerDevices(): Promise<ChargerDevice[]> {
    const devices = await this.getDevicesByType('charger');
    return devices.filter(isChargerDevice) as ChargerDevice[];
  }
} 