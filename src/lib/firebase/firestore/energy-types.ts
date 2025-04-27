import { Timestamp, DocumentData, WithFieldValue, FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase/firestore';
import { DeviceType } from './device-types';

export type EnergySource = 'solar' | 'battery' | 'grid' | 'generator';
export type EnergyUnit = 'kWh' | 'MWh' | 'Wh';
export type EnergyStatus = 'active' | 'inactive' | 'maintenance' | 'fault';
export type EnergyMode = 'production' | 'consumption' | 'storage' | 'idle';

export interface EnergyMetrics {
  power: number; // in watts
  voltage: number; // in volts
  current: number; // in amperes
  frequency?: number; // in hertz
  powerFactor?: number; // 0-1
  timestamp: Date;
}

export interface EnergyConsumption {
  id: string;
  deviceId: string;
  userId: string;
  source: EnergySource;
  metrics: EnergyMetrics;
  cost?: number; // in currency
  carbonFootprint?: number; // in kg CO2
  metadata: {
    createdAt: Date;
    lastUpdated: Date;
    version: number;
    tags: string[];
    notes?: string;
  };
}

export interface EnergyProduction {
  id: string;
  deviceId: string;
  userId: string;
  source: EnergySource;
  metrics: EnergyMetrics;
  efficiency?: number; // 0-100%
  revenue?: number; // in currency
  carbonOffset?: number; // in kg CO2
  metadata: {
    createdAt: Date;
    lastUpdated: Date;
    version: number;
    tags: string[];
    notes?: string;
  };
}

export interface EnergyStorage {
  id: string;
  deviceId: string;
  userId: string;
  source: EnergySource;
  metrics: EnergyMetrics;
  capacity: number; // in kWh
  stateOfCharge: number; // 0-100%
  status: EnergyStatus;
  mode: EnergyMode;
  metadata: {
    createdAt: Date;
    lastUpdated: Date;
    version: number;
    tags: string[];
    notes?: string;
  };
}

export interface EnergySummary {
  id: string;
  userId: string;
  timeRange: {
    start: Date;
    end: Date;
  };
  totalConsumption: number; // in kWh
  totalProduction: number; // in kWh
  netEnergy: number; // in kWh (production - consumption)
  peakDemand: number; // in kW
  averageEfficiency: number; // 0-100%
  totalCost: number; // in currency
  totalSavings: number; // in currency
  carbonFootprint: number; // in kg CO2
  carbonOffset: number; // in kg CO2
  metadata: {
    createdAt: Date;
    lastUpdated: Date;
    version: number;
    tags: string[];
    notes?: string;
  };
}

// Firestore data converters
export const energyConsumptionConverter: FirestoreDataConverter<EnergyConsumption, DocumentData> = {
  toFirestore: (data: WithFieldValue<EnergyConsumption>): DocumentData => {
    const consumption = data as EnergyConsumption;
    return {
      deviceId: consumption.deviceId,
      userId: consumption.userId,
      source: consumption.source,
      metrics: {
        power: consumption.metrics.power,
        voltage: consumption.metrics.voltage,
        current: consumption.metrics.current,
        frequency: consumption.metrics.frequency,
        powerFactor: consumption.metrics.powerFactor,
        timestamp: Timestamp.fromDate(consumption.metrics.timestamp)
      },
      cost: consumption.cost,
      carbonFootprint: consumption.carbonFootprint,
      metadata: {
        createdAt: Timestamp.fromDate(consumption.metadata.createdAt),
        lastUpdated: Timestamp.fromDate(consumption.metadata.lastUpdated),
        version: consumption.metadata.version,
        tags: consumption.metadata.tags,
        notes: consumption.metadata.notes
      }
    };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>): EnergyConsumption => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      deviceId: data.deviceId,
      userId: data.userId,
      source: data.source,
      metrics: {
        power: data.metrics.power,
        voltage: data.metrics.voltage,
        current: data.metrics.current,
        frequency: data.metrics.frequency,
        powerFactor: data.metrics.powerFactor,
        timestamp: data.metrics.timestamp.toDate()
      },
      cost: data.cost,
      carbonFootprint: data.carbonFootprint,
      metadata: {
        createdAt: data.metadata.createdAt.toDate(),
        lastUpdated: data.metadata.lastUpdated.toDate(),
        version: data.metadata.version,
        tags: data.metadata.tags,
        notes: data.metadata.notes
      }
    };
  }
};

