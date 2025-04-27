import { Timestamp, DocumentData, WithFieldValue, FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase/firestore';
import { convertToTimestamps, convertToDates } from '../utils/date-utils';

export type ReportType = 'consumption' | 'production' | 'performance' | 'maintenance' | 'security' | 'financial';
export type ReportFormat = 'pdf' | 'csv' | 'json' | 'excel';
export type ReportStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type ReportPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ReportMetadata {
  createdAt: Date;
  lastUpdated: Date;
  expiresAt?: Date;
  version: number;
  tags: string[];
  notes?: string;
}

export interface BaseReport {
  id: string;
  userId: string;
  type: ReportType;
  title: string;
  description?: string;
  format: ReportFormat;
  status: ReportStatus;
  priority: ReportPriority;
  metadata: ReportMetadata;
}

export interface ConsumptionReport extends BaseReport {
  type: 'consumption';
  timeRange: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalConsumption: number;
    peakDemand: number;
    averageConsumption: number;
    cost: number;
    carbonEmissions: number;
    bySource: Record<string, {
      consumption: number;
      cost: number;
      carbonEmissions: number;
    }>;
  };
  insights: string[];
  recommendations: string[];
}

export interface ProductionReport extends BaseReport {
  type: 'production';
  timeRange: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalProduction: number;
    peakOutput: number;
    averageOutput: number;
    efficiency: number;
    revenue: number;
    carbonOffset: number;
    bySource: Record<string, {
      production: number;
      efficiency: number;
      revenue: number;
      carbonOffset: number;
    }>;
  };
  insights: string[];
  recommendations: string[];
}

export interface PerformanceReport extends BaseReport {
  type: 'performance';
  timeRange: {
    start: Date;
    end: Date;
  };
  metrics: {
    uptime: number;
    availability: number;
    reliability: number;
    efficiency: number;
    byDevice: Record<string, {
      uptime: number;
      availability: number;
      reliability: number;
      efficiency: number;
      issues: number;
    }>;
  };
  insights: string[];
  recommendations: string[];
}

export interface MaintenanceReport extends BaseReport {
  type: 'maintenance';
  timeRange: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalMaintenanceEvents: number;
    criticalIssues: number;
    preventiveMaintenance: number;
    correctiveMaintenance: number;
    byDevice: Record<string, {
      totalEvents: number;
      criticalIssues: number;
      preventiveMaintenance: number;
      correctiveMaintenance: number;
      downtime: number;
    }>;
  };
  insights: string[];
  recommendations: string[];
}

export interface SecurityReport extends BaseReport {
  type: 'security';
  timeRange: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalSecurityEvents: number;
    criticalAlerts: number;
    unauthorizedAccess: number;
    systemBreaches: number;
    byDevice: Record<string, {
      totalEvents: number;
      criticalAlerts: number;
      unauthorizedAccess: number;
      systemBreaches: number;
    }>;
  };
  insights: string[];
  recommendations: string[];
}

export interface FinancialReport extends BaseReport {
  type: 'financial';
  timeRange: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalRevenue: number;
    totalCost: number;
    netIncome: number;
    roi: number;
    byCategory: Record<string, {
      revenue: number;
      cost: number;
      profit: number;
    }>;
  };
  insights: string[];
  recommendations: string[];
}

export type Report = ConsumptionReport | ProductionReport | PerformanceReport | MaintenanceReport | SecurityReport | FinancialReport;

