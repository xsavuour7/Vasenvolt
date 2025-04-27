import { Timestamp, DocumentData, WithFieldValue, FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase/firestore';
import { convertToTimestamps, convertToDates } from '../utils/date-utils';
import { DeviceType } from './device-types';
import { GroupType } from './device-groups-types';
import { EnergySource, EnergyUnit } from './energy-types';

export type TimeRange = 'hour' | 'day' | 'week' | 'month' | 'year' | 'custom';
export type MetricType = 'energy' | 'performance' | 'cost' | 'maintenance' | 'security';
export type TrendDirection = 'up' | 'down' | 'stable';
export type AnalysisType = 'comparison' | 'trend' | 'forecast' | 'anomaly';

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
  createdAt: Date;
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
  createdAt: Date;
}

export interface EnergySummary {
  id: string;
  userId: string;
  timeRange: TimeRange;
  startTime: Date;
  endTime: Date;
  totalConsumption: number; // in kWh
  totalProduction: number; // in kWh
  netEnergy: number; // in kWh (production - consumption)
  peakDemand: number; // in kW
  averageEfficiency: number; // 0-100%
  totalCost: number; // in currency
  totalSavings: number; // in currency
  carbonFootprint: number; // in kg CO2
  carbonOffset: number; // in kg CO2
  createdAt: Date;
}

export interface EnergyReport {
  id: string;
  userId: string;
  title: string;
  description?: string;
  timeRange: TimeRange;
  startTime: Date;
  endTime: Date;
  metrics: {
    consumption: {
      total: number;
      bySource: Record<EnergySource, number>;
      peak: number;
      average: number;
    };
    production: {
      total: number;
      bySource: Record<EnergySource, number>;
      peak: number;
      average: number;
    };
    efficiency: {
      average: number;
      bySource: Record<EnergySource, number>;
    };
    cost: {
      total: number;
      bySource: Record<EnergySource, number>;
      savings: number;
    };
    environmental: {
      carbonFootprint: number;
      carbonOffset: number;
      netCarbon: number;
    };
  };
  insights: string[];
  recommendations: string[];
  createdAt: Date;
}

export interface ConsumptionData {
  id?: string;
  deviceId: string;
  userId: string;
  metrics: EnergyMetrics;
  cost?: number;
  carbonEmissions?: number;
  metadata: {
    createdAt: Date;
    lastUpdated: Date;
  };
}

export interface ProductionData {
  id?: string;
  deviceId: string;
  userId: string;
  metrics: EnergyMetrics;
  efficiency?: number;
  carbonOffset?: number;
  metadata: {
    createdAt: Timestamp;
    lastUpdated: Timestamp;
  };
}

export interface PerformanceMetrics {
  id?: string;
  deviceId: string;
  userId: string;
  metrics: {
    uptime: number;
    availability: number;
    reliability: number;
    efficiency: number;
    timestamp: Timestamp;
  };
  metadata: {
    createdAt: Timestamp;
    lastUpdated: Timestamp;
  };
}

export interface AnalyticsSummary {
  id?: string;
  userId: string;
  period: {
    start: Timestamp;
    end: Timestamp;
  };
  consumption: {
    total: number;
    peak: number;
    average: number;
    cost: number;
    carbonEmissions: number;
  };
  production: {
    total: number;
    peak: number;
    average: number;
    efficiency: number;
    carbonOffset: number;
  };
  performance: {
    averageUptime: number;
    averageAvailability: number;
    averageReliability: number;
    averageEfficiency: number;
  };
  metadata: {
    createdAt: Timestamp;
    lastUpdated: Timestamp;
  };
}

export interface MetricMetadata {
  createdAt: Date;
  lastUpdated: Date;
  version: number;
  tags: string[];
  notes?: string;
}

export interface BaseMetric {
  id: string;
  userId: string;
  type: MetricType;
  name: string;
  description?: string;
  value: number;
  unit: string;
  metadata: MetricMetadata;
}

export interface EnergyMetric extends BaseMetric {
  type: 'energy';
  consumption: number;
  production: number;
  efficiency: number;
  carbonEmissions: number;
  timeRange: {
    type: TimeRange;
    start: Date;
    end: Date;
  };
}

