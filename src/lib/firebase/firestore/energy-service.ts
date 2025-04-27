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
  writeBatch,
  FirestoreDataConverter,
  DocumentData
} from 'firebase/firestore';
import {
  EnergyConsumption,
  EnergyProduction,
  EnergyStorage,
  EnergySummary,
  EnergySource,
  EnergyStatus,
  EnergyMode,
  energyConsumptionConverter,
  energyProductionConverter,
  energyStorageConverter,
  energySummaryConverter
} from './energy-types';

export class EnergyService {
  private static readonly COLLECTIONS = {
    CONSUMPTION: 'energyConsumption',
    PRODUCTION: 'energyProduction',
    STORAGE: 'energyStorage',
    SUMMARIES: 'energySummaries'
  };

  private static createMetadata() {
    return {
      createdAt: Timestamp.now(),
      lastUpdated: Timestamp.now(),
      version: 1,
      tags: [],
      notes: ''
    };
  }

  private static async createWithMetadata<T extends { id?: string; metadata: any }>(
    collectionName: string,
    data: Omit<T, 'id' | 'metadata'>,
    converter: FirestoreDataConverter<T, DocumentData>
  ): Promise<T> {
    if (!firestore) throw new Error('Firestore not initialized');
    const collectionRef = collection(firestore, collectionName).withConverter(converter);
    const metadata = this.createMetadata();
    const docRef = await addDoc(collectionRef, {
      ...data,
      metadata
    } as WithFieldValue<Omit<T, 'id'>>);
    const snapshot = await getDoc(docRef.withConverter(converter));
    if (!snapshot.exists()) throw new Error(`Failed to create record in ${collectionName}`);
    return snapshot.data() as T;
  }

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

  static async createConsumption(consumption: Omit<EnergyConsumption, 'id' | 'metadata'>): Promise<EnergyConsumption> {
    return this.createWithMetadata(
      this.COLLECTIONS.CONSUMPTION,
      consumption,
      energyConsumptionConverter
    );
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

  static async createProduction(production: Omit<EnergyProduction, 'id' | 'metadata'>): Promise<EnergyProduction> {
    return this.createWithMetadata(
      this.COLLECTIONS.PRODUCTION,
      production,
      energyProductionConverter
    );
  }

  // Storage Operations
  static async getStorage(storageId: string): Promise<EnergyStorage | null> {
    if (!firestore) throw new Error('Firestore not initialized');
    const storageRef = doc(firestore, this.COLLECTIONS.STORAGE, storageId).withConverter(energyStorageConverter);
    const snapshot = await getDoc(storageRef);
    return snapshot.exists() ? snapshot.data() : null;
  }

  static async getStorageByDevice(deviceId: string, limit: number = 100): Promise<EnergyStorage[]> {
    if (!firestore) throw new Error('Firestore not initialized');
    const storageRef = collection(firestore, this.COLLECTIONS.STORAGE).withConverter(energyStorageConverter);
    const q = query(
      storageRef,
      where('deviceId', '==', deviceId),
      orderBy('metrics.timestamp', 'desc'),
      firestoreLimit(limit)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  static async createStorage(storage: Omit<EnergyStorage, 'id' | 'metadata'>): Promise<EnergyStorage> {
    return this.createWithMetadata(
      this.COLLECTIONS.STORAGE,
      storage,
      energyStorageConverter
    );
  }

  static async updateStorageStatus(
    storageId: string,
    status: EnergyStatus,
    mode: EnergyMode,
    stateOfCharge: number
  ): Promise<void> {
    if (!firestore) throw new Error('Firestore not initialized');
    if (stateOfCharge < 0 || stateOfCharge > 100) {
      throw new Error('State of charge must be between 0 and 100');
    }
    const storageRef = doc(firestore, this.COLLECTIONS.STORAGE, storageId).withConverter(energyStorageConverter);
    const metadata = {
      lastUpdated: Timestamp.now()
    };
    await updateDoc(storageRef, {
      status,
      mode,
      stateOfCharge,
      metadata
    });
  }

  // Summary Operations
  static async getSummary(summaryId: string): Promise<EnergySummary | null> {
    if (!firestore) throw new Error('Firestore not initialized');
    const summaryRef = doc(firestore, this.COLLECTIONS.SUMMARIES, summaryId).withConverter(energySummaryConverter);
    const snapshot = await getDoc(summaryRef);
    return snapshot.exists() ? snapshot.data() : null;
  }

  static async getSummariesByUser(
    userId: string,
    options: {
      startTime?: Date;
      endTime?: Date;
      limit?: number;
      startAfter?: string;
    } = {}
  ): Promise<EnergySummary[]> {
    if (!firestore) throw new Error('Firestore not initialized');
    const summaryRef = collection(firestore, this.COLLECTIONS.SUMMARIES).withConverter(energySummaryConverter);
    let q = query(summaryRef, where('userId', '==', userId));

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
      const lastDoc = await getDoc(doc(firestore, this.COLLECTIONS.SUMMARIES, options.startAfter));
      if (lastDoc.exists()) {
        q = query(q, startAfter(lastDoc));
      }
    }

    q = query(q, orderBy('metadata.createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  static async createSummary(summary: Omit<EnergySummary, 'id' | 'metadata'>): Promise<EnergySummary> {
    return this.createWithMetadata(
      this.COLLECTIONS.SUMMARIES,
      summary,
      energySummaryConverter
    );
  }

  // Real-time Listeners
  static onConsumptionUpdate(
    deviceId: string,
    callback: (consumption: EnergyConsumption | null) => void
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
      callback(snapshot.empty ? null : snapshot.docs[0].data());
    });
  }

  static onProductionUpdate(
    deviceId: string,
    callback: (production: EnergyProduction | null) => void
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
      callback(snapshot.empty ? null : snapshot.docs[0].data());
    });
  }

