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
  DocumentData,
  WithFieldValue,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import {
  Recommendation,
  RecommendationType,
  RecommendationStatus,
  RecommendationPriority,
  recommendationConverter,
  EnergySavingsRecommendation,
  DeviceOptimizationRecommendation,
  MaintenanceRecommendation,
  CostReductionRecommendation,
  SustainabilityRecommendation
} from './recommendations-types';

export class RecommendationsService {
  private static readonly COLLECTION = 'recommendations';

  // Basic CRUD Operations
  static async getRecommendation(recommendationId: string): Promise<Recommendation | null> {
    const recommendationRef = doc(firestore, this.COLLECTION, recommendationId).withConverter(recommendationConverter);
    const snapshot = await getDoc(recommendationRef);
    return snapshot.exists() ? snapshot.data() : null;
  }

  static async getRecommendations(userId: string, options?: {
    type?: RecommendationType;
    status?: RecommendationStatus;
    priority?: RecommendationPriority;
    deviceId?: string;
    deviceGroupId?: string;
    limit?: number;
  }): Promise<Recommendation[]> {
    const recommendationsRef = collection(firestore, this.COLLECTION).withConverter(recommendationConverter);
    let q = query(recommendationsRef, where('userId', '==', userId));

    if (options?.type) {
      q = query(q, where('type', '==', options.type));
    }
    if (options?.status) {
      q = query(q, where('status', '==', options.status));
    }
    if (options?.priority) {
      q = query(q, where('priority', '==', options.priority));
    }
    if (options?.deviceId) {
      q = query(q, where('deviceId', '==', options.deviceId));
    }
    if (options?.deviceGroupId) {
      q = query(q, where('deviceGroupId', '==', options.deviceGroupId));
    }

    q = query(q, orderBy('createdAt', 'desc'));
    if (options?.limit) {
      q = query(q, limit(options.limit));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  static async createRecommendation<T extends Recommendation>(
    recommendation: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'implementedAt' | 'dismissedAt' | 'dismissReason'>
  ): Promise<T> {
    const recommendationsRef = collection(firestore, this.COLLECTION).withConverter(recommendationConverter);
    const now = Timestamp.now();
    const newRecommendation = {
      ...recommendation,
      createdAt: now,
      updatedAt: now,
      implementedAt: null,
      dismissedAt: null,
      dismissReason: null
    } as WithFieldValue<T>;
    
    const docRef = await addDoc(recommendationsRef, newRecommendation);
    const snapshot = await getDoc(docRef.withConverter(recommendationConverter));
    const data = snapshot.data();
    
    if (!data) {
      throw new Error('Failed to create recommendation');
    }
    
    return data as T;
  }

  static async updateRecommendation(
    recommendationId: string,
    updates: Partial<Recommendation>
  ): Promise<void> {
    const recommendationRef = doc(firestore, this.COLLECTION, recommendationId);
    await updateDoc(recommendationRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  }

  static async deleteRecommendation(recommendationId: string): Promise<void> {
    const recommendationRef = doc(firestore, this.COLLECTION, recommendationId);
    await deleteDoc(recommendationRef);
  }

  // Status Management
  static async updateStatus(
    recommendationId: string,
    status: RecommendationStatus,
    reason?: string
  ): Promise<void> {
    const updates: Partial<Recommendation> = {
      status,
      updatedAt: Timestamp.now()
    };

    if (status === 'completed') {
      updates.implementedAt = Timestamp.now();
    } else if (status === 'dismissed') {
      updates.dismissedAt = Timestamp.now();
      updates.dismissReason = reason;
    }

    await this.updateRecommendation(recommendationId, updates);
  }

  // Type-specific Operations
  static async createEnergySavingsRecommendation(
    recommendation: Omit<EnergySavingsRecommendation, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<EnergySavingsRecommendation> {
    return this.createRecommendation<EnergySavingsRecommendation>(recommendation);
  }

  static async createDeviceOptimizationRecommendation(
    recommendation: Omit<DeviceOptimizationRecommendation, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<DeviceOptimizationRecommendation> {
    return this.createRecommendation<DeviceOptimizationRecommendation>(recommendation);
  }

  static async createMaintenanceRecommendation(
    recommendation: Omit<MaintenanceRecommendation, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<MaintenanceRecommendation> {
    return this.createRecommendation<MaintenanceRecommendation>(recommendation);
  }

  static async createCostReductionRecommendation(
    recommendation: Omit<CostReductionRecommendation, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CostReductionRecommendation> {
    return this.createRecommendation<CostReductionRecommendation>(recommendation);
  }

  static async createSustainabilityRecommendation(
    recommendation: Omit<SustainabilityRecommendation, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<SustainabilityRecommendation> {
    return this.createRecommendation<SustainabilityRecommendation>(recommendation);
  }

  // Query Operations
  static async getPendingRecommendations(userId: string): Promise<Recommendation[]> {
    return this.getRecommendations(userId, { status: 'pending' });
  }

  static async getHighPriorityRecommendations(userId: string): Promise<Recommendation[]> {
    return this.getRecommendations(userId, { priority: 'high' });
  }

  static async getCriticalRecommendations(userId: string): Promise<Recommendation[]> {
    return this.getRecommendations(userId, { priority: 'critical' });
  }

  static async getDeviceRecommendations(deviceId: string): Promise<Recommendation[]> {
    return this.getRecommendations('', { deviceId });
  }

  static async getDeviceGroupRecommendations(deviceGroupId: string): Promise<Recommendation[]> {
    return this.getRecommendations('', { deviceGroupId });
  }

  // Real-time Listeners
  static onRecommendationsUpdate(
    userId: string,
    callback: (recommendations: Recommendation[]) => void
  ): Unsubscribe {
    const recommendationsRef = collection(firestore, this.COLLECTION).withConverter(recommendationConverter);
    const q = query(
      recommendationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data()));
    });
  }

  static onDeviceRecommendationsUpdate(
    deviceId: string,
    callback: (recommendations: Recommendation[]) => void
  ): Unsubscribe {
    const recommendationsRef = collection(firestore, this.COLLECTION).withConverter(recommendationConverter);
    const q = query(
      recommendationsRef,
      where('deviceId', '==', deviceId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data()));
    });
  }

  // Utility Methods
  static async dismissAllRecommendations(
    userId: string,
    reason: string = 'Bulk dismissal'
  ): Promise<void> {
    const recommendations = await this.getPendingRecommendations(userId);
    const updates = recommendations.map(recommendation =>
      this.updateStatus(recommendation.id!, 'dismissed', reason)
    );
    await Promise.all(updates);
  }

  static async getRecommendationStats(userId: string): Promise<{
    total: number;
    pending: number;
    completed: number;
    dismissed: number;
    byType: Record<RecommendationType, number>;
    byPriority: Record<RecommendationPriority, number>;
  }> {
    const recommendations = await this.getRecommendations(userId);
    
    const stats = {
      total: recommendations.length,
      pending: 0,
      completed: 0,
      dismissed: 0,
      byType: {
        energy_savings: 0,
        device_optimization: 0,
        maintenance: 0,
        cost_reduction: 0,
        sustainability: 0
      },
      byPriority: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      }
    };

    recommendations.forEach(recommendation => {
      // Count by status
      if (recommendation.status === 'pending') stats.pending++;
      else if (recommendation.status === 'completed') stats.completed++;
      else if (recommendation.status === 'dismissed') stats.dismissed++;

      // Count by type
      stats.byType[recommendation.type]++;

      // Count by priority
      stats.byPriority[recommendation.priority]++;
    });

    return stats;
  }
} 