export interface PerformanceMetric extends BaseMetric {
  type: 'performance';
  uptime: number;
  availability: number;
  reliability: number;
  efficiency: number;
  timeRange: {
    type: TimeRange;
    start: Date;
    end: Date;
  };
}

export interface CostMetric extends BaseMetric {
  type: 'cost';
  totalCost: number;
  energyCost: number;
  maintenanceCost: number;
  savings: number;
  roi: number;
  timeRange: {
    type: TimeRange;
    start: Date;
    end: Date;
  };
}

export interface MaintenanceMetric extends BaseMetric {
  type: 'maintenance';
  totalEvents: number;
  preventiveEvents: number;
  correctiveEvents: number;
  downtime: number;
  timeRange: {
    type: TimeRange;
    start: Date;
    end: Date;
  };
}

export interface SecurityMetric extends BaseMetric {
  type: 'security';
  totalEvents: number;
  criticalEvents: number;
  resolvedEvents: number;
  responseTime: number;
  timeRange: {
    type: TimeRange;
    start: Date;
    end: Date;
  };
}

export type Metric = EnergyMetric | PerformanceMetric | CostMetric | MaintenanceMetric | SecurityMetric;

export interface Trend {
  metricId: string;
  direction: TrendDirection;
  percentage: number;
  confidence: number;
  timeRange: {
    type: TimeRange;
    start: Date;
    end: Date;
  };
}

export interface AnalysisResult {
  id: string;
  userId: string;
  type: AnalysisType;
  metrics: string[];
  result: {
    summary: string;
    details: Record<string, any>;
    recommendations: string[];
  };
  metadata: MetricMetadata;
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
      createdAt: Timestamp.fromDate(consumption.createdAt)
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
      createdAt: data.createdAt.toDate()
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
      createdAt: Timestamp.fromDate(production.createdAt)
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
      createdAt: data.createdAt.toDate()
    };
  }
};

export const energySummaryConverter: FirestoreDataConverter<EnergySummary, DocumentData> = {
  toFirestore: (data: WithFieldValue<EnergySummary>): DocumentData => {
    const summary = data as EnergySummary;
    return {
      userId: summary.userId,
      timeRange: summary.timeRange,
      startTime: Timestamp.fromDate(summary.startTime),
      endTime: Timestamp.fromDate(summary.endTime),
      totalConsumption: summary.totalConsumption,
      totalProduction: summary.totalProduction,
      netEnergy: summary.netEnergy,
      peakDemand: summary.peakDemand,
      averageEfficiency: summary.averageEfficiency,
      totalCost: summary.totalCost,
      totalSavings: summary.totalSavings,
      carbonFootprint: summary.carbonFootprint,
      carbonOffset: summary.carbonOffset,
      createdAt: Timestamp.fromDate(summary.createdAt)
    };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>): EnergySummary => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId,
      timeRange: data.timeRange,
      startTime: data.startTime.toDate(),
      endTime: data.endTime.toDate(),
      totalConsumption: data.totalConsumption,
      totalProduction: data.totalProduction,
      netEnergy: data.netEnergy,
      peakDemand: data.peakDemand,
      averageEfficiency: data.averageEfficiency,
      totalCost: data.totalCost,
      totalSavings: data.totalSavings,
      carbonFootprint: data.carbonFootprint,
      carbonOffset: data.carbonOffset,
      createdAt: data.createdAt.toDate()
    };
  }
};

export const energyReportConverter: FirestoreDataConverter<EnergyReport, DocumentData> = {
  toFirestore: (data: WithFieldValue<EnergyReport>): DocumentData => {
    const report = data as EnergyReport;
    return {
      userId: report.userId,
      title: report.title,
      description: report.description,
      timeRange: report.timeRange,
      startTime: Timestamp.fromDate(report.startTime),
      endTime: Timestamp.fromDate(report.endTime),
      metrics: report.metrics,
      insights: report.insights,
      recommendations: report.recommendations,
      createdAt: Timestamp.fromDate(report.createdAt)
    };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>): EnergyReport => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId,
      title: data.title,
      description: data.description,
      timeRange: data.timeRange,
      startTime: data.startTime.toDate(),
      endTime: data.endTime.toDate(),
      metrics: data.metrics,
      insights: data.insights,
      recommendations: data.recommendations,
      createdAt: data.createdAt.toDate()
    };
  }
};