  static onStorageUpdate(
    deviceId: string,
    callback: (storage: EnergyStorage | null) => void
  ): Unsubscribe {
    if (!firestore) throw new Error('Firestore not initialized');
    const storageRef = collection(firestore, this.COLLECTIONS.STORAGE).withConverter(energyStorageConverter);
    const q = query(
      storageRef,
      where('deviceId', '==', deviceId),
      orderBy('metrics.timestamp', 'desc'),
      firestoreLimit(1)
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.empty ? null : snapshot.docs[0].data());
    });
  }

  // Utility Methods
  static async calculateEnergyBalance(
    userId: string,
    startTime: Date,
    endTime: Date
  ): Promise<{
    consumption: number;
    production: number;
    netEnergy: number;
  }> {
    if (!firestore) throw new Error('Firestore not initialized');
    if (startTime > endTime) {
      throw new Error('Start time must be before end time');
    }
    
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
      const timeDiff = (data.metrics.timestamp.getTime() - startTime.getTime()) / (1000 * 3600);
      return sum + (data.metrics.power * timeDiff);
    }, 0);

    const production = productionSnapshot.docs.reduce((sum, doc) => {
      const data = doc.data();
      const timeDiff = (data.metrics.timestamp.getTime() - startTime.getTime()) / (1000 * 3600);
      return sum + (data.metrics.power * timeDiff);
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
    
    const result: Record<EnergySource, { consumption: number; production: number }> = {
      solar: { consumption: 0, production: 0 },
      battery: { consumption: 0, production: 0 },
      grid: { consumption: 0, production: 0 },
      generator: { consumption: 0, production: 0 }
    };

    // Get consumption data
    const consumptionRef = collection(firestore, this.COLLECTIONS.CONSUMPTION).withConverter(energyConsumptionConverter);
    const consumptionQuery = query(
      consumptionRef,
      where('userId', '==', userId),
      where('metrics.timestamp', '>=', Timestamp.fromDate(startTime)),
      where('metrics.timestamp', '<=', Timestamp.fromDate(endTime))
    );
    const consumptionSnapshot = await getDocs(consumptionQuery);
    consumptionSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.source in result) {
        result[data.source as EnergySource].consumption += data.metrics.power || 0;
      }
    });

    // Get production data
    const productionRef = collection(firestore, this.COLLECTIONS.PRODUCTION).withConverter(energyProductionConverter);
    const productionQuery = query(
      productionRef,
      where('userId', '==', userId),
      where('metrics.timestamp', '>=', Timestamp.fromDate(startTime)),
      where('metrics.timestamp', '<=', Timestamp.fromDate(endTime))
    );
    const productionSnapshot = await getDocs(productionQuery);
    productionSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.source in result) {
        result[data.source as EnergySource].production += data.metrics.power || 0;
      }
    });

    return result;
  }
} 