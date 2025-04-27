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
  DocumentData,
  WithFieldValue
} from 'firebase/firestore';
import {
  EnergyReport,
  ReportType,
  ReportFormat,
  ReportStatus,
  TimeRange,
  ReportFilter,
  reportConverter
} from './report-types';

export class ReportService {
  private static readonly COLLECTIONS = {
    REPORTS: 'reports'
  };

  // Basic CRUD Operations
  static async getReport(reportId: string): Promise<EnergyReport | null> {
    if (!firestore) throw new Error('Firestore not initialized');
    const reportRef = doc(firestore, this.COLLECTIONS.REPORTS, reportId).withConverter(reportConverter);
    const snapshot = await getDoc(reportRef);
    return snapshot.exists() ? snapshot.data() : null;
  }

  static async getReportsByUser(
    userId: string,
    options: {
      type?: ReportType;
      status?: ReportStatus;
      timeRange?: TimeRange;
      limit?: number;
    } = {}
  ): Promise<EnergyReport[]> {
    if (!firestore) throw new Error('Firestore not initialized');
    const reportsRef = collection(firestore, this.COLLECTIONS.REPORTS).withConverter(reportConverter);
    
    let q = query(
      reportsRef,
      where('userId', '==', userId)
    );

    if (options.type) {
      q = query(q, where('type', '==', options.type));
    }

    if (options.status) {
      q = query(q, where('status', '==', options.status));
    }

    if (options.timeRange) {
      q = query(q, where('timeRange', '==', options.timeRange));
    }

    q = query(q, orderBy('createdAt', 'desc'));

    if (options.limit) {
      q = query(q, firestoreLimit(options.limit));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  static async createReport<T extends EnergyReport>(
    report: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'downloadUrl'>
  ): Promise<T> {
    if (!firestore) throw new Error('Firestore not initialized');
    const reportsRef = collection(firestore, this.COLLECTIONS.REPORTS).withConverter(reportConverter);
    const docRef = await addDoc(reportsRef, {
      ...report,
      status: 'pending' as ReportStatus,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    } as WithFieldValue<T>);
    const snapshot = await getDoc(docRef);
    return snapshot.data() as T;
  }

  static async updateReport(
    reportId: string,
    data: Partial<EnergyReport>
  ): Promise<void> {
    if (!firestore) throw new Error('Firestore not initialized');
    const reportRef = doc(firestore, this.COLLECTIONS.REPORTS, reportId).withConverter(reportConverter);
    await updateDoc(reportRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  }

  static async deleteReport(reportId: string): Promise<void> {
    if (!firestore) throw new Error('Firestore not initialized');
    const reportRef = doc(firestore, this.COLLECTIONS.REPORTS, reportId).withConverter(reportConverter);
    await deleteDoc(reportRef);
  }

  // Status Management
  static async updateReportStatus(
    reportId: string,
    status: ReportStatus,
    downloadUrl?: string
  ): Promise<void> {
    await this.updateReport(reportId, { 
      status,
      ...(downloadUrl && { downloadUrl })
    });
  }

  static async markReportAsCompleted(reportId: string, downloadUrl: string): Promise<void> {
    await this.updateReportStatus(reportId, 'completed', downloadUrl);
  }

  static async markReportAsFailed(reportId: string): Promise<void> {
    await this.updateReportStatus(reportId, 'failed');
  }

  // Report Generation
  static async generateReport(
    userId: string,
    type: ReportType,
    filter: ReportFilter
  ): Promise<EnergyReport> {
    const report = await this.createReport({
      userId,
      type,
      title: `${type} Report`,
      description: `Report generated for ${filter.timeRange || 'custom'} period`,
      timeRange: filter.timeRange || 'custom',
      startDate: filter.startDate || new Date(),
      endDate: filter.endDate || new Date(),
      metrics: {
        totalEnergy: 0,
        totalCost: 0,
        carbonEmissions: 0,
        peakDemand: 0,
        averageEfficiency: 0,
        savings: {
          energy: 0,
          cost: 0,
          carbon: 0
        }
      },
      format: filter.format || 'pdf'
    });

    // Trigger report generation process
    // This would typically be handled by a cloud function
    await this.updateReportStatus(report.id, 'processing');

    return report;
  }

  // Real-time Listeners
  static onReportsUpdate(
    userId: string,
    callback: (reports: EnergyReport[]) => void,
    options: {
      type?: ReportType;
      status?: ReportStatus;
      timeRange?: TimeRange;
      limit?: number;
    } = {}
  ): Unsubscribe {
    if (!firestore) throw new Error('Firestore not initialized');
    const reportsRef = collection(firestore, this.COLLECTIONS.REPORTS).withConverter(reportConverter);
    
    let q = query(
      reportsRef,
      where('userId', '==', userId)
    );

    if (options.type) {
      q = query(q, where('type', '==', options.type));
    }

    if (options.status) {
      q = query(q, where('status', '==', options.status));
    }

    if (options.timeRange) {
      q = query(q, where('timeRange', '==', options.timeRange));
    }

    q = query(q, orderBy('createdAt', 'desc'));

    if (options.limit) {
      q = query(q, firestoreLimit(options.limit));
    }

    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data()));
    });
  }

  // Utility Methods
  static async getPendingReportsCount(userId: string): Promise<number> {
    if (!firestore) throw new Error('Firestore not initialized');
    const reportsRef = collection(firestore, this.COLLECTIONS.REPORTS).withConverter(reportConverter);
    const q = query(
      reportsRef,
      where('userId', '==', userId),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  static async getRecentReports(userId: string, limit: number = 5): Promise<EnergyReport[]> {
    return this.getReportsByUser(userId, { limit });
  }

  static async getReportsByType(userId: string, type: ReportType): Promise<EnergyReport[]> {
    return this.getReportsByUser(userId, { type });
  }
} 