export const energyProductionConverter: FirestoreDataConverter<EnergyProduction, DocumentData> = {
  toFirestore: (data: WithFieldValue<EnergyProduction>): DocumentData => {
    const production = data as EnergyProduction;
    return {
      deviceId: production.deviceId,
      userId: production.userId,
      source: production.source,
      metrics: {
        power: production.metrics.power,
        voltage: production.metrics.voltage,
        current: production.metrics.current,
        frequency: production.metrics.frequency,
        powerFactor: production.metrics.powerFactor,
        timestamp: Timestamp.fromDate(production.metrics.timestamp)
      },
      efficiency: production.efficiency,
      revenue: production.revenue,
      carbonOffset: production.carbonOffset,
      metadata: {
        createdAt: Timestamp.fromDate(production.metadata.createdAt),
        lastUpdated: Timestamp.fromDate(production.metadata.lastUpdated),
        version: production.metadata.version,
        tags: production.metadata.tags,
        notes: production.metadata.notes
      }
    };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>): EnergyProduction => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      deviceId: data.deviceId,
      userId: data.userId,
      source: data.source,
      metrics: {
        power: data.metrics.power,
        voltage: data.metrics.voltage,
        current: data.metrics.current,
        frequency: data.metrics.frequency,
        powerFactor: data.metrics.powerFactor,
        timestamp: data.metrics.timestamp.toDate()
      },
      efficiency: data.efficiency,
      revenue: data.revenue,
      carbonOffset: data.carbonOffset,
      metadata: {
        createdAt: data.metadata.createdAt.toDate(),
        lastUpdated: data.metadata.lastUpdated.toDate(),
        version: data.metadata.version,
        tags: data.metadata.tags,
        notes: data.metadata.notes
      }
    };
  }
};

export const energyStorageConverter: FirestoreDataConverter<EnergyStorage, DocumentData> = {
  toFirestore: (data: WithFieldValue<EnergyStorage>): DocumentData => {
    const storage = data as EnergyStorage;
    return {
      deviceId: storage.deviceId,
      userId: storage.userId,
      source: storage.source,
      metrics: {
        power: storage.metrics.power,
        voltage: storage.metrics.voltage,
        current: storage.metrics.current,
        frequency: storage.metrics.frequency,
        powerFactor: storage.metrics.powerFactor,
        timestamp: Timestamp.fromDate(storage.metrics.timestamp)
      },
      capacity: storage.capacity,
      stateOfCharge: storage.stateOfCharge,
      status: storage.status,
      mode: storage.mode,
      metadata: {
        createdAt: Timestamp.fromDate(storage.metadata.createdAt),
        lastUpdated: Timestamp.fromDate(storage.metadata.lastUpdated),
        version: storage.metadata.version,
        tags: storage.metadata.tags,
        notes: storage.metadata.notes
      }
    };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>): EnergyStorage => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      deviceId: data.deviceId,
      userId: data.userId,
      source: data.source,
      metrics: {
        power: data.metrics.power,
        voltage: data.metrics.voltage,
        current: data.metrics.current,
        frequency: data.metrics.frequency,
        powerFactor: data.metrics.powerFactor,
        timestamp: data.metrics.timestamp.toDate()
      },
      capacity: data.capacity,
      stateOfCharge: data.stateOfCharge,
      status: data.status,
      mode: data.mode,
      metadata: {
        createdAt: data.metadata.createdAt.toDate(),
        lastUpdated: data.metadata.lastUpdated.toDate(),
        version: data.metadata.version,
        tags: data.metadata.tags,
        notes: data.metadata.notes
      }
    };
  }
};

export const energySummaryConverter: FirestoreDataConverter<EnergySummary, DocumentData> = {
  toFirestore: (data: WithFieldValue<EnergySummary>): DocumentData => {
    const summary = data as EnergySummary;
    return {
      userId: summary.userId,
      timeRange: {
        start: Timestamp.fromDate(summary.timeRange.start),
        end: Timestamp.fromDate(summary.timeRange.end)
      },
      totalConsumption: summary.totalConsumption,
      totalProduction: summary.totalProduction,
      netEnergy: summary.netEnergy,
      peakDemand: summary.peakDemand,
      averageEfficiency: summary.averageEfficiency,
      totalCost: summary.totalCost,
      totalSavings: summary.totalSavings,
      carbonFootprint: summary.carbonFootprint,
      carbonOffset: summary.carbonOffset,
      metadata: {
        createdAt: Timestamp.fromDate(summary.metadata.createdAt),
        lastUpdated: Timestamp.fromDate(summary.metadata.lastUpdated),
        version: summary.metadata.version,
        tags: summary.metadata.tags,
        notes: summary.metadata.notes
      }
    };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>): EnergySummary => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId,
      timeRange: {
        start: data.timeRange.start.toDate(),
        end: data.timeRange.end.toDate()
      },
      totalConsumption: data.totalConsumption,
      totalProduction: data.totalProduction,
      netEnergy: data.netEnergy,
      peakDemand: data.peakDemand,
      averageEfficiency: data.averageEfficiency,
      totalCost: data.totalCost,
      totalSavings: data.totalSavings,
      carbonFootprint: data.carbonFootprint,
      carbonOffset: data.carbonOffset,
      metadata: {
        createdAt: data.metadata.createdAt.toDate(),
        lastUpdated: data.metadata.lastUpdated.toDate(),
        version: data.metadata.version,
        tags: data.metadata.tags,
        notes: data.metadata.notes
      }
    };
  }
}; 