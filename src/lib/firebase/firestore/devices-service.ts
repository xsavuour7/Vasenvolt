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
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import {
  Device,
  DeviceType,
  DeviceStatus,
  DeviceConnectionStatus,
  DevicePowerStatus,
  deviceConverter,
  SensorDevice,
  ControllerDevice,
  MonitorDevice,
  GatewayDevice,
  BatteryDevice,
  InverterDevice,
  ChargerDevice,
} from './device-types';

export class DevicesService {
  private static readonly COLLECTION = 'devices';

  // Basic CRUD Operations
  static async getDevice(id: string): Promise<Device | null> {
    const deviceRef = doc(firestore, this.COLLECTION, id).withConverter(deviceConverter);
    const snapshot = await getDoc(deviceRef);
    return snapshot.exists() ? snapshot.data() : null;
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
    const devicesRef = collection(firestore, this.COLLECTION).withConverter(deviceConverter);
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
      q = query(q, limit(options.limit));
    }

    q = query(q, orderBy('metadata.lastUpdated', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  static async createDevice(device: Omit<Device, 'id' | 'metadata'>): Promise<Device> {
    const devicesRef = collection(firestore, this.COLLECTION).withConverter(deviceConverter);
    const now = Timestamp.now();
    
    const newDevice = {
      ...device,
      metadata: {
        createdAt: now,
        lastUpdated: now,
        lastMaintenance: undefined,
        lastError: undefined,
        lastDataReceived: undefined,
      },
    } as unknown as WithFieldValue<Device>;

    const docRef = await addDoc(devicesRef, newDevice);
    const snapshot = await getDoc(docRef.withConverter(deviceConverter));
    return snapshot.data()!;
  }

  static async updateDevice(
    id: string,
    updates: Partial<Omit<Device, 'id' | 'type' | 'metadata'>>
  ): Promise<void> {
    const deviceRef = doc(firestore, this.COLLECTION, id);
    await updateDoc(deviceRef, {
      ...updates,
      'metadata.lastUpdated': Timestamp.now(),
    });
  }

  static async deleteDevice(id: string): Promise<void> {
    const deviceRef = doc(firestore, this.COLLECTION, id);
    await deleteDoc(deviceRef);
  }

  // Status Management
  static async updateStatus(id: string, status: DeviceStatus): Promise<void> {
    const deviceRef = doc(firestore, this.COLLECTION, id);
    await updateDoc(deviceRef, {
      status,
      'metadata.lastUpdated': Timestamp.now(),
    });
  }

  static async updateConnectionStatus(id: string, connectionStatus: DeviceConnectionStatus): Promise<void> {
    const deviceRef = doc(firestore, this.COLLECTION, id);
    await updateDoc(deviceRef, {
      connectionStatus,
      'metadata.lastUpdated': Timestamp.now(),
    });
  }

  static async updatePowerStatus(id: string, powerStatus: DevicePowerStatus): Promise<void> {
    const deviceRef = doc(firestore, this.COLLECTION, id);
    await updateDoc(deviceRef, {
      powerStatus,
      'metadata.lastUpdated': Timestamp.now(),
    });
  }

  // Type-specific Operations
  static async createSensorDevice(
    name: string,
    model: string,
    manufacturer: string,
    serialNumber: string,
    firmwareVersion: string,
    sensorType: string,
    measurementUnit: string,
    accuracy: number,
    range: { min: number; max: number },
    location: {
      building?: string;
      floor?: string;
      room?: string;
      coordinates?: { latitude: number; longitude: number };
    }
  ): Promise<Device> {
    const device: Omit<SensorDevice, 'id' | 'metadata'> = {
      type: 'sensor',
      name,
      model,
      manufacturer,
      serialNumber,
      firmwareVersion,
      status: 'active',
      connectionStatus: 'disconnected',
      powerStatus: 'off',
      location,
      sensorType,
      measurementUnit,
      accuracy,
      range,
    };
    return this.createDevice(device);
  }

  static async createControllerDevice(
    name: string,
    model: string,
    manufacturer: string,
    serialNumber: string,
    firmwareVersion: string,
    controlType: string,
    controlMode: string,
    setpoints: Record<string, number>,
    location: {
      building?: string;
      floor?: string;
      room?: string;
      coordinates?: { latitude: number; longitude: number };
    }
  ): Promise<Device> {
    const device: Omit<ControllerDevice, 'id' | 'metadata'> = {
      type: 'controller',
      name,
      model,
      manufacturer,
      serialNumber,
      firmwareVersion,
      status: 'active',
      connectionStatus: 'disconnected',
      powerStatus: 'off',
      location,
      controlType,
      controlMode,
      setpoints,
    };
    return this.createDevice(device);
  }

  static async createMonitorDevice(
    name: string,
    model: string,
    manufacturer: string,
    serialNumber: string,
    firmwareVersion: string,
    monitoringType: string,
    samplingRate: number,
    thresholds: Record<string, { min: number; max: number; unit: string }>,
    location: {
      building?: string;
      floor?: string;
      room?: string;
      coordinates?: { latitude: number; longitude: number };
    }
  ): Promise<Device> {
    const device: Omit<MonitorDevice, 'id' | 'metadata'> = {
      type: 'monitor',
      name,
      model,
      manufacturer,
      serialNumber,
      firmwareVersion,
      status: 'active',
      connectionStatus: 'disconnected',
      powerStatus: 'off',
      location,
      monitoringType,
      samplingRate,
      dataPoints: [],
      thresholds,
    };
    return this.createDevice(device);
  }

  static async createGatewayDevice(
    name: string,
    model: string,
    manufacturer: string,
    serialNumber: string,
    firmwareVersion: string,
    protocol: string,
    networkInfo: {
      ipAddress: string;
      macAddress: string;
      signalStrength?: number;
    },
    location: {
      building?: string;
      floor?: string;
      room?: string;
      coordinates?: { latitude: number; longitude: number };
    }
  ): Promise<Device> {
    const device: Omit<GatewayDevice, 'id' | 'metadata'> = {
      type: 'gateway',
      name,
      model,
      manufacturer,
      serialNumber,
      firmwareVersion,
      status: 'active',
      connectionStatus: 'disconnected',
      powerStatus: 'off',
      location,
      protocol,
      connectedDevices: [],
      networkInfo,
      security: {
        encryption: true,
        authentication: true,
      },
    };
    return this.createDevice(device);
  }

  static async createBatteryDevice(
    name: string,
    model: string,
    manufacturer: string,
    serialNumber: string,
    firmwareVersion: string,
    capacity: number,
    voltage: number,
    current: number,
    batteryType: string,
    chemistry: string,
    location: {
      building?: string;
      floor?: string;
      room?: string;
      coordinates?: { latitude: number; longitude: number };
    }
  ): Promise<Device> {
    const device: Omit<BatteryDevice, 'id' | 'metadata'> = {
      type: 'battery',
      name,
      model,
      manufacturer,
      serialNumber,
      firmwareVersion,
      status: 'active',
      connectionStatus: 'disconnected',
      powerStatus: 'off',
      location,
      capacity,
      voltage,
      current,
      stateOfCharge: 0,
      stateOfHealth: 100,
      temperature: 25,
      cycleCount: 0,
      chargingStatus: 'idle',
      batteryType,
      chemistry,
    };
    return this.createDevice(device);
  }

  static async createInverterDevice(
    name: string,
    model: string,
    manufacturer: string,
    serialNumber: string,
    firmwareVersion: string,
    inputVoltage: number,
    outputVoltage: number,
    frequency: number,
    powerRating: number,
    location: {
      building?: string;
      floor?: string;
      room?: string;
      coordinates?: { latitude: number; longitude: number };
    }
  ): Promise<Device> {
    const device: Omit<InverterDevice, 'id' | 'metadata'> = {
      type: 'inverter',
      name,
      model,
      manufacturer,
      serialNumber,
      firmwareVersion,
      status: 'active',
      connectionStatus: 'disconnected',
      powerStatus: 'off',
      location,
      inputVoltage,
      outputVoltage,
      frequency,
      efficiency: 95,
      powerRating,
      temperature: 25,
      operatingMode: 'standby',
      gridConnection: false,
      protectionSettings: {
        overVoltage: 1.1 * outputVoltage,
        underVoltage: 0.9 * outputVoltage,
        overCurrent: 1.2 * powerRating,
        overTemperature: 60,
      },
    };
    return this.createDevice(device);
  }

  static async createChargerDevice(
    name: string,
    model: string,
    manufacturer: string,
    serialNumber: string,
    firmwareVersion: string,
    chargingPower: number,
    voltage: number,
    current: number,
    connectorType: string,
    chargingProtocol: string,
    chargingModes: string[],
    location: {
      building?: string;
      floor?: string;
      room?: string;
      coordinates?: { latitude: number; longitude: number };
    }
  ): Promise<Device> {
    const device: Omit<ChargerDevice, 'id' | 'metadata'> = {
      type: 'charger',
      name,
      model,
      manufacturer,
      serialNumber,
      firmwareVersion,
      status: 'active',
      connectionStatus: 'disconnected',
      powerStatus: 'off',
      location,
      chargingPower,
      voltage,
      current,
      connectorType,
      chargingProtocol,
      temperature: 25,
      chargingStatus: 'idle',
      chargingModes,
      activeMode: chargingModes[0],
      energyDelivered: 0,
    };
    return this.createDevice(device);
  }

  // Gateway-specific Operations
  static async addConnectedDevice(gatewayId: string, deviceId: string): Promise<void> {
    const gatewayRef = doc(firestore, this.COLLECTION, gatewayId);
    await updateDoc(gatewayRef, {
      connectedDevices: arrayUnion(deviceId),
      'metadata.lastUpdated': Timestamp.now(),
    });
  }

  static async removeConnectedDevice(gatewayId: string, deviceId: string): Promise<void> {
    const gatewayRef = doc(firestore, this.COLLECTION, gatewayId);
    await updateDoc(gatewayRef, {
      connectedDevices: arrayRemove(deviceId),
      'metadata.lastUpdated': Timestamp.now(),
    });
  }

  // Real-time Listeners
  static onDeviceUpdate(
    callback: (device: Device | null) => void,
    options: {
      type?: DeviceType;
      status?: DeviceStatus;
      connectionStatus?: DeviceConnectionStatus;
    } = {}
  ): Unsubscribe {
    const devicesRef = collection(firestore, this.COLLECTION).withConverter(deviceConverter);
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
    
    return onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          callback(change.doc.data());
        }
      });
    });
  }

  // Utility Methods
  static async getDeviceStats(): Promise<{
    total: number;
    byType: Record<DeviceType, number>;
    byStatus: Record<DeviceStatus, number>;
    byConnectionStatus: Record<DeviceConnectionStatus, number>;
    byPowerStatus: Record<DevicePowerStatus, number>;
  }> {
    const devicesRef = collection(firestore, this.COLLECTION);
    const snapshot = await getDocs(devicesRef);
    
    const stats = {
      total: snapshot.size,
      byType: {} as Record<DeviceType, number>,
      byStatus: {} as Record<DeviceStatus, number>,
      byConnectionStatus: {} as Record<DeviceConnectionStatus, number>,
      byPowerStatus: {} as Record<DevicePowerStatus, number>,
    };
    
    snapshot.docs.forEach(doc => {
      const data = doc.data() as Device;
      const type = data.type as DeviceType;
      const status = data.status as DeviceStatus;
      const connectionStatus = data.connectionStatus as DeviceConnectionStatus;
      const powerStatus = data.powerStatus as DevicePowerStatus;
      
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
      stats.byConnectionStatus[connectionStatus] = (stats.byConnectionStatus[connectionStatus] || 0) + 1;
      stats.byPowerStatus[powerStatus] = (stats.byPowerStatus[powerStatus] || 0) + 1;
    });
    
    return stats;
  }
} 