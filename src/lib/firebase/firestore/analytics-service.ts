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
  arrayUnion,
  arrayRemove,
  writeBatch
} from 'firebase/firestore';
import {
  EnergyConsumption,
  EnergyProduction,
  EnergySummary,
  EnergyReport,
  TimeRange,
  energyConsumptionConverter,
  energyProductionConverter,
  energySummaryConverter,
  energyReportConverter,
  Metric,
  MetricType,
  Trend,
  TrendDirection,
  AnalysisResult,
  AnalysisType,
  metricConverter,
  analysisResultConverter,
  EnergyMetric,
  PerformanceMetric,
  CostMetric,
  MaintenanceMetric,
  SecurityMetric,
  Analytics,
  AnalyticsType,
  AggregationType,
  EnergyAnalytics,
  PerformanceAnalytics,
  FinancialAnalytics,
  MaintenanceAnalytics,
  SecurityAnalytics,
  analyticsConverter,
  AnalyticsTimeSeries,
  AnalyticsInsight,
  AnalyticsReport,
  AnalyticsPeriod,
  AnalyticsMetric,
  AnalyticsAggregation,
  analyticsTimeSeriesConverter,
  analyticsInsightConverter,
  analyticsReportConverter
} from './analytics-types';
import { EnergySource } from './energy-types';

export class AnalyticsService {
  private static readonly COLLECTIONS = {
    CONSUMPTION: 'energyConsumption',
    PRODUCTION: 'energyProduction',
    SUMMARIES: 'energySummaries',
    REPORTS: 'energyReports',
    TIME_SERIES: 'analyticsTimeSeries',
    INSIGHTS: 'analyticsInsights',
    ANALYTICS_REPORTS: 'analyticsReports'
  };

  private static readonly METRICS_COLLECTION = 'metrics';
  private static readonly ANALYSIS_COLLECTION = 'analysis';
  private static readonly ANALYTICS_COLLECTION = 'analytics';

  // Consumption Operations
  static async getConsumption(consumptionId: string): Promise<EnergyConsumption | null> {
    if (!firestore) throw new Error('Firestore not initialized');
    const consumptionRef = doc(firestore, this.COLLECTIONS.CONSUMPTION, consumptionId).withConverter(energyConsumptionConverter);
    const snapshot = await getDoc(consumptionRef);
    return snapshot.exists() ? snapshot.data() : null;
  }