export const consumptionDataConverter: FirestoreDataConverter<ConsumptionData, DocumentData> = {
  toFirestore: (data: WithFieldValue<ConsumptionData>): DocumentData => {
    const consumptionData = data as ConsumptionData;
    return {
      deviceId: consumptionData.deviceId,
      userId: consumptionData.userId,
      metrics: {
        power: consumptionData.metrics.power,
        voltage: consumptionData.metrics.voltage,
        current: consumptionData.metrics.current,
        frequency: consumptionData.metrics.frequency,
        powerFactor: consumptionData.metrics.powerFactor,
        timestamp: Timestamp.fromDate(consumptionData.metrics.timestamp)
      },
      cost: consumptionData.cost,
      carbonEmissions: consumptionData.carbonEmissions,
      metadata: {
        createdAt: Timestamp.fromDate(consumptionData.metadata.createdAt),
        lastUpdated: Timestamp.fromDate(consumptionData.metadata.lastUpdated)
      }
    };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>): ConsumptionData => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      deviceId: data.deviceId,
      userId: data.userId,
      metrics: {
        power: data.metrics.power,
        voltage: data.metrics.voltage,
        current: data.metrics.current,
        frequency: data.metrics.frequency,
        powerFactor: data.metrics.powerFactor,
        timestamp: data.metrics.timestamp.toDate()
      },
      cost: data.cost,
      carbonEmissions: data.carbonEmissions,
      metadata: {
        createdAt: data.metadata.createdAt.toDate(),
        lastUpdated: data.metadata.lastUpdated.toDate()
      }
    };
  }
};

export const productionDataConverter: FirestoreDataConverter<ProductionData, DocumentData> = {
  toFirestore: (data: WithFieldValue<ProductionData>): DocumentData => {
    const productionData = data as ProductionData;
    return {
      deviceId: productionData.deviceId,
      userId: productionData.userId,
      metrics: {
        power: productionData.metrics.power,
        voltage: productionData.metrics.voltage,
        current: productionData.metrics.current,
        frequency: productionData.metrics.frequency,
        powerFactor: productionData.metrics.powerFactor,
        timestamp: productionData.metrics.timestamp
      },
      efficiency: productionData.efficiency,
      carbonOffset: productionData.carbonOffset,
      metadata: {
        createdAt: productionData.metadata.createdAt,
        lastUpdated: productionData.metadata.lastUpdated
      }
    };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>): ProductionData => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      deviceId: data.deviceId,
      userId: data.userId,
      metrics: {
        power: data.metrics.power,
        voltage: data.metrics.voltage,
        current: data.metrics.current,
        frequency: data.metrics.frequency,
        powerFactor: data.metrics.powerFactor,
        timestamp: data.metrics.timestamp
      },
      efficiency: data.efficiency,
      carbonOffset: data.carbonOffset,
      metadata: {
        createdAt: data.metadata.createdAt,
        lastUpdated: data.metadata.lastUpdated
      }
    };
  }
};

export const performanceMetricsConverter: FirestoreDataConverter<PerformanceMetrics, DocumentData> = {
  toFirestore: (data: WithFieldValue<PerformanceMetrics>): DocumentData => {
    const performanceData = data as PerformanceMetrics;
    return {
      deviceId: performanceData.deviceId,
      userId: performanceData.userId,
      metrics: {
        uptime: performanceData.metrics.uptime,
        availability: performanceData.metrics.availability,
        reliability: performanceData.metrics.reliability,
        efficiency: performanceData.metrics.efficiency,
        timestamp: performanceData.metrics.timestamp
      },
      metadata: {
        createdAt: performanceData.metadata.createdAt,
        lastUpdated: performanceData.metadata.lastUpdated
      }
    };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>): PerformanceMetrics => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      deviceId: data.deviceId,
      userId: data.userId,
      metrics: {
        uptime: data.metrics.uptime,
        availability: data.metrics.availability,
        reliability: data.metrics.reliability,
        efficiency: data.metrics.efficiency,
        timestamp: data.metrics.timestamp
      },
      metadata: {
        createdAt: data.metadata.createdAt,
        lastUpdated: data.metadata.lastUpdated
      }
    };
  }
};

