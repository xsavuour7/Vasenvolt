import { Timestamp, DocumentData, WithFieldValue, FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase/firestore';

export type RecommendationType = 
  | 'energy_savings'
  | 'device_optimization'
  | 'maintenance'
  | 'cost_reduction'
  | 'sustainability';

export type RecommendationPriority = 'low' | 'medium' | 'high' | 'critical';

export type RecommendationStatus = 'pending' | 'in_progress' | 'completed' | 'dismissed';

export interface BaseRecommendation {
  id?: string;
  userId: string;
  deviceId?: string;
  deviceGroupId?: string;
  title: string;
  description: string;
  type: RecommendationType;
  priority: RecommendationPriority;
  status: RecommendationStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  implementedAt?: Timestamp;
  dismissedAt?: Timestamp;
  dismissReason?: string;
}

export interface EnergySavingsRecommendation extends BaseRecommendation {
  type: 'energy_savings';
  currentConsumption: number;
  targetConsumption: number;
  estimatedSavings: number;
  implementationCost?: number;
  paybackPeriod?: number;
  suggestedActions: string[];
}

export interface DeviceOptimizationRecommendation extends BaseRecommendation {
  type: 'device_optimization';
  currentMetrics: {
    efficiency: number;
    performance: number;
    utilization: number;
  };
  targetMetrics: {
    efficiency: number;
    performance: number;
    utilization: number;
  };
  optimizationSteps: string[];
  expectedImprovements: string[];
}

export interface MaintenanceRecommendation extends BaseRecommendation {
  type: 'maintenance';
  maintenanceType: 'preventive' | 'corrective' | 'predictive';
  urgency: 'routine' | 'soon' | 'urgent' | 'critical';
  lastMaintenance?: Timestamp;
  nextMaintenance?: Timestamp;
  maintenanceTasks: string[];
  estimatedDuration: number;
  requiredParts?: string[];
  estimatedCost?: number;
}

export interface CostReductionRecommendation extends BaseRecommendation {
  type: 'cost_reduction';
  currentCost: number;
  targetCost: number;
  estimatedSavings: number;
  implementationCost?: number;
  paybackPeriod?: number;
  savingsBreakdown: {
    category: string;
    amount: number;
    description: string;
  }[];
}

export interface SustainabilityRecommendation extends BaseRecommendation {
  type: 'sustainability';
  currentEmissions: number;
  targetEmissions: number;
  emissionsReduction: number;
  environmentalImpact: {
    category: string;
    impact: string;
    improvement: string;
  }[];
  sustainabilityScore: {
    current: number;
    target: number;
  };
}

export type Recommendation =
  | EnergySavingsRecommendation
  | DeviceOptimizationRecommendation
  | MaintenanceRecommendation
  | CostReductionRecommendation
  | SustainabilityRecommendation;

// Firestore data converter
export const recommendationConverter: FirestoreDataConverter<Recommendation, DocumentData> = {
  toFirestore: (recommendation: WithFieldValue<Recommendation>): DocumentData => {
    return {
      userId: recommendation.userId,
      deviceId: recommendation.deviceId,
      deviceGroupId: recommendation.deviceGroupId,
      title: recommendation.title,
      description: recommendation.description,
      type: recommendation.type,
      priority: recommendation.priority,
      status: recommendation.status,
      createdAt: recommendation.createdAt,
      updatedAt: recommendation.updatedAt,
      implementedAt: recommendation.implementedAt,
      dismissedAt: recommendation.dismissedAt,
      dismissReason: recommendation.dismissReason,
      // Type-specific fields
      ...(recommendation.type === 'energy_savings' && {
        currentConsumption: recommendation.currentConsumption,
        targetConsumption: recommendation.targetConsumption,
        estimatedSavings: recommendation.estimatedSavings,
        implementationCost: recommendation.implementationCost,
        paybackPeriod: recommendation.paybackPeriod,
        suggestedActions: recommendation.suggestedActions,
      }),
      ...(recommendation.type === 'device_optimization' && {
        currentMetrics: recommendation.currentMetrics,
        targetMetrics: recommendation.targetMetrics,
        optimizationSteps: recommendation.optimizationSteps,
        expectedImprovements: recommendation.expectedImprovements,
      }),
      ...(recommendation.type === 'maintenance' && {
        maintenanceType: recommendation.maintenanceType,
        urgency: recommendation.urgency,
        lastMaintenance: recommendation.lastMaintenance,
        nextMaintenance: recommendation.nextMaintenance,
        maintenanceTasks: recommendation.maintenanceTasks,
        estimatedDuration: recommendation.estimatedDuration,
        requiredParts: recommendation.requiredParts,
        estimatedCost: recommendation.estimatedCost,
      }),
      ...(recommendation.type === 'cost_reduction' && {
        currentCost: recommendation.currentCost,
        targetCost: recommendation.targetCost,
        estimatedSavings: recommendation.estimatedSavings,
        implementationCost: recommendation.implementationCost,
        paybackPeriod: recommendation.paybackPeriod,
        savingsBreakdown: recommendation.savingsBreakdown,
      }),
      ...(recommendation.type === 'sustainability' && {
        currentEmissions: recommendation.currentEmissions,
        targetEmissions: recommendation.targetEmissions,
        emissionsReduction: recommendation.emissionsReduction,
        environmentalImpact: recommendation.environmentalImpact,
        sustainabilityScore: recommendation.sustainabilityScore,
      }),
    };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>): Recommendation => {
    const data = snapshot.data();
    const base = {
      id: snapshot.id,
      userId: data.userId,
      deviceId: data.deviceId,
      deviceGroupId: data.deviceGroupId,
      title: data.title,
      description: data.description,
      type: data.type as RecommendationType,
      priority: data.priority as RecommendationPriority,
      status: data.status as RecommendationStatus,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      implementedAt: data.implementedAt,
      dismissedAt: data.dismissedAt,
      dismissReason: data.dismissReason,
    };

    switch (data.type) {
      case 'energy_savings':
        return {
          ...base,
          type: 'energy_savings',
          currentConsumption: data.currentConsumption,
          targetConsumption: data.targetConsumption,
          estimatedSavings: data.estimatedSavings,
          implementationCost: data.implementationCost,
          paybackPeriod: data.paybackPeriod,
          suggestedActions: data.suggestedActions,
        } as EnergySavingsRecommendation;

      case 'device_optimization':
        return {
          ...base,
          type: 'device_optimization',
          currentMetrics: data.currentMetrics,
          targetMetrics: data.targetMetrics,
          optimizationSteps: data.optimizationSteps,
          expectedImprovements: data.expectedImprovements,
        } as DeviceOptimizationRecommendation;

      case 'maintenance':
        return {
          ...base,
          type: 'maintenance',
          maintenanceType: data.maintenanceType,
          urgency: data.urgency,
          lastMaintenance: data.lastMaintenance,
          nextMaintenance: data.nextMaintenance,
          maintenanceTasks: data.maintenanceTasks,
          estimatedDuration: data.estimatedDuration,
          requiredParts: data.requiredParts,
          estimatedCost: data.estimatedCost,
        } as MaintenanceRecommendation;

      case 'cost_reduction':
        return {
          ...base,
          type: 'cost_reduction',
          currentCost: data.currentCost,
          targetCost: data.targetCost,
          estimatedSavings: data.estimatedSavings,
          implementationCost: data.implementationCost,
          paybackPeriod: data.paybackPeriod,
          savingsBreakdown: data.savingsBreakdown,
        } as CostReductionRecommendation;

      case 'sustainability':
        return {
          ...base,
          type: 'sustainability',
          currentEmissions: data.currentEmissions,
          targetEmissions: data.targetEmissions,
          emissionsReduction: data.emissionsReduction,
          environmentalImpact: data.environmentalImpact,
          sustainabilityScore: data.sustainabilityScore,
        } as SustainabilityRecommendation;

      default:
        throw new Error(`Unknown recommendation type: ${data.type}`);
    }
  },
}; 