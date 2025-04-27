import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

interface AnalyticsData {
  energy: {
    consumption: number;
    peakHours: string[];
    cost: number;
    savings: number;
  };
  performance: {
    efficiency: number;
    uptime: number;
    responseTime: number;
  };
  financial: {
    cost: number;
    savings: number;
    roi: number;
  };
}

interface TimeSeriesData {
  timestamp: string;
  value: number;
}

export class AnalyticsService {
  static async getAnalytics(userId: string): Promise<AnalyticsData> {
    const analyticsRef = collection(db, 'analytics');
    const q = query(
      analyticsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return {
        energy: {
          consumption: 0,
          peakHours: [],
          cost: 0,
          savings: 0
        },
        performance: {
          efficiency: 0,
          uptime: 0,
          responseTime: 0
        },
        financial: {
          cost: 0,
          savings: 0,
          roi: 0
        }
      };
    }

    return snapshot.docs[0].data() as AnalyticsData;
  }

  static async getTimeSeriesData(userId: string, type: 'energy' | 'performance' | 'financial'): Promise<TimeSeriesData[]> {
    const timeSeriesRef = collection(db, 'timeSeries');
    const q = query(
      timeSeriesRef,
      where('userId', '==', userId),
      where('type', '==', type),
      orderBy('timestamp', 'desc'),
      limit(30) // Last 30 days
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      timestamp: doc.data().timestamp,
      value: doc.data().value
    }));
  }
} 