export const analyticsSummaryConverter: FirestoreDataConverter<AnalyticsSummary, DocumentData> = {
  toFirestore: (data: WithFieldValue<AnalyticsSummary>): DocumentData => {
    const summaryData = data as AnalyticsSummary;
    return {
      userId: summaryData.userId,
      period: {
        start: summaryData.period.start,
        end: summaryData.period.end
      },
      consumption: {
        total: summaryData.consumption.total,
        peak: summaryData.consumption.peak,
        average: summaryData.consumption.average,
        cost: summaryData.consumption.cost,
        carbonEmissions: summaryData.consumption.carbonEmissions
      },
      production: {
        total: summaryData.production.total,
        peak: summaryData.production.peak,
        average: summaryData.production.average,
        efficiency: summaryData.production.efficiency,
        carbonOffset: summaryData.production.carbonOffset
      },
      performance: {
        averageUptime: summaryData.performance.averageUptime,
        averageAvailability: summaryData.performance.averageAvailability,
        averageReliability: summaryData.performance.averageReliability,
        averageEfficiency: summaryData.performance.averageEfficiency
      },
      metadata: {
        createdAt: summaryData.metadata.createdAt,
        lastUpdated: summaryData.metadata.lastUpdated
      }
    };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>): AnalyticsSummary => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId,
      period: {
        start: data.period.start,
        end: data.period.end
      },
      consumption: {
        total: data.consumption.total,
        peak: data.consumption.peak,
        average: data.consumption.average,
        cost: data.consumption.cost,
        carbonEmissions: data.consumption.carbonEmissions
      },
      production: {
        total: data.production.total,
        peak: data.production.peak,
        average: data.production.average,
        efficiency: data.production.efficiency,
        carbonOffset: data.production.carbonOffset
      },
      performance: {
        averageUptime: data.performance.averageUptime,
        averageAvailability: data.performance.averageAvailability,
        averageReliability: data.performance.averageReliability,
        averageEfficiency: data.performance.averageEfficiency
      },
      metadata: {
        createdAt: data.metadata.createdAt,
        lastUpdated: data.metadata.lastUpdated
      }
    };
  }
};

