import { Timestamp, DocumentData, WithFieldValue, FirestoreDataConverter, QueryDocumentSnapshot, serverTimestamp, FieldValue } from 'firebase/firestore';
import { Device, DeviceType, DeviceStatus, BaseDevice, SensorDevice, MonitorDevice, SensorType, MonitoringType } from './device-types';

// Base types for our application
export type DeviceType = 
  | 'sensor' 
  | 'controller' 
  | 'monitor' 
  | 'gateway' 
  | 'battery' 
  | 'inverter' 
  | 'charger';

export type DeviceStatus = 'active' | 'inactive' | 'maintenance' | 'error';
export type DeviceConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';
export type DevicePowerStatus = 'on' | 'off' | 'standby' | 'error';

export type SensorType = 'temperature' | 'humidity' | 'pressure' | 'light' | 'motion' | 'power' | 'voltage' | 'current';
export type MonitoringType = 'energy' | 'performance' | 'environment' | 'security' | 'maintenance';

// Application types
export interface DeviceMetadata {
  createdAt: Date;
  lastUpdated: Date;
  lastMaintenance?: Date;
  lastError?: Date;
  lastDataReceived?: Date;
}

export interface BaseDevice {
  id?: string;
  userId: string;
  type: DeviceType;
  name: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  firmwareVersion: string;
  status: DeviceStatus;
  connectionStatus: DeviceConnectionStatus;
  powerStatus: DevicePowerStatus;
  location: {
    building?: string;
    floor?: string;
    room?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  metadata: DeviceMetadata;
  settings: {
    autoPowerOff?: boolean;
    powerThreshold?: number;
    operatingMode?: 'normal' | 'eco' | 'performance';
    temperatureThreshold?: number;
    voltageThreshold?: number;
    schedule?: {
      startTime?: string;
      endTime?: string;
    };
    [key: string]: any;
  };
  powerConsumption?: number;
  lastUpdated: Date;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

// Firestore types
export type FirestoreFieldValue<T> = T | FieldValue;

export interface FirestoreDeviceMetadata {
  createdAt: FirestoreFieldValue<Timestamp>;
  lastUpdated: FirestoreFieldValue<Timestamp>;
  lastMaintenance?: FirestoreFieldValue<Timestamp>;
  lastError?: FirestoreFieldValue<Timestamp>;
  lastDataReceived?: FirestoreFieldValue<Timestamp>;
}

export interface FirestoreBaseDevice {
  id?: string;
  userId: string;
  type: DeviceType;
  name: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  firmwareVersion: string;
  status: DeviceStatus;
  connectionStatus: DeviceConnectionStatus;
  powerStatus: DevicePowerStatus;
  location: {
    building?: string;
    floor?: string;
    room?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  metadata: FirestoreDeviceMetadata;
  settings: {
    autoPowerOff?: boolean;
    powerThreshold?: number;
    operatingMode?: 'normal' | 'eco' | 'performance';
    temperatureThreshold?: number;
    voltageThreshold?: number;
    schedule?: {
      startTime?: string;
      endTime?: string;
    };
    [key: string]: any;
  };
  powerConsumption?: number;
  lastUpdated: FirestoreFieldValue<Timestamp>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

// Device-specific types
export interface SensorDevice extends BaseDevice {
  type: 'sensor';
  sensorType: string;
  readings: Array<{
    timestamp: Date;
    value: number;
    unit: string;
  }>;
  calibration: {
    lastCalibrated: Date;
    calibrationFactor: number;
    offset: number;
  };
}

export interface ControllerDevice extends BaseDevice {
  type: 'controller';
  controlType: string;
  state: Record<string, any>;
  schedule?: {
    enabled: boolean;
    events: Array<{
      time: string;
      action: string;
      value: number;
    }>;
  };
}

export interface MonitorDevice extends BaseDevice {
  type: 'monitor';
  monitoringType: string;
  metrics: Record<string, {
    value: number;
    unit: string;
    timestamp: Date;
  }>;
  alerts: Array<{
    type: string;
    message: string;
    timestamp: Date;
    resolved: boolean;
  }>;
}

export interface GatewayDevice extends BaseDevice {
  type: 'gateway';
  protocol: string;
  connectedDevices: string[];
  networkConfig: {
    ipAddress: string;
    macAddress: string;
    signalStrength?: number;
  };
}

export interface BatteryDevice extends BaseDevice {
  type: 'battery';
  capacity: number;
  chargeLevel: number;
  chargingStatus: 'charging' | 'discharging' | 'idle' | 'error';
}

export interface InverterDevice extends BaseDevice {
  type: 'inverter';
  inputVoltage: number;
  outputVoltage: number;
  efficiency: number;
}

export interface ChargerDevice extends BaseDevice {
  type: 'charger';
  chargingRate: number;
  chargingMode: string;
  connectedDevice?: string;
}

export type Device = 
  | SensorDevice 
  | ControllerDevice 
  | MonitorDevice 
  | GatewayDevice 
  | BatteryDevice 
  | InverterDevice 
  | ChargerDevice;

export type FirestoreDevice = 
  | FirestoreSensorDevice 
  | FirestoreControllerDevice 
  | FirestoreMonitorDevice 
  | FirestoreGatewayDevice 
  | FirestoreBatteryDevice 
  | FirestoreInverterDevice 
  | FirestoreChargerDevice;

export interface FirestoreSensorDevice extends FirestoreBaseDevice {
  type: 'sensor';
  sensorType: string;
  readings: Array<{
    timestamp: FirestoreFieldValue<Timestamp>;
    value: number;
    unit: string;
  }>;
  calibration: {
    lastCalibrated: FirestoreFieldValue<Timestamp>;
    calibrationFactor: number;
    offset: number;
  };
}

export interface FirestoreControllerDevice extends FirestoreBaseDevice {
  type: 'controller';
  controlType: string;
  state: Record<string, any>;
  schedule?: {
    enabled: boolean;
    events: Array<{
      time: string;
      action: string;
      value: number;
    }>;
  };
}

export interface FirestoreMonitorDevice extends FirestoreBaseDevice {
  type: 'monitor';
  monitoringType: string;
  metrics: Record<string, {
    value: number;
    unit: string;
    timestamp: Date;
  }>;
  alerts: Array<{
    type: string;
    message: string;
    timestamp: Date;
    resolved: boolean;
  }>;
}

export interface FirestoreGatewayDevice extends FirestoreBaseDevice {
  type: 'gateway';
  protocol: string;
  connectedDevices: string[];
  networkConfig: {
    ipAddress: string;
    macAddress: string;
    signalStrength?: number;
  };
}

export interface FirestoreBatteryDevice extends FirestoreBaseDevice {
  type: 'battery';
  capacity: number;
  chargeLevel: number;
  chargingStatus: 'charging' | 'discharging' | 'idle' | 'error';
}

export interface FirestoreInverterDevice extends FirestoreBaseDevice {
  type: 'inverter';
  inputVoltage: number;
  outputVoltage: number;
  efficiency: number;
}

export interface FirestoreChargerDevice extends FirestoreBaseDevice {
  type: 'charger';
  chargingRate: number;
  chargingMode: string;
  connectedDevice?: string;
}

// Type guards
export function isSensorDevice(device: Device): device is SensorDevice {
  return device.type === 'sensor';
}

export function isControllerDevice(device: Device): device is ControllerDevice {
  return device.type === 'controller';
}

export function isMonitorDevice(device: Device): device is MonitorDevice {
  return device.type === 'monitor';
}

export function isGatewayDevice(device: Device): device is GatewayDevice {
  return device.type === 'gateway';
}

export function isBatteryDevice(device: Device): device is BatteryDevice {
  return device.type === 'battery';
}

export function isInverterDevice(device: Device): device is InverterDevice {
  return device.type === 'inverter';
}

export function isChargerDevice(device: Device): device is ChargerDevice {
  return device.type === 'charger';
}

// Converter functions
function toFirestoreTimestamp(date: Date | undefined): FirestoreFieldValue<Timestamp> | undefined {
  return date ? Timestamp.fromDate(date) : undefined;
}

function toFirestoreDeviceMetadata(metadata: DeviceMetadata): FirestoreDeviceMetadata {
  return {
    createdAt: toFirestoreTimestamp(metadata.createdAt)!,
    lastUpdated: toFirestoreTimestamp(metadata.lastUpdated)!,
    lastMaintenance: toFirestoreTimestamp(metadata.lastMaintenance),
    lastError: toFirestoreTimestamp(metadata.lastError),
    lastDataReceived: toFirestoreTimestamp(metadata.lastDataReceived)
  };
}

function fromFirestoreTimestamp(timestamp: Timestamp | undefined): Date | undefined {
  return timestamp?.toDate();
}

function fromFirestoreDeviceMetadata(metadata: FirestoreDeviceMetadata): DeviceMetadata {
  return {
    createdAt: fromFirestoreTimestamp(metadata.createdAt as Timestamp)!,
    lastUpdated: fromFirestoreTimestamp(metadata.lastUpdated as Timestamp)!,
    lastMaintenance: fromFirestoreTimestamp(metadata.lastMaintenance as Timestamp),
    lastError: fromFirestoreTimestamp(metadata.lastError as Timestamp),
    lastDataReceived: fromFirestoreTimestamp(metadata.lastDataReceived as Timestamp)
  };
}

// Firestore data converter
export const deviceConverter: FirestoreDataConverter<Device> = {
  toFirestore: (device: WithFieldValue<Device>) => {
    const baseDevice: Partial<FirestoreBaseDevice> = {
      id: device.id as string,
      name: device.name as string,
      type: device.type as DeviceType,
      status: device.status as DeviceStatus,
      metadata: toFirestoreDeviceMetadata(device.metadata as DeviceMetadata),
      lastUpdated: serverTimestamp()
    };

    switch (device.type as DeviceType) {
      case 'sensor': {
        const sensorDevice = device as SensorDevice;
        return {
          ...baseDevice,
          sensorType: sensorDevice.sensorType,
          readings: sensorDevice.readings.map(reading => ({
            ...reading,
            timestamp: toFirestoreTimestamp(reading.timestamp)!
          })),
          calibration: {
            ...sensorDevice.calibration,
            lastCalibrated: toFirestoreTimestamp(sensorDevice.calibration.lastCalibrated)!
          }
        } as unknown as FirestoreBaseDevice;
      }
      case 'controller': {
        const controllerDevice = device as ControllerDevice;
        return {
          ...baseDevice,
          controlType: controllerDevice.controlType,
          state: controllerDevice.state,
          schedule: controllerDevice.schedule
        } as unknown as FirestoreBaseDevice;
      }
      case 'monitor': {
        const monitorDevice = device as MonitorDevice;
        return {
          ...baseDevice,
          monitoringType: monitorDevice.monitoringType,
          metrics: Object.fromEntries(
            Object.entries(monitorDevice.metrics).map(([key, value]) => [
              key,
              {
                ...value,
                timestamp: toFirestoreTimestamp(value.timestamp)!
              }
            ])
          ),
          alerts: monitorDevice.alerts.map(alert => ({
            ...alert,
            timestamp: toFirestoreTimestamp(alert.timestamp)!
          }))
        } as unknown as FirestoreBaseDevice;
      }
      case 'gateway': {
        const gatewayDevice = device as GatewayDevice;
        return {
          ...baseDevice,
          protocol: gatewayDevice.protocol,
          connectedDevices: gatewayDevice.connectedDevices,
          networkConfig: gatewayDevice.networkConfig
        } as unknown as FirestoreBaseDevice;
      }
      case 'battery': {
        const batteryDevice = device as BatteryDevice;
        return {
          ...baseDevice,
          capacity: batteryDevice.capacity,
          chargeLevel: batteryDevice.chargeLevel,
          chargingStatus: batteryDevice.chargingStatus
        } as unknown as FirestoreBaseDevice;
      }
      case 'inverter': {
        const inverterDevice = device as InverterDevice;
        return {
          ...baseDevice,
          inputVoltage: inverterDevice.inputVoltage,
          outputVoltage: inverterDevice.outputVoltage,
          efficiency: inverterDevice.efficiency
        } as unknown as FirestoreBaseDevice;
      }
      case 'charger': {
        const chargerDevice = device as ChargerDevice;
        return {
          ...baseDevice,
          chargingRate: chargerDevice.chargingRate,
          chargingMode: chargerDevice.chargingMode,
          connectedDevice: chargerDevice.connectedDevice
        } as unknown as FirestoreBaseDevice;
      }
      default:
        return baseDevice as unknown as FirestoreBaseDevice;
    }
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot): Device => {
    const data = snapshot.data();
    const baseDevice: Partial<BaseDevice> = {
      id: snapshot.id,
      name: data.name as string,
      type: data.type as DeviceType,
      status: data.status as DeviceStatus,
      metadata: fromFirestoreDeviceMetadata(data.metadata as FirestoreDeviceMetadata),
      lastUpdated: fromFirestoreTimestamp(data.lastUpdated as Timestamp)!
    };

    switch (data.type as DeviceType) {
      case 'sensor': {
        return {
          ...baseDevice,
          sensorType: data.sensorType as SensorType,
          readings: data.readings.map((reading: any) => ({
            ...reading,
            timestamp: fromFirestoreTimestamp(reading.timestamp)!
          })),
          calibration: {
            ...data.calibration,
            lastCalibrated: fromFirestoreTimestamp(data.calibration.lastCalibrated)!
          }
        } as SensorDevice;
      }
      case 'controller': {
        return {
          ...baseDevice,
          controlType: data.controlType,
          state: data.state,
          schedule: data.schedule
        } as ControllerDevice;
      }
      case 'monitor': {
        return {
          ...baseDevice,
          monitoringType: data.monitoringType as MonitoringType,
          metrics: Object.fromEntries(
            Object.entries(data.metrics).map(([key, value]: [string, any]) => [
              key,
              {
                ...value,
                timestamp: fromFirestoreTimestamp(value.timestamp)!
              }
            ])
          ),
          alerts: data.alerts.map((alert: any) => ({
            ...alert,
            timestamp: fromFirestoreTimestamp(alert.timestamp)!
          }))
        } as MonitorDevice;
      }
      case 'gateway': {
        return {
          ...baseDevice,
          protocol: data.protocol,
          connectedDevices: data.connectedDevices,
          networkConfig: data.networkConfig
        } as GatewayDevice;
      }
      case 'battery': {
        return {
          ...baseDevice,
          capacity: data.capacity,
          chargeLevel: data.chargeLevel,
          chargingStatus: data.chargingStatus
        } as BatteryDevice;
      }
      case 'inverter': {
        return {
          ...baseDevice,
          inputVoltage: data.inputVoltage,
          outputVoltage: data.outputVoltage,
          efficiency: data.efficiency
        } as InverterDevice;
      }
      case 'charger': {
        return {
          ...baseDevice,
          chargingRate: data.chargingRate,
          chargingMode: data.chargingMode,
          connectedDevice: data.connectedDevice
        } as ChargerDevice;
      }
      default:
        return baseDevice as Device;
    }
  }
};

export interface DeviceGroup {
  id: string;
  userId: string;
  name: string;
  description?: string;
  deviceIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceAlert {
  id: string;
  deviceId: string;
  userId: string;
  type: 'power' | 'temperature' | 'connection' | 'error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface DeviceLog {
  id: string;
  deviceId: string;
  userId: string;
  type: 'status_change' | 'metric_update' | 'error' | 'info';
  message: string;
  data?: {
    [key: string]: any;
  };
  timestamp: Date;
}

export const deviceGroupConverter = {
  toFirestore: (group: DeviceGroup) => ({
    ...group,
    createdAt: Timestamp.fromDate(group.createdAt),
    updatedAt: Timestamp.fromDate(group.updatedAt)
  }),
  fromFirestore: (snapshot: any, options: any) => {
    const data = snapshot.data(options);
    return {
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as DeviceGroup;
  }
};

export const deviceAlertConverter = {
  toFirestore: (alert: DeviceAlert) => ({
    ...alert,
    timestamp: Timestamp.fromDate(alert.timestamp),
    resolvedAt: alert.resolvedAt ? Timestamp.fromDate(alert.resolvedAt) : null
  }),
  fromFirestore: (snapshot: any, options: any) => {
    const data = snapshot.data(options);
    return {
      ...data,
      timestamp: data.timestamp.toDate(),
      resolvedAt: data.resolvedAt?.toDate()
    } as DeviceAlert;
  }
};

export const deviceLogConverter = {
  toFirestore: (log: DeviceLog) => ({
    ...log,
    timestamp: Timestamp.fromDate(log.timestamp)
  }),
  fromFirestore: (snapshot: any, options: any) => {
    const data = snapshot.data(options);
    return {
      ...data,
      timestamp: data.timestamp.toDate()
    } as DeviceLog;
  }
}; 