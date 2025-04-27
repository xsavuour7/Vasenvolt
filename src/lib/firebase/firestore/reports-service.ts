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
  FieldValue
} from 'firebase/firestore';
import {
  Report,
  ReportType,
  ReportFormat,
  ReportStatus,
  ReportPriority,
  reportConverter,
  ConsumptionReport,
  ProductionReport,
  PerformanceReport,
  MaintenanceReport,
  SecurityReport,
  FinancialReport
} from './reports-types';

export class ReportsService {
  private static readonly COLLECTION = 'reports';

  // Basic CRUD Operations
  static async getReport(reportId: string): Promise<Report | null> {
    if (!firestore) throw new Error('Firestore not initialized');
    const reportRef = doc(firestore, this.COLLECTION, reportId).withConverter(reportConverter);
    const snapshot = await getDoc(reportRef);
    return snapshot.exists() ? snapshot.data() : null;
  }

  static async getReportsByUser(
    userId: string,
    options: {
      type?: ReportType;
      status?: ReportStatus;
      format?: ReportFormat;
      priority?: ReportPriority;
      limit?: number;
      startAfter?: string;
    } = {}
  ): Promise<Report[]> {
    if (!firestore) throw new Error('Firestore not initialized');
    const reportRef = collection(firestore, this.COLLECTION).withConverter(reportConverter);
    let q = query(reportRef, where('userId', '==', userId));

    if (options.type) q = query(q, where('type', '==', options.type));
    if (options.status) q = query(q, where('status', '==', options.status));
    if (options.format) q = query(q, where('format', '==', options.format));
    if (options.priority) q = query(q, where('priority', '==', options.priority));
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

  static async createReport(report: Omit<Report, 'id' | 'metadata'>): Promise<Report> {
    if (!firestore) throw new Error('Firestore not initialized');
    const reportRef = collection(firestore, this.COLLECTION).withConverter(reportConverter);
    const metadata = {
      createdAt: Timestamp.now(),
      lastUpdated: Timestamp.now(),
      version: 1,
      tags: [],
      notes: ''
    };
    const docRef = await addDoc(reportRef, { ...report, metadata } as unknown as WithFieldValue<Report>);
    const snapshot = await getDoc(docRef.withConverter(reportConverter));
    return snapshot.data()!;
  }

  static async updateReport(
    reportId: string,
    updates: Partial<Omit<Report, 'id' | 'userId' | 'type' | 'metadata'>>
  ): Promise<void> {
    if (!firestore) throw new Error('Firestore not initialized');
    const reportRef = doc(firestore, this.COLLECTION, reportId).withConverter(reportConverter);
    const metadata = {
      lastUpdated: new Date()
    };
    await updateDoc(reportRef, { ...updates, metadata });
  }

  static async deleteReport(reportId: string): Promise<void> {
    if (!firestore) throw new Error('Firestore not initialized');
    const reportRef = doc(firestore, this.COLLECTION, reportId);
    await deleteDoc(reportRef);
  }

  // Status Management
  static async updateReportStatus(reportId: string, status: ReportStatus): Promise<void> {
    if (!firestore) throw new Error('Firestore not initialized');
    const reportRef = doc(firestore, this.COLLECTION, reportId).withConverter(reportConverter);
    await updateDoc(reportRef, {
      status,
      metadata: {
        lastUpdated: new Date()
      }
    });
  }

  static async markReportAsCompleted(reportId: string): Promise<void> {
    await this.updateReportStatus(reportId, 'completed');
  }

  static async markReportAsFailed(reportId: string, error: string): Promise<void> {
    if (!firestore) throw new Error('Firestore not initialized');
    const reportRef = doc(firestore, this.COLLECTION, reportId).withConverter(reportConverter);
    await updateDoc(reportRef, {
      status: 'failed',
      error,
      metadata: {
        lastUpdated: new Date()
      }
    });
  }

  // Type-specific Operations
  static async createConsumptionReport(
    userId: string,
    timeRange: { start: Date; end: Date },
    metrics: ConsumptionReport['metrics'],
    format: ReportFormat = 'pdf',
    priority: ReportPriority = 'medium'
  ): Promise<Report> {
    const report: Omit<ConsumptionReport, 'id' | 'metadata'> = {
      userId,
      type: 'consumption',
      title: 'Energy Consumption Report',
      description: `Energy consumption report for ${timeRange.start.toLocaleDateString()} to ${timeRange.end.toLocaleDateString()}`,
      format,
      status: 'pending',
      priority,
      timeRange,
      metrics,
      insights: [],
      recommendations: []
    };
    return this.createReport(report);
  }

  static async createProductionReport(
    userId: string,
    timeRange: { start: Date; end: Date },
    metrics: ProductionReport['metrics'],
    format: ReportFormat = 'pdf',
    priority: ReportPriority = 'medium'
  ): Promise<Report> {
    const report: Omit<ProductionReport, 'id' | 'metadata'> = {
      userId,
      type: 'production',
      title: 'Energy Production Report',
      description: `Energy production report for ${timeRange.start.toLocaleDateString()} to ${timeRange.end.toLocaleDateString()}`,
      format,
      status: 'pending',
      priority,
      timeRange,
      metrics,
      insights: [],
      recommendations: []
    };
    return this.createReport(report);
  }

  static async createPerformanceReport(
    userId: string,
    timeRange: { start: Date; end: Date },
    metrics: PerformanceReport['metrics'],
    format: ReportFormat = 'pdf',
    priority: ReportPriority = 'medium'
  ): Promise<Report> {
    const report: Omit<PerformanceReport, 'id' | 'metadata'> = {
      userId,
      type: 'performance',
      title: 'Device Performance Report',
      description: `Device performance report for ${timeRange.start.toLocaleDateString()} to ${timeRange.end.toLocaleDateString()}`,
      format,
      status: 'pending',
      priority,
      timeRange,
      metrics,
      insights: [],
      recommendations: []
    };
    return this.createReport(report);
  }

  static async createMaintenanceReport(
    userId: string,
    timeRange: { start: Date; end: Date },
    metrics: MaintenanceReport['metrics'],
    format: ReportFormat = 'pdf',
    priority: ReportPriority = 'medium'
  ): Promise<Report> {
    const report: Omit<MaintenanceReport, 'id' | 'metadata'> = {
      userId,
      type: 'maintenance',
      title: 'Maintenance Report',
      description: `Maintenance report for ${timeRange.start.toLocaleDateString()} to ${timeRange.end.toLocaleDateString()}`,
      format,
      status: 'pending',
      priority,
      timeRange,
      metrics,
      insights: [],
      recommendations: []
    };
    return this.createReport(report);
  }

  static async createSecurityReport(
    userId: string,
    timeRange: { start: Date; end: Date },
    metrics: SecurityReport['metrics'],
    format: ReportFormat = 'pdf',
    priority: ReportPriority = 'high'
  ): Promise<Report> {
    const report: Omit<SecurityReport, 'id' | 'metadata'> = {
      userId,
      type: 'security',
      title: 'Security Report',
      description: `Security report for ${timeRange.start.toLocaleDateString()} to ${timeRange.end.toLocaleDateString()}`,
      format,
      status: 'pending',
      priority,
      timeRange,
      metrics,
      insights: [],
      recommendations: []
    };
    return this.createReport(report);
  }

  static async createFinancialReport(
    userId: string,
    timeRange: { start: Date; end: Date },
    metrics: FinancialReport['metrics'],
    format: ReportFormat = 'pdf',
    priority: ReportPriority = 'medium'
  ): Promise<Report> {
    const report: Omit<FinancialReport, 'id' | 'metadata'> = {
      userId,
      type: 'financial',
      title: 'Financial Report',
      description: `Financial report for ${timeRange.start.toLocaleDateString()} to ${timeRange.end.toLocaleDateString()}`,
      format,
      status: 'pending',
      priority,
      timeRange,
      metrics,
      insights: [],
      recommendations: []
    };
    return this.createReport(report);
  }

  // Real-time Listeners
  static onReportUpdate(
    reportId: string,
    callback: (report: Report | null) => void
  ): Unsubscribe {
    if (!firestore) throw new Error('Firestore not initialized');
    const reportRef = doc(firestore, this.COLLECTION, reportId).withConverter(reportConverter);
    return onSnapshot(reportRef, (snapshot) => {
      callback(snapshot.exists() ? snapshot.data() : null);
    });
  }

  static onUserReportsUpdate(
    userId: string,
    callback: (reports: Report[]) => void,
    options: {
      type?: ReportType;
      status?: ReportStatus;
      format?: ReportFormat;
      priority?: ReportPriority;
      limit?: number;
    } = {}
  ): Unsubscribe {
    if (!firestore) throw new Error('Firestore not initialized');
    const reportRef = collection(firestore, this.COLLECTION).withConverter(reportConverter);
    let q = query(reportRef, where('userId', '==', userId));

    if (options.type) q = query(q, where('type', '==', options.type));
    if (options.status) q = query(q, where('status', '==', options.status));
    if (options.format) q = query(q, where('format', '==', options.format));
    if (options.priority) q = query(q, where('priority', '==', options.priority));
    if (options.limit) q = query(q, firestoreLimit(options.limit));

    q = query(q, orderBy('metadata.createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data()));
    });
  }

  // Utility Methods
  static async getReportStats(userId: string): Promise<{
    total: number;
    byType: Record<ReportType, number>;
    byStatus: Record<ReportStatus, number>;
    byFormat: Record<ReportFormat, number>;
    byPriority: Record<ReportPriority, number>;
  }> {
    if (!firestore) throw new Error('Firestore not initialized');
    const reportRef = collection(firestore, this.COLLECTION).withConverter(reportConverter);
    const q = query(reportRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    const stats = {
      total: 0,
      byType: {} as Record<ReportType, number>,
      byStatus: {} as Record<ReportStatus, number>,
      byFormat: {} as Record<ReportFormat, number>,
      byPriority: {} as Record<ReportPriority, number>
    };

    snapshot.docs.forEach(doc => {
      const report = doc.data();
      stats.total++;
      stats.byType[report.type] = (stats.byType[report.type] || 0) + 1;
      stats.byStatus[report.status] = (stats.byStatus[report.status] || 0) + 1;
      stats.byFormat[report.format] = (stats.byFormat[report.format] || 0) + 1;
      stats.byPriority[report.priority] = (stats.byPriority[report.priority] || 0) + 1;
    });

    return stats;
  }
} 