export const metricConverter: FirestoreDataConverter<Metric, DocumentData> = {
  toFirestore: (data: WithFieldValue<Metric>): DocumentData => {
    const metric = data as Metric;
    const baseData = {
      userId: metric.userId,
      type: metric.type,
      name: metric.name,
      description: metric.description,
      value: metric.value,
      unit: metric.unit,
      metadata: {
        createdAt: Timestamp.fromDate(metric.metadata.createdAt),
        lastUpdated: Timestamp.fromDate(metric.metadata.lastUpdated),
        version: metric.metadata.version,
        tags: metric.metadata.tags,
        notes: metric.metadata.notes
      }
    };

    switch (metric.type) {
      case 'energy':
        return {
          ...baseData,
          consumption: metric.consumption,
          production: metric.production,
          efficiency: metric.efficiency,
          carbonEmissions: metric.carbonEmissions,
          timeRange: {
            type: metric.timeRange.type,
            start: Timestamp.fromDate(metric.timeRange.start),
            end: Timestamp.fromDate(metric.timeRange.end)
          }
        };
      case 'performance':
        return {
          ...baseData,
          uptime: metric.uptime,
          availability: metric.availability,
          reliability: metric.reliability,
          efficiency: metric.efficiency,
          timeRange: {
            type: metric.timeRange.type,
            start: Timestamp.fromDate(metric.timeRange.start),
            end: Timestamp.fromDate(metric.timeRange.end)
          }
        };
      case 'cost':
        return {
          ...baseData,
          totalCost: metric.totalCost,
          energyCost: metric.energyCost,
          maintenanceCost: metric.maintenanceCost,
          savings: metric.savings,
          roi: metric.roi,
          timeRange: {
            type: metric.timeRange.type,
            start: Timestamp.fromDate(metric.timeRange.start),
            end: Timestamp.fromDate(metric.timeRange.end)
          }
        };
      case 'maintenance':
        return {
          ...baseData,
          totalEvents: metric.totalEvents,
          preventiveEvents: metric.preventiveEvents,
          correctiveEvents: metric.correctiveEvents,
          downtime: metric.downtime,
          timeRange: {
            type: metric.timeRange.type,
            start: Timestamp.fromDate(metric.timeRange.start),
            end: Timestamp.fromDate(metric.timeRange.end)
          }
        };
      case 'security':
        return {
          ...baseData,
          totalEvents: metric.totalEvents,
          criticalEvents: metric.criticalEvents,
          resolvedEvents: metric.resolvedEvents,
          responseTime: metric.responseTime,
          timeRange: {
            type: metric.timeRange.type,
            start: Timestamp.fromDate(metric.timeRange.start),
            end: Timestamp.fromDate(metric.timeRange.end)
          }
        };
    }
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>): Metric => {
    const data = snapshot.data();
    const baseMetric = {
      id: snapshot.id,
      userId: data.userId,
      type: data.type,
      name: data.name,
      description: data.description,
      value: data.value,
      unit: data.unit,
      metadata: {
        createdAt: data.metadata.createdAt.toDate(),
        lastUpdated: data.metadata.lastUpdated.toDate(),
        version: data.metadata.version,
        tags: data.metadata.tags,
        notes: data.metadata.notes
      }
    };

    switch (data.type) {
      case 'energy':
        return {
          ...baseMetric,
          consumption: data.consumption,
          production: data.production,
          efficiency: data.efficiency,
          carbonEmissions: data.carbonEmissions,
          timeRange: {
            type: data.timeRange.type,
            start: data.timeRange.start.toDate(),
            end: data.timeRange.end.toDate()
          }
        } as EnergyMetric;
      case 'performance':
        return {
          ...baseMetric,
          uptime: data.uptime,
          availability: data.availability,
          reliability: data.reliability,
          efficiency: data.efficiency,
          timeRange: {
            type: data.timeRange.type,
            start: data.timeRange.start.toDate(),
            end: data.timeRange.end.toDate()
          }
        } as PerformanceMetric;
      case 'cost':
        return {
          ...baseMetric,
          totalCost: data.totalCost,
          energyCost: data.energyCost,
          maintenanceCost: data.maintenanceCost,
          savings: data.savings,
          roi: data.roi,
          timeRange: {
            type: data.timeRange.type,
            start: data.timeRange.start.toDate(),
            end: data.timeRange.end.toDate()
          }
        } as CostMetric;
      case 'maintenance':
        return {
          ...baseMetric,
          totalEvents: data.totalEvents,
          preventiveEvents: data.preventiveEvents,
          correctiveEvents: data.correctiveEvents,
          downtime: data.downtime,
          timeRange: {
            type: data.timeRange.type,
            start: data.timeRange.start.toDate(),
            end: data.timeRange.end.toDate()
          }
        } as MaintenanceMetric;
      case 'security':
        return {
          ...baseMetric,
          totalEvents: data.totalEvents,
          criticalEvents: data.criticalEvents,
          resolvedEvents: data.resolvedEvents,
          responseTime: data.responseTime,
          timeRange: {
            type: data.timeRange.type,
            start: data.timeRange.start.toDate(),
            end: data.timeRange.end.toDate()
          }
        } as SecurityMetric;
      default:
        throw new Error(`Unknown metric type: ${data.type}`);
    }
  }
};