// Firestore data converter
export const reportConverter: FirestoreDataConverter<Report, DocumentData> = {
  toFirestore: (data: WithFieldValue<Report>): DocumentData => {
    const report = data as Report;
    const baseData = {
      userId: report.userId,
      type: report.type,
      title: report.title,
      description: report.description,
      format: report.format,
      status: report.status,
      priority: report.priority,
      metadata: {
        createdAt: Timestamp.fromDate(report.metadata.createdAt),
        lastUpdated: Timestamp.fromDate(report.metadata.lastUpdated),
        expiresAt: report.metadata.expiresAt ? Timestamp.fromDate(report.metadata.expiresAt) : null,
        version: report.metadata.version,
        tags: report.metadata.tags,
        notes: report.metadata.notes
      }
    };

    switch (report.type) {
      case 'consumption':
        return {
          ...baseData,
          timeRange: {
            start: Timestamp.fromDate(report.timeRange.start),
            end: Timestamp.fromDate(report.timeRange.end)
          },
          metrics: report.metrics,
          insights: report.insights,
          recommendations: report.recommendations
        };
      case 'production':
        return {
          ...baseData,
          timeRange: {
            start: Timestamp.fromDate(report.timeRange.start),
            end: Timestamp.fromDate(report.timeRange.end)
          },
          metrics: report.metrics,
          insights: report.insights,
          recommendations: report.recommendations
        };
      case 'performance':
        return {
          ...baseData,
          timeRange: {
            start: Timestamp.fromDate(report.timeRange.start),
            end: Timestamp.fromDate(report.timeRange.end)
          },
          metrics: report.metrics,
          insights: report.insights,
          recommendations: report.recommendations
        };
      case 'maintenance':
        return {
          ...baseData,
          timeRange: {
            start: Timestamp.fromDate(report.timeRange.start),
            end: Timestamp.fromDate(report.timeRange.end)
          },
          metrics: report.metrics,
          insights: report.insights,
          recommendations: report.recommendations
        };
      case 'security':
        return {
          ...baseData,
          timeRange: {
            start: Timestamp.fromDate(report.timeRange.start),
            end: Timestamp.fromDate(report.timeRange.end)
          },
          metrics: report.metrics,
          insights: report.insights,
          recommendations: report.recommendations
        };
      case 'financial':
        return {
          ...baseData,
          timeRange: {
            start: Timestamp.fromDate(report.timeRange.start),
            end: Timestamp.fromDate(report.timeRange.end)
          },
          metrics: report.metrics,
          insights: report.insights,
          recommendations: report.recommendations
        };
    }
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>): Report => {
    const data = snapshot.data();
    const baseReport = {
      id: snapshot.id,
      userId: data.userId,
      type: data.type,
      title: data.title,
      description: data.description,
      format: data.format,
      status: data.status,
      priority: data.priority,
      metadata: {
        createdAt: data.metadata.createdAt.toDate(),
        lastUpdated: data.metadata.lastUpdated.toDate(),
        expiresAt: data.metadata.expiresAt?.toDate(),
        version: data.metadata.version,
        tags: data.metadata.tags,
        notes: data.metadata.notes
      }
    };

    switch (data.type) {
      case 'consumption':
        return {
          ...baseReport,
          timeRange: {
            start: data.timeRange.start.toDate(),
            end: data.timeRange.end.toDate()
          },
          metrics: data.metrics,
          insights: data.insights,
          recommendations: data.recommendations
        } as ConsumptionReport;
      case 'production':
        return {
          ...baseReport,
          timeRange: {
            start: data.timeRange.start.toDate(),
            end: data.timeRange.end.toDate()
          },
          metrics: data.metrics,
          insights: data.insights,
          recommendations: data.recommendations
        } as ProductionReport;
      case 'performance':
        return {
          ...baseReport,
          timeRange: {
            start: data.timeRange.start.toDate(),
            end: data.timeRange.end.toDate()
          },
          metrics: data.metrics,
          insights: data.insights,
          recommendations: data.recommendations
        } as PerformanceReport;
      case 'maintenance':
        return {
          ...baseReport,
          timeRange: {
            start: data.timeRange.start.toDate(),
            end: data.timeRange.end.toDate()
          },
          metrics: data.metrics,
          insights: data.insights,
          recommendations: data.recommendations
        } as MaintenanceReport;
      case 'security':
        return {
          ...baseReport,
          timeRange: {
            start: data.timeRange.start.toDate(),
            end: data.timeRange.end.toDate()
          },
          metrics: data.metrics,
          insights: data.insights,
          recommendations: data.recommendations
        } as SecurityReport;
      case 'financial':
        return {
          ...baseReport,
          timeRange: {
            start: data.timeRange.start.toDate(),
            end: data.timeRange.end.toDate()
          },
          metrics: data.metrics,
          insights: data.insights,
          recommendations: data.recommendations
        } as FinancialReport;
      default:
        throw new Error(`Unknown report type: ${data.type}`);
    }
  }
}; 