import { Timestamp, DocumentData, WithFieldValue, FirestoreDataConverter } from 'firebase/firestore';

export type ReportType = 'energy_consumption' | 'energy_production' | 'cost_analysis' | 'sustainability' | 'device_performance';
export type ReportFormat = 'pdf' | 'csv' | 'json';
export type ReportStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type TimeRange = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

export interface ReportMetrics {
  totalEnergy: number; // in kWh
  totalCost: number; // in currency
  carbonEmissions: number; // in kg CO2
  peakDemand: number; // in kW
  averageEfficiency: number; // percentage
  savings: {
    energy: number; // in kWh
    cost: number; // in currency
    carbon: number; // in kg CO2
  };
}

export interface DevicePerformanceMetrics {
  deviceId: string;
  name: string;
  type: string;
  energyConsumption: number;
  efficiency: number;
  uptime: number;
  maintenanceCosts: number;
  performanceScore: number;
}

export interface EnergyReport {
  id: string;
  userId: string;
  type: ReportType;
  title: string;
  description: string;
  timeRange: TimeRange;
  startDate: Date;
  endDate: Date;
  metrics: ReportMetrics;
  deviceMetrics?: DevicePerformanceMetrics[];
  status: ReportStatus;
  format: ReportFormat;
  downloadUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportFilter {
  deviceIds?: string[];
  timeRange?: TimeRange;
  startDate?: Date;
  endDate?: Date;
  format?: ReportFormat;
}

// Firestore data converter
export const reportConverter: FirestoreDataConverter<EnergyReport, DocumentData> = {
  toFirestore: (report: WithFieldValue<EnergyReport>): DocumentData => {
    return {
      userId: report.userId,
      type: report.type,
      title: report.title,
      description: report.description,
      timeRange: report.timeRange,
      startDate: report.startDate instanceof Date 
        ? Timestamp.fromDate(report.startDate)
        : report.startDate,
      endDate: report.endDate instanceof Date 
        ? Timestamp.fromDate(report.endDate)
        : report.endDate,
      metrics: report.metrics,
      deviceMetrics: report.deviceMetrics,
      status: report.status,
      format: report.format,
      downloadUrl: report.downloadUrl,
      createdAt: report.createdAt instanceof Date 
        ? Timestamp.fromDate(report.createdAt)
        : report.createdAt,
      updatedAt: report.updatedAt instanceof Date 
        ? Timestamp.fromDate(report.updatedAt)
        : report.updatedAt
    };
  },
  fromFirestore: (snapshot: DocumentData): EnergyReport => {
    const data = snapshot;
    return {
      id: snapshot.id,
      userId: data.userId,
      type: data.type,
      title: data.title,
      description: data.description,
      timeRange: data.timeRange,
      startDate: data.startDate.toDate(),
      endDate: data.endDate.toDate(),
      metrics: data.metrics,
      deviceMetrics: data.deviceMetrics,
      status: data.status,
      format: data.format,
      downloadUrl: data.downloadUrl,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    };
  }
}; 