  static async getConsumptionByDevice(deviceId: string, limit: number = 100): Promise<EnergyConsumption[]> {
    if (!firestore) throw new Error('Firestore not initialized');
    const consumptionRef = collection(firestore, this.COLLECTIONS.CONSUMPTION).withConverter(energyConsumptionConverter);
    const q = query(
      consumptionRef,
      where('deviceId', '==', deviceId),
      orderBy('metrics.timestamp', 'desc'),
      firestoreLimit(limit)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  static async createConsumption(consumption: Omit<EnergyConsumption, 'id'>): Promise<EnergyConsumption> {
    if (!firestore) throw new Error('Firestore not initialized');
    const consumptionRef = collection(firestore, this.COLLECTIONS.CONSUMPTION).withConverter(energyConsumptionConverter);
    const docRef = await addDoc(consumptionRef, consumption);
    return { ...consumption, id: docRef.id };
  }

  // Production Operations
  static async getProduction(productionId: string): Promise<EnergyProduction | null> {
    if (!firestore) throw new Error('Firestore not initialized');
    const productionRef = doc(firestore, this.COLLECTIONS.PRODUCTION, productionId).withConverter(energyProductionConverter);
    const snapshot = await getDoc(productionRef);
    return snapshot.exists() ? snapshot.data() : null;
  }

  static async getProductionByDevice(deviceId: string, limit: number = 100): Promise<EnergyProduction[]> {
    if (!firestore) throw new Error('Firestore not initialized');
    const productionRef = collection(firestore, this.COLLECTIONS.PRODUCTION).withConverter(energyProductionConverter);
    const q = query(
      productionRef,
      where('deviceId', '==', deviceId),
      orderBy('metrics.timestamp', 'desc'),
      firestoreLimit(limit)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  static async createProduction(production: Omit<EnergyProduction, 'id'>): Promise<EnergyProduction> {
    if (!firestore) throw new Error('Firestore not initialized');
    const productionRef = collection(firestore, this.COLLECTIONS.PRODUCTION).withConverter(energyProductionConverter);
    const docRef = await addDoc(productionRef, production);
    return { ...production, id: docRef.id };
  }

  // Summary Operations
  static async getSummary(summaryId: string): Promise<EnergySummary | null> {
    if (!firestore) throw new Error('Firestore not initialized');
    const summaryRef = doc(firestore, this.COLLECTIONS.SUMMARIES, summaryId).withConverter(energySummaryConverter);
    const snapshot = await getDoc(summaryRef);
    return snapshot.exists() ? snapshot.data() : null;
  }

  static async getSummariesByUser(userId: string, timeRange: TimeRange, limit: number = 10): Promise<EnergySummary[]> {
    if (!firestore) throw new Error('Firestore not initialized');
    const summaryRef = collection(firestore, this.COLLECTIONS.SUMMARIES).withConverter(energySummaryConverter);
    const q = query(
      summaryRef,
      where('userId', '==', userId),
      where('timeRange', '==', timeRange),
      orderBy('createdAt', 'desc'),
      firestoreLimit(limit)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  static async createSummary(summary: Omit<EnergySummary, 'id'>): Promise<EnergySummary> {
    if (!firestore) throw new Error('Firestore not initialized');
    const summaryRef = collection(firestore, this.COLLECTIONS.SUMMARIES).withConverter(energySummaryConverter);
    const docRef = await addDoc(summaryRef, summary);
    return { ...summary, id: docRef.id };
  }

  // Metric Management
  static async getMetric(metricId: string): Promise<Metric | null> {
    if (!firestore) throw new Error('Firestore not initialized');
    const metricRef = doc(firestore, this.METRICS_COLLECTION, metricId).withConverter(metricConverter);
    const snapshot = await getDoc(metricRef);
    return snapshot.exists() ? snapshot.data() : null;
  }

  static async getMetricsByUser(
    userId: string,
    options: {
      type?: MetricType;
      timeRange?: TimeRange;
      limit?: number;
      startAfter?: string;
    } = {}
  ): Promise<Metric[]> {
    if (!firestore) throw new Error('Firestore not initialized');
    const metricRef = collection(firestore, this.METRICS_COLLECTION).withConverter(metricConverter);
    let q = query(metricRef, where('userId', '==', userId));

    if (options.type) q = query(q, where('type', '==', options.type));
    if (options.timeRange) q = query(q, where('timeRange.type', '==', options.timeRange));
    if (options.limit) q = query(q, firestoreLimit(options.limit));
    if (options.startAfter) {
      const lastDoc = await getDoc(doc(firestore, this.METRICS_COLLECTION, options.startAfter));
      if (lastDoc.exists()) {
        q = query(q, startAfter(lastDoc));
      }
    }

    q = query(q, orderBy('metadata.createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  static async createMetric(metric: Omit<Metric, 'id' | 'metadata'>): Promise<Metric> {
    if (!firestore) throw new Error('Firestore not initialized');
    const metricRef = collection(firestore, this.METRICS_COLLECTION).withConverter(metricConverter);
    const metadata = {
      createdAt: Timestamp.now(),
      lastUpdated: Timestamp.now(),
      version: 1,
      tags: [],
      notes: ''
    };
    const docRef = await addDoc(metricRef, { ...metric, metadata } as unknown as WithFieldValue<Metric>);
    const snapshot = await getDoc(docRef.withConverter(metricConverter));
    return snapshot.data()!;
  }

  static async updateMetric(
    metricId: string,
    updates: Partial<Omit<Metric, 'id' | 'userId' | 'type' | 'metadata'>>
  ): Promise<void> {
    if (!firestore) throw new Error('Firestore not initialized');
    const metricRef = doc(firestore, this.METRICS_COLLECTION, metricId).withConverter(metricConverter);
    const metadata = {
      lastUpdated: Timestamp.now()
    };
    await updateDoc(metricRef, { ...updates, metadata });
  }

  static async deleteMetric(metricId: string): Promise<void> {
    if (!firestore) throw new Error('Firestore not initialized');
    const metricRef = doc(firestore, this.METRICS_COLLECTION, metricId);
    await deleteDoc(metricRef);
  }

  // Analysis Management
  static async getAnalysis(analysisId: string): Promise<AnalysisResult | null> {
    if (!firestore) throw new Error('Firestore not initialized');
    const analysisRef = doc(firestore, this.ANALYSIS_COLLECTION, analysisId).withConverter(analysisResultConverter);
    const snapshot = await getDoc(analysisRef);
    return snapshot.exists() ? snapshot.data() : null;
  }

  static async getAnalysisByUser(
    userId: string,
    options: {
      type?: AnalysisType;
      limit?: number;
      startAfter?: string;
    } = {}
  ): Promise<AnalysisResult[]> {
    if (!firestore) throw new Error('Firestore not initialized');
    const analysisRef = collection(firestore, this.ANALYSIS_COLLECTION).withConverter(analysisResultConverter);
    let q = query(analysisRef, where('userId', '==', userId));

    if (options.type) q = query(q, where('type', '==', options.type));
    if (options.limit) q = query(q, firestoreLimit(options.limit));
    if (options.startAfter) {
      const lastDoc = await getDoc(doc(firestore, this.ANALYSIS_COLLECTION, options.startAfter));
      if (lastDoc.exists()) {
        q = query(q, startAfter(lastDoc));
      }
    }

    q = query(q, orderBy('metadata.createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  static async createAnalysis(analysis: Omit<AnalysisResult, 'id' | 'metadata'>): Promise<AnalysisResult> {
    if (!firestore) throw new Error('Firestore not initialized');
    const analysisRef = collection(firestore, this.ANALYSIS_COLLECTION).withConverter(analysisResultConverter);
    const metadata = {
      createdAt: Timestamp.now(),
      lastUpdated: Timestamp.now(),
      version: 1,
      tags: [],
      notes: ''
    };
    const docRef = await addDoc(analysisRef, { ...analysis, metadata } as unknown as WithFieldValue<AnalysisResult>);
    const snapshot = await getDoc(docRef.withConverter(analysisResultConverter));
    return snapshot.data()!;
  }

  // Trend Analysis
  static async analyzeTrends(
    userId: string,
    metricIds: string[],
    timeRange: TimeRange
  ): Promise<Trend[]> {
    if (!firestore) throw new Error('Firestore not initialized');
    
    // Get metrics for analysis
    const metrics = await Promise.all(metricIds.map(id => this.getMetric(id)));
    const validMetrics = metrics.filter((metric): metric is Metric => metric !== null);
    
    if (validMetrics.length === 0) {
      throw new Error('No valid metrics to analyze');
    }

    // Calculate trends
    const trends: Trend[] = [];
    for (const metric of validMetrics) {
      const previousMetrics = await this.getMetricsByUser(userId, {
        type: metric.type,
        timeRange,
        limit: 2
      });

      if (previousMetrics.length >= 2) {
        const currentValue = metric.value;
        const previousValue = previousMetrics[1].value;
        const change = ((currentValue - previousValue) / previousValue) * 100;
        
        let direction: TrendDirection;
        if (change > 5) direction = 'up';
        else if (change < -5) direction = 'down';
        else direction = 'stable';

        trends.push({
          metricId: metric.id,
          direction,
          percentage: Math.abs(change),
          confidence: 0.8, // This could be calculated based on historical data
          timeRange: {
            type: timeRange,
            start: previousMetrics[1].timeRange.start,
            end: metric.timeRange.end
          }
        });
      }
    }

    return trends;
  }

  // Real-time Listeners
  static onConsumptionUpdate(
    deviceId: string,
    callback: (consumption: EnergyConsumption) => void
  ): Unsubscribe {
    if (!firestore) throw new Error('Firestore not initialized');
    const consumptionRef = collection(firestore, this.COLLECTIONS.CONSUMPTION).withConverter(energyConsumptionConverter);
    const q = query(
      consumptionRef,
      where('deviceId', '==', deviceId),
      orderBy('metrics.timestamp', 'desc'),
      firestoreLimit(1)
    );
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        callback(snapshot.docs[0].data());
      }
    });
  }

  static onProductionUpdate(
    deviceId: string,
    callback: (production: EnergyProduction) => void
  ): Unsubscribe {
    if (!firestore) throw new Error('Firestore not initialized');
    const productionRef = collection(firestore, this.COLLECTIONS.PRODUCTION).withConverter(energyProductionConverter);
    const q = query(
      productionRef,
      where('deviceId', '==', deviceId),
      orderBy('metrics.timestamp', 'desc'),
      firestoreLimit(1)
    );
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        callback(snapshot.docs[0].data());
      }
    });
  }

  static onMetricUpdate(
    metricId: string,
    callback: (metric: Metric | null) => void
  ): Unsubscribe {
    if (!firestore) throw new Error('Firestore not initialized');
    const metricRef = doc(firestore, this.METRICS_COLLECTION, metricId).withConverter(metricConverter);
    return onSnapshot(metricRef, (snapshot) => {
      callback(snapshot.exists() ? snapshot.data() : null);
    });
  }

  static onUserMetricsUpdate(
    userId: string,
    callback: (metrics: Metric[]) => void,
    options: {
      type?: MetricType;
      timeRange?: TimeRange;
      limit?: number;
    } = {}
  ): Unsubscribe {
    if (!firestore) throw new Error('Firestore not initialized');
    const metricRef = collection(firestore, this.METRICS_COLLECTION).withConverter(metricConverter);
    let q = query(metricRef, where('userId', '==', userId));

    if (options.type) q = query(q, where('type', '==', options.type));
    if (options.timeRange) q = query(q, where('timeRange.type', '==', options.timeRange));
    if (options.limit) q = query(q, firestoreLimit(options.limit));

    q = query(q, orderBy('metadata.createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data()));
    });
  }

  // Utility Methods
  static async getEnergyBalance(
    userId: string,
    startTime: Date,
    endTime: Date
  ): Promise<{
    consumption: number;
    production: number;
    netEnergy: number;
  }> {
    if (!firestore) throw new Error('Firestore not initialized');
    
    const consumptionRef = collection(firestore, this.COLLECTIONS.CONSUMPTION).withConverter(energyConsumptionConverter);
    const productionRef = collection(firestore, this.COLLECTIONS.PRODUCTION).withConverter(energyProductionConverter);

    const consumptionQuery = query(
      consumptionRef,
      where('userId', '==', userId),
      where('metrics.timestamp', '>=', Timestamp.fromDate(startTime)),
      where('metrics.timestamp', '<=', Timestamp.fromDate(endTime))
    );

    const productionQuery = query(
      productionRef,
      where('userId', '==', userId),
      where('metrics.timestamp', '>=', Timestamp.fromDate(startTime)),
      where('metrics.timestamp', '<=', Timestamp.fromDate(endTime))
    );

    const [consumptionSnapshot, productionSnapshot] = await Promise.all([
      getDocs(consumptionQuery),
      getDocs(productionQuery)
    ]);

    const consumption = consumptionSnapshot.docs.reduce((sum, doc) => {
      const data = doc.data();
      return sum + (data.metrics.power * (data.metrics.timestamp.getTime() - startTime.getTime()) / (1000 * 3600));
    }, 0);

    const production = productionSnapshot.docs.reduce((sum, doc) => {
      const data = doc.data();
      return sum + (data.metrics.power * (data.metrics.timestamp.getTime() - startTime.getTime()) / (1000 * 3600));
    }, 0);

    return {
      consumption,
      production,
      netEnergy: production - consumption
    };
  }

  static async getEnergyBySource(
    userId: string,
    startTime: Date,
    endTime: Date
  ): Promise<Record<EnergySource, { consumption: number; production: number }>> {
    if (!firestore) throw new Error('Firestore not initialized');
    
    const consumptionRef = collection(firestore, this.COLLECTIONS.CONSUMPTION).withConverter(energyConsumptionConverter);
    const productionRef = collection(firestore, this.COLLECTIONS.PRODUCTION).withConverter(energyProductionConverter);

    const consumptionQuery = query(
      consumptionRef,
      where('userId', '==', userId),
      where('metrics.timestamp', '>=', Timestamp.fromDate(startTime)),
      where('metrics.timestamp', '<=', Timestamp.fromDate(endTime))
    );

    const productionQuery = query(
      productionRef,
      where('userId', '==', userId),
      where('metrics.timestamp', '>=', Timestamp.fromDate(startTime)),
      where('metrics.timestamp', '<=', Timestamp.fromDate(endTime))
    );

    const [consumptionSnapshot, productionSnapshot] = await Promise.all([
      getDocs(consumptionQuery),
      getDocs(productionQuery)
    ]);

    const result: Record<EnergySource, { consumption: number; production: number }> = {
      solar: { consumption: 0, production: 0 },
      battery: { consumption: 0, production: 0 },
      grid: { consumption: 0, production: 0 },
      generator: { consumption: 0, production: 0 }
    };

    consumptionSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const energy = data.metrics.power * (data.metrics.timestamp.getTime() - startTime.getTime()) / (1000 * 3600);
      result[data.source].consumption += energy;
    });

    productionSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const energy = data.metrics.power * (data.metrics.timestamp.getTime() - startTime.getTime()) / (1000 * 3600);
      result[data.source].production += energy;
    });

    return result;
  }