export const analysisResultConverter: FirestoreDataConverter<AnalysisResult, DocumentData> = {
  toFirestore: (data: WithFieldValue<AnalysisResult>): DocumentData => {
    const result = data as AnalysisResult;
    return {
      userId: result.userId,
      type: result.type,
      metrics: result.metrics,
      result: result.result,
      metadata: {
        createdAt: Timestamp.fromDate(result.metadata.createdAt),
        lastUpdated: Timestamp.fromDate(result.metadata.lastUpdated),
        version: result.metadata.version,
        tags: result.metadata.tags,
        notes: result.metadata.notes
      }
    };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>): AnalysisResult => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId,
      type: data.type,
      metrics: data.metrics,
      result: data.result,
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

export type AnalyticsType = 'energy' | 'performance' | 'financial' | 'maintenance' | 'security';
export type AggregationType = 'sum' | 'average' | 'min' | 'max' | 'count';

export interface AnalyticsMetadata {
  createdAt: Date;
  lastUpdated: Date;
  timeRange: TimeRange;
  aggregationType: AggregationType;
  version: number;
  tags: string[];
  notes?: string;
}

export interface BaseAnalytics {
  id: string;
  userId: string;
  type: AnalyticsType;
  title: string;
  description: string;
  metadata: AnalyticsMetadata;
}

export interface EnergyAnalytics extends BaseAnalytics {
  type: 'energy';
  consumption: {
    total: number;
    bySource: Record<EnergySource, number>;
    byDevice: Record<string, number>;
    byTime: Record<string, number>;
  };
  production: {
    total: number;
    bySource: Record<EnergySource, number>;
    byDevice: Record<string, number>;
    byTime: Record<string, number>;
  };
  efficiency: {
    overall: number;
    byDevice: Record<string, number>;
    byTime: Record<string, number>;
  };
}

export interface PerformanceAnalytics extends BaseAnalytics {
  type: 'performance';
  devicePerformance: {
    byType: Record<DeviceType, {
      uptime: number;
      efficiency: number;
      failures: number;
      maintenance: number;
    }>;
    byDevice: Record<string, {
      uptime: number;
      efficiency: number;
      failures: number;
      maintenance: number;
    }>;
  };
  systemPerformance: {
    overall: number;
    byComponent: Record<string, number>;
    byTime: Record<string, number>;
  };
}

export interface FinancialAnalytics extends BaseAnalytics {
  type: 'financial';
  costs: {
    total: number;
    byCategory: Record<string, number>;
    byTime: Record<string, number>;
  };
  savings: {
    total: number;
    bySource: Record<string, number>;
    byTime: Record<string, number>;
  };
  roi: {
    overall: number;
    byInvestment: Record<string, number>;
    byTime: Record<string, number>;
  };
}

export interface MaintenanceAnalytics extends BaseAnalytics {
  type: 'maintenance';
  maintenance: {
    total: number;
    byType: Record<string, number>;
    byDevice: Record<string, number>;
    byTime: Record<string, number>;
  };
  downtime: {
    total: number;
    byDevice: Record<string, number>;
    byTime: Record<string, number>;
  };
  costs: {
    total: number;
    byType: Record<string, number>;
    byDevice: Record<string, number>;
  };
}

export interface SecurityAnalytics extends BaseAnalytics {
  type: 'security';
  incidents: {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    byTime: Record<string, number>;
  };
  threats: {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    byTime: Record<string, number>;
  };
  responses: {
    total: number;
    byType: Record<string, number>;
    byEffectiveness: Record<string, number>;
    byTime: Record<string, number>;
  };
}

export type Analytics = EnergyAnalytics | PerformanceAnalytics | FinancialAnalytics | MaintenanceAnalytics | SecurityAnalytics;

export const analyticsConverter: FirestoreDataConverter<Analytics, DocumentData> = {
  toFirestore: (data: WithFieldValue<Analytics>): DocumentData => {
    const analytics = data as Analytics;
    const baseData = {
      userId: analytics.userId,
      type: analytics.type,
      title: analytics.title,
      description: analytics.description,
      metadata: {
        createdAt: Timestamp.fromDate(analytics.metadata.createdAt),
        lastUpdated: Timestamp.fromDate(analytics.metadata.lastUpdated),
        timeRange: analytics.metadata.timeRange,
        aggregationType: analytics.metadata.aggregationType,
        version: analytics.metadata.version,
        tags: analytics.metadata.tags,
        notes: analytics.metadata.notes
      }
    };

    switch (analytics.type) {
      case 'energy':
        return {
          ...baseData,
          consumption: analytics.consumption,
          production: analytics.production,
          efficiency: analytics.efficiency
        };
      case 'performance':
        return {
          ...baseData,
          devicePerformance: analytics.devicePerformance,
          systemPerformance: analytics.systemPerformance
        };
      case 'financial':
        return {
          ...baseData,
          costs: analytics.costs,
          savings: analytics.savings,
          roi: analytics.roi
        };
      case 'maintenance':
        return {
          ...baseData,
          maintenance: analytics.maintenance,
          downtime: analytics.downtime,
          costs: analytics.costs
        };
      case 'security':
        return {
          ...baseData,
          incidents: analytics.incidents,
          threats: analytics.threats,
          responses: analytics.responses
        };
    }
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>): Analytics => {
    const data = snapshot.data();
    const baseAnalytics = {
      id: snapshot.id,
      userId: data.userId,
      type: data.type,
      title: data.title,
      description: data.description,
      metadata: {
        createdAt: data.metadata.createdAt.toDate(),
        lastUpdated: data.metadata.lastUpdated.toDate(),
        timeRange: data.metadata.timeRange,
        aggregationType: data.metadata.aggregationType,
        version: data.metadata.version,
        tags: data.metadata.tags,
        notes: data.metadata.notes
      }
    };

    switch (data.type) {
      case 'energy':
        return {
          ...baseAnalytics,
          consumption: data.consumption,
          production: data.production,
          efficiency: data.efficiency
        } as EnergyAnalytics;
      case 'performance':
        return {
          ...baseAnalytics,
          devicePerformance: data.devicePerformance,
          systemPerformance: data.systemPerformance
        } as PerformanceAnalytics;
      case 'financial':
        return {
          ...baseAnalytics,
          costs: data.costs,
          savings: data.savings,
          roi: data.roi
        } as FinancialAnalytics;
      case 'maintenance':
        return {
          ...baseAnalytics,
          maintenance: data.maintenance,
          downtime: data.downtime,
          costs: data.costs
        } as MaintenanceAnalytics;
      case 'security':
        return {
          ...baseAnalytics,
          incidents: data.incidents,
          threats: data.threats,
          responses: data.responses
        } as SecurityAnalytics;
      default:
        throw new Error(`Unknown analytics type: ${data.type}`);
    }
  }
};

export type AnalyticsPeriod = 'hour' | 'day' | 'week' | 'month' | 'year';
export type AnalyticsMetric = 'power' | 'energy' | 'efficiency' | 'cost' | 'carbon';
export type AnalyticsAggregation = 'sum' | 'average' | 'min' | 'max' | 'count';

export interface AnalyticsDataPoint {
  timestamp: Date;
  value: number;
  metadata?: {
    source?: string;
    deviceId?: string;
    tags?: string[];
  };
}

export interface AnalyticsTimeSeries {
  id: string;
  userId: string;
  metric: AnalyticsMetric;
  period: AnalyticsPeriod;
  dataPoints: AnalyticsDataPoint[];
  metadata: {
    createdAt: Date;
    lastUpdated: Date;
    version: number;
    tags: string[];
    notes: string;
  };
}

export interface AnalyticsInsight {
  id: string;
  userId: string;
  type: 'trend' | 'anomaly' | 'optimization' | 'recommendation';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timeRange: {
    start: Date;
    end: Date;
  };
  metrics: {
    metric: AnalyticsMetric;
    value: number;
    change?: number;
    unit?: string;
  }[];
  metadata: {
    createdAt: Date;
    lastUpdated: Date;
    version: number;
    tags: string[];
    notes: string;
  };
}

export interface AnalyticsReport {
  id: string;
  userId: string;
  type: 'summary' | 'detailed' | 'comparative' | 'forecast';
  title: string;
  description: string;
  timeRange: {
    start: Date;
    end: Date;
  };
  metrics: {
    metric: AnalyticsMetric;
    aggregation: AnalyticsAggregation;
    value: number;
    unit?: string;
  }[];
  insights: string[]; // Array of insight IDs
  metadata: {
    createdAt: Date;
    lastUpdated: Date;
    version: number;
    tags: string[];
    notes: string;
  };
}

// Firestore Data Converters
export const analyticsTimeSeriesConverter = {
  toFirestore(data: AnalyticsTimeSeries) {
    return {
      ...data,
      dataPoints: data.dataPoints.map(point => ({
        ...point,
        timestamp: point.timestamp instanceof Date ? Timestamp.fromDate(point.timestamp) : point.timestamp
      })),
      metadata: {
        ...data.metadata,
        createdAt: data.metadata.createdAt instanceof Date ? Timestamp.fromDate(data.metadata.createdAt) : data.metadata.createdAt,
        lastUpdated: data.metadata.lastUpdated instanceof Date ? Timestamp.fromDate(data.metadata.lastUpdated) : data.metadata.lastUpdated
      }
    };
  },
  fromFirestore(snapshot: any): AnalyticsTimeSeries {
    const data = snapshot.data();
    return {
      ...data,
      dataPoints: data.dataPoints.map((point: any) => ({
        ...point,
        timestamp: point.timestamp instanceof Timestamp ? point.timestamp.toDate() : point.timestamp
      })),
      metadata: {
        ...data.metadata,
        createdAt: data.metadata.createdAt instanceof Timestamp ? data.metadata.createdAt.toDate() : data.metadata.createdAt,
        lastUpdated: data.metadata.lastUpdated instanceof Timestamp ? data.metadata.lastUpdated.toDate() : data.metadata.lastUpdated
      }
    };
  }
};

export const analyticsInsightConverter = {
  toFirestore(data: AnalyticsInsight) {
    return {
      ...data,
      timeRange: {
        start: data.timeRange.start instanceof Date ? Timestamp.fromDate(data.timeRange.start) : data.timeRange.start,
        end: data.timeRange.end instanceof Date ? Timestamp.fromDate(data.timeRange.end) : data.timeRange.end
      },
      metadata: {
        ...data.metadata,
        createdAt: data.metadata.createdAt instanceof Date ? Timestamp.fromDate(data.metadata.createdAt) : data.metadata.createdAt,
        lastUpdated: data.metadata.lastUpdated instanceof Date ? Timestamp.fromDate(data.metadata.lastUpdated) : data.metadata.lastUpdated
      }
    };
  },
  fromFirestore(snapshot: any): AnalyticsInsight {
    const data = snapshot.data();
    return {
      ...data,
      timeRange: {
        start: data.timeRange.start instanceof Timestamp ? data.timeRange.start.toDate() : data.timeRange.start,
        end: data.timeRange.end instanceof Timestamp ? data.timeRange.end.toDate() : data.timeRange.end
      },
      metadata: {
        ...data.metadata,
        createdAt: data.metadata.createdAt instanceof Timestamp ? data.metadata.createdAt.toDate() : data.metadata.createdAt,
        lastUpdated: data.metadata.lastUpdated instanceof Timestamp ? data.metadata.lastUpdated.toDate() : data.metadata.lastUpdated
      }
    };
  }
};

export const analyticsReportConverter = {
  toFirestore(data: AnalyticsReport) {
    return {
      ...data,
      timeRange: {
        start: data.timeRange.start instanceof Date ? Timestamp.fromDate(data.timeRange.start) : data.timeRange.start,
        end: data.timeRange.end instanceof Date ? Timestamp.fromDate(data.timeRange.end) : data.timeRange.end
      },
      metadata: {
        ...data.metadata,
        createdAt: data.metadata.createdAt instanceof Date ? Timestamp.fromDate(data.metadata.createdAt) : data.metadata.createdAt,
        lastUpdated: data.metadata.lastUpdated instanceof Date ? Timestamp.fromDate(data.metadata.lastUpdated) : data.metadata.lastUpdated
      }
    };
  },
  fromFirestore(snapshot: any): AnalyticsReport {
    const data = snapshot.data();
    return {
      ...data,
      timeRange: {
        start: data.timeRange.start instanceof Timestamp ? data.timeRange.start.toDate() : data.timeRange.start,
        end: data.timeRange.end instanceof Timestamp ? data.timeRange.end.toDate() : data.timeRange.end
      },
      metadata: {
        ...data.metadata,
        createdAt: data.metadata.createdAt instanceof Timestamp ? data.metadata.createdAt.toDate() : data.metadata.createdAt,
        lastUpdated: data.metadata.lastUpdated instanceof Timestamp ? data.metadata.lastUpdated.toDate() : data.metadata.lastUpdated
      }
    };
  }
}; 