  // Analytics Management
  static async getAnalytics(analyticsId: string): Promise<Analytics | null> {
    if (!firestore) throw new Error('Firestore not initialized');
    const analyticsRef = doc(firestore, this.ANALYTICS_COLLECTION, analyticsId).withConverter(analyticsConverter);
    const snapshot = await getDoc(analyticsRef);
    return snapshot.exists() ? snapshot.data() : null;
  }

  static async getAnalyticsByUser(
    userId: string,
    options: {
      type?: AnalyticsType;
      timeRange?: TimeRange;
      limit?: number;
      startAfter?: string;
    } = {}
  ): Promise<Analytics[]> {
    if (!firestore) throw new Error('Firestore not initialized');
    const analyticsRef = collection(firestore, this.ANALYTICS_COLLECTION).withConverter(analyticsConverter);
    let q = query(analyticsRef, where('userId', '==', userId));

    if (options.type) q = query(q, where('type', '==', options.type));
    if (options.timeRange) q = query(q, where('metadata.timeRange', '==', options.timeRange));
    if (options.limit) q = query(q, firestoreLimit(options.limit));
    if (options.startAfter) {
      const lastDoc = await getDoc(doc(firestore, this.ANALYTICS_COLLECTION, options.startAfter));
      if (lastDoc.exists()) {
        q = query(q, startAfter(lastDoc));
      }
    }

    q = query(q, orderBy('metadata.createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  static async createAnalytics(analytics: Omit<Analytics, 'id' | 'metadata'>): Promise<Analytics> {
    if (!firestore) throw new Error('Firestore not initialized');
    const analyticsRef = collection(firestore, this.ANALYTICS_COLLECTION).withConverter(analyticsConverter);
    const metadata = {
      createdAt: Timestamp.now(),
      lastUpdated: Timestamp.now(),
      timeRange: 'day' as TimeRange,
      aggregationType: 'sum' as AggregationType,
      version: 1,
      tags: [],
      notes: ''
    };
    const docRef = await addDoc(analyticsRef, { ...analytics, metadata } as unknown as WithFieldValue<Analytics>);
    const snapshot = await getDoc(docRef.withConverter(analyticsConverter));
    return snapshot.data()!;
  }

  static async updateAnalytics(
    analyticsId: string,
    updates: Partial<Omit<Analytics, 'id' | 'userId' | 'type' | 'metadata'>>
  ): Promise<void> {
    if (!firestore) throw new Error('Firestore not initialized');
    const analyticsRef = doc(firestore, this.ANALYTICS_COLLECTION, analyticsId).withConverter(analyticsConverter);
    const metadata = {
      lastUpdated: Timestamp.now()
    };
    await updateDoc(analyticsRef, { ...updates, metadata });
  }

  static async deleteAnalytics(analyticsId: string): Promise<void> {
    if (!firestore) throw new Error('Firestore not initialized');
    const analyticsRef = doc(firestore, this.ANALYTICS_COLLECTION, analyticsId);
    await deleteDoc(analyticsRef);
  }

  // Type-specific Analytics Creation
  static async createEnergyAnalytics(
    userId: string,
    title: string,
    description: string,
    consumption: EnergyAnalytics['consumption'],
    production: EnergyAnalytics['production'],
    efficiency: EnergyAnalytics['efficiency']
  ): Promise<EnergyAnalytics> {
    const analytics: Omit<EnergyAnalytics, 'id' | 'metadata'> = {
      userId,
      type: 'energy',
      title,
      description,
      consumption,
      production,
      efficiency
    };
    return this.createAnalytics(analytics) as Promise<EnergyAnalytics>;
  }

  static async createPerformanceAnalytics(
    userId: string,
    title: string,
    description: string,
    devicePerformance: PerformanceAnalytics['devicePerformance'],
    systemPerformance: PerformanceAnalytics['systemPerformance']
  ): Promise<PerformanceAnalytics> {
    const analytics: Omit<PerformanceAnalytics, 'id' | 'metadata'> = {
      userId,
      type: 'performance',
      title,
      description,
      devicePerformance,
      systemPerformance
    };
    return this.createAnalytics(analytics) as Promise<PerformanceAnalytics>;
  }

  static async createFinancialAnalytics(
    userId: string,
    title: string,
    description: string,
    costs: FinancialAnalytics['costs'],
    savings: FinancialAnalytics['savings'],
    roi: FinancialAnalytics['roi']
  ): Promise<FinancialAnalytics> {
    const analytics: Omit<FinancialAnalytics, 'id' | 'metadata'> = {
      userId,
      type: 'financial',
      title,
      description,
      costs,
      savings,
      roi
    };
    return this.createAnalytics(analytics) as Promise<FinancialAnalytics>;
  }

  static async createMaintenanceAnalytics(
    userId: string,
    title: string,
    description: string,
    maintenance: MaintenanceAnalytics['maintenance'],
    downtime: MaintenanceAnalytics['downtime'],
    costs: MaintenanceAnalytics['costs']
  ): Promise<MaintenanceAnalytics> {
    const analytics: Omit<MaintenanceAnalytics, 'id' | 'metadata'> = {
      userId,
      type: 'maintenance',
      title,
      description,
      maintenance,
      downtime,
      costs
    };
    return this.createAnalytics(analytics) as Promise<MaintenanceAnalytics>;
  }

  static async createSecurityAnalytics(
    userId: string,
    title: string,
    description: string,
    incidents: SecurityAnalytics['incidents'],
    threats: SecurityAnalytics['threats'],
    responses: SecurityAnalytics['responses']
  ): Promise<SecurityAnalytics> {
    const analytics: Omit<SecurityAnalytics, 'id' | 'metadata'> = {
      userId,
      type: 'security',
      title,
      description,
      incidents,
      threats,
      responses
    };
    return this.createAnalytics(analytics) as Promise<SecurityAnalytics>;
  }

  // Real-time Listeners
  static onAnalyticsUpdate(
    analyticsId: string,
    callback: (analytics: Analytics | null) => void
  ): Unsubscribe {
    if (!firestore) throw new Error('Firestore not initialized');
    const analyticsRef = doc(firestore, this.ANALYTICS_COLLECTION, analyticsId).withConverter(analyticsConverter);
    return onSnapshot(analyticsRef, (snapshot) => {
      callback(snapshot.exists() ? snapshot.data() : null);
    });
  }

  static onUserAnalyticsUpdate(
    userId: string,
    callback: (analytics: Analytics[]) => void,
    options: {
      type?: AnalyticsType;
      timeRange?: TimeRange;
      limit?: number;
    } = {}
  ): Unsubscribe {
    if (!firestore) throw new Error('Firestore not initialized');
    const analyticsRef = collection(firestore, this.ANALYTICS_COLLECTION).withConverter(analyticsConverter);
    let q = query(analyticsRef, where('userId', '==', userId));

    if (options.type) q = query(q, where('type', '==', options.type));
    if (options.timeRange) q = query(q, where('metadata.timeRange', '==', options.timeRange));
    if (options.limit) q = query(q, firestoreLimit(options.limit));

    q = query(q, orderBy('metadata.createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data()));
    });
  }

  // Time Series Operations
  static async getTimeSeries(seriesId: string): Promise<AnalyticsTimeSeries | null> {
    if (!firestore) throw new Error('Firestore not initialized');
    const seriesRef = doc(firestore, this.COLLECTIONS.TIME_SERIES, seriesId).withConverter(analyticsTimeSeriesConverter);
    const snapshot = await getDoc(seriesRef);
    return snapshot.exists() ? snapshot.data() : null;
  }

  static async getTimeSeriesByUser(
    userId: string,
    options: {
      metric?: AnalyticsMetric;
      period?: AnalyticsPeriod;
      startTime?: Date;
      endTime?: Date;
      limit?: number;
      startAfter?: string;
    } = {}
  ): Promise<AnalyticsTimeSeries[]> {
    if (!firestore) throw new Error('Firestore not initialized');
    const seriesRef = collection(firestore, this.COLLECTIONS.TIME_SERIES).withConverter(analyticsTimeSeriesConverter);
    let q = query(seriesRef, where('userId', '==', userId));

    if (options.metric) {
      q = query(q, where('metric', '==', options.metric));
    }
    if (options.period) {
      q = query(q, where('period', '==', options.period));
    }
    if (options.startTime) {
      q = query(q, where('dataPoints.timestamp', '>=', Timestamp.fromDate(options.startTime)));
    }
    if (options.endTime) {
      q = query(q, where('dataPoints.timestamp', '<=', Timestamp.fromDate(options.endTime)));
    }
    if (options.limit) {
      q = query(q, firestoreLimit(options.limit));
    }
    if (options.startAfter) {
      const lastDoc = await getDoc(doc(firestore, this.COLLECTIONS.TIME_SERIES, options.startAfter));
      if (lastDoc.exists()) {
        q = query(q, startAfter(lastDoc));
      }
    }

    q = query(q, orderBy('metadata.createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  static async createTimeSeries(series: Omit<AnalyticsTimeSeries, 'id' | 'metadata'>): Promise<AnalyticsTimeSeries> {
    if (!firestore) throw new Error('Firestore not initialized');
    const seriesRef = collection(firestore, this.COLLECTIONS.TIME_SERIES).withConverter(analyticsTimeSeriesConverter);
    const metadata = {
      createdAt: Timestamp.now(),
      lastUpdated: Timestamp.now(),
      version: 1,
      tags: [],
      notes: ''
    };
    const docRef = await addDoc(seriesRef, {
      ...series,
      metadata
    } as WithFieldValue<Omit<AnalyticsTimeSeries, 'id'>>);
    const snapshot = await getDoc(docRef.withConverter(analyticsTimeSeriesConverter));
    if (!snapshot.exists()) throw new Error('Failed to create time series');
    return snapshot.data();
  }

  // Insights Operations
  static async getInsight(insightId: string): Promise<AnalyticsInsight | null> {
    if (!firestore) throw new Error('Firestore not initialized');
    const insightRef = doc(firestore, this.COLLECTIONS.INSIGHTS, insightId).withConverter(analyticsInsightConverter);
    const snapshot = await getDoc(insightRef);
    return snapshot.exists() ? snapshot.data() : null;
  }

  static async getInsightsByUser(
    userId: string,
    options: {
      type?: 'trend' | 'anomaly' | 'optimization' | 'recommendation';
      severity?: 'low' | 'medium' | 'high' | 'critical';
      startTime?: Date;
      endTime?: Date;
      limit?: number;
      startAfter?: string;
    } = {}
  ): Promise<AnalyticsInsight[]> {
    if (!firestore) throw new Error('Firestore not initialized');
    const insightsRef = collection(firestore, this.COLLECTIONS.INSIGHTS).withConverter(analyticsInsightConverter);
    let q = query(insightsRef, where('userId', '==', userId));

    if (options.type) {
      q = query(q, where('type', '==', options.type));
    }
    if (options.severity) {
      q = query(q, where('severity', '==', options.severity));
    }
    if (options.startTime) {
      q = query(q, where('timeRange.start', '>=', Timestamp.fromDate(options.startTime)));
    }
    if (options.endTime) {
      q = query(q, where('timeRange.end', '<=', Timestamp.fromDate(options.endTime)));
    }
    if (options.limit) {
      q = query(q, firestoreLimit(options.limit));
    }
    if (options.startAfter) {
      const lastDoc = await getDoc(doc(firestore, this.COLLECTIONS.INSIGHTS, options.startAfter));
      if (lastDoc.exists()) {
        q = query(q, startAfter(lastDoc));
      }
    }

    q = query(q, orderBy('metadata.createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  static async createInsight(insight: Omit<AnalyticsInsight, 'id' | 'metadata'>): Promise<AnalyticsInsight> {
    if (!firestore) throw new Error('Firestore not initialized');
    const insightsRef = collection(firestore, this.COLLECTIONS.INSIGHTS).withConverter(analyticsInsightConverter);
    const metadata = {
      createdAt: Timestamp.now(),
      lastUpdated: Timestamp.now(),
      version: 1,
      tags: [],
      notes: ''
    };
    const docRef = await addDoc(insightsRef, {
      ...insight,
      metadata
    } as WithFieldValue<Omit<AnalyticsInsight, 'id'>>);
    const snapshot = await getDoc(docRef.withConverter(analyticsInsightConverter));
    if (!snapshot.exists()) throw new Error('Failed to create insight');
    return snapshot.data();
  }

  // Reports Operations
  static async getReport(reportId: string): Promise<AnalyticsReport | null> {
    if (!firestore) throw new Error('Firestore not initialized');
    const reportRef = doc(firestore, this.COLLECTIONS.ANALYTICS_REPORTS, reportId).withConverter(analyticsReportConverter);
    const snapshot = await getDoc(reportRef);
    return snapshot.exists() ? snapshot.data() : null;
  }

  static async getReportsByUser(
    userId: string,
    options: {
      type?: 'summary' | 'detailed' | 'comparative' | 'forecast';
      startTime?: Date;
      endTime?: Date;
      limit?: number;
      startAfter?: string;
    } = {}
  ): Promise<AnalyticsReport[]> {
    if (!firestore) throw new Error('Firestore not initialized');
    const reportsRef = collection(firestore, this.COLLECTIONS.ANALYTICS_REPORTS).withConverter(analyticsReportConverter);
    let q = query(reportsRef, where('userId', '==', userId));

    if (options.type) {
      q = query(q, where('type', '==', options.type));
    }
    if (options.startTime) {
      q = query(q, where('timeRange.start', '>=', Timestamp.fromDate(options.startTime)));
    }
    if (options.endTime) {
      q = query(q, where('timeRange.end', '<=', Timestamp.fromDate(options.endTime)));
    }
    if (options.limit) {
      q = query(q, firestoreLimit(options.limit));
    }
    if (options.startAfter) {
      const lastDoc = await getDoc(doc(firestore, this.COLLECTIONS.ANALYTICS_REPORTS, options.startAfter));
      if (lastDoc.exists()) {
        q = query(q, startAfter(lastDoc));
      }
    }

    q = query(q, orderBy('metadata.createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  static async createReport(report: Omit<AnalyticsReport, 'id' | 'metadata'>): Promise<AnalyticsReport> {
    if (!firestore) throw new Error('Firestore not initialized');
    const reportsRef = collection(firestore, this.COLLECTIONS.ANALYTICS_REPORTS).withConverter(analyticsReportConverter);
    const metadata = {
      createdAt: Timestamp.now(),
      lastUpdated: Timestamp.now(),
      version: 1,
      tags: [],
      notes: ''
    };
    const docRef = await addDoc(reportsRef, {
      ...report,
      metadata
    } as WithFieldValue<Omit<AnalyticsReport, 'id'>>);
    const snapshot = await getDoc(docRef.withConverter(analyticsReportConverter));
    if (!snapshot.exists()) throw new Error('Failed to create report');
    return snapshot.data();
  }

  // Real-time Listeners
  static onTimeSeriesUpdate(
    userId: string,
    metric: AnalyticsMetric,
    period: AnalyticsPeriod,
    callback: (series: AnalyticsTimeSeries | null) => void
  ): Unsubscribe {
    if (!firestore) throw new Error('Firestore not initialized');
    const seriesRef = collection(firestore, this.COLLECTIONS.TIME_SERIES).withConverter(analyticsTimeSeriesConverter);
    const q = query(
      seriesRef,
      where('userId', '==', userId),
      where('metric', '==', metric),
      where('period', '==', period),
      orderBy('metadata.lastUpdated', 'desc'),
      firestoreLimit(1)
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.empty ? null : snapshot.docs[0].data());
    });
  }

  static onInsightsUpdate(
    userId: string,
    callback: (insights: AnalyticsInsight[]) => void
  ): Unsubscribe {
    if (!firestore) throw new Error('Firestore not initialized');
    const insightsRef = collection(firestore, this.COLLECTIONS.INSIGHTS).withConverter(analyticsInsightConverter);
    const q = query(
      insightsRef,
      where('userId', '==', userId),
      orderBy('metadata.createdAt', 'desc'),
      firestoreLimit(10)
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data()));
    });
  }

  // Utility Methods
  static async calculateMetrics(
    userId: string,
    metric: AnalyticsMetric,
    aggregation: AnalyticsAggregation,
    timeRange: { start: Date; end: Date }
  ): Promise<number> {
    if (!firestore) throw new Error('Firestore not initialized');
    if (timeRange.start > timeRange.end) {
      throw new Error('Start time must be before end time');
    }

    const seriesRef = collection(firestore, this.COLLECTIONS.TIME_SERIES).withConverter(analyticsTimeSeriesConverter);
    const q = query(
      seriesRef,
      where('userId', '==', userId),
      where('metric', '==', metric),
      where('dataPoints.timestamp', '>=', Timestamp.fromDate(timeRange.start)),
      where('dataPoints.timestamp', '<=', Timestamp.fromDate(timeRange.end))
    );

    const snapshot = await getDocs(q);
    const values = snapshot.docs.flatMap(doc => 
      doc.data().dataPoints.map(point => point.value)
    );

    switch (aggregation) {
      case 'sum':
        return values.reduce((sum, value) => sum + value, 0);
      case 'average':
        return values.reduce((sum, value) => sum + value, 0) / values.length;
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      case 'count':
        return values.length;
      default:
        throw new Error(`Unsupported aggregation: ${aggregation}`);
    }
  }

  static async generateInsights(
    userId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<AnalyticsInsight[]> {
    if (!firestore) throw new Error('Firestore not initialized');
    if (timeRange.start > timeRange.end) {
      throw new Error('Start time must be before end time');
    }

    // Get time series data for the period
    const seriesRef = collection(firestore, this.COLLECTIONS.TIME_SERIES).withConverter(analyticsTimeSeriesConverter);
    const q = query(
      seriesRef,
      where('userId', '==', userId),
      where('dataPoints.timestamp', '>=', Timestamp.fromDate(timeRange.start)),
      where('dataPoints.timestamp', '<=', Timestamp.fromDate(timeRange.end))
    );

    const snapshot = await getDocs(q);
    const series = snapshot.docs.map(doc => doc.data());

    // Generate insights based on the data
    const insights: Omit<AnalyticsInsight, 'id' | 'metadata'>[] = [];

    // Example insight generation logic
    series.forEach(s => {
      const values = s.dataPoints.map(point => point.value);
      const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);

      if (max > avg * 1.5) {
        insights.push({
          userId,
          type: 'anomaly',
          title: `High ${s.metric} detected`,
          description: `Unusually high ${s.metric} values detected during this period`,
          severity: 'high',
          timeRange,
          metrics: [{
            metric: s.metric,
            value: max,
            change: ((max - avg) / avg) * 100,
            unit: 'kW'
          }]
        });
      }

      if (min < avg * 0.5) {
        insights.push({
          userId,
          type: 'anomaly',
          title: `Low ${s.metric} detected`,
          description: `Unusually low ${s.metric} values detected during this period`,
          severity: 'medium',
          timeRange,
          metrics: [{
            metric: s.metric,
            value: min,
            change: ((min - avg) / avg) * 100,
            unit: 'kW'
          }]
        });
      }
    });

    // Create insights in Firestore
    const batch = writeBatch(firestore);
    const createdInsights: AnalyticsInsight[] = [];

    for (const insight of insights) {
      const insightRef = doc(collection(firestore, this.COLLECTIONS.INSIGHTS)).withConverter(analyticsInsightConverter);
      const metadata = {
        createdAt: Timestamp.now(),
        lastUpdated: Timestamp.now(),
        version: 1,
        tags: [],
        notes: ''
      };
      const insightData = {
        ...insight,
        metadata
      } as unknown as WithFieldValue<AnalyticsInsight>;
      batch.set(insightRef, insightData);
      createdInsights.push(await this.createInsight(insight));
    }

    await batch.commit();
    return createdInsights;
  }
} 