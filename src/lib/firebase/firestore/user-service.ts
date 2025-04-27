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
  WithFieldValue,
  writeBatch,
  increment,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import {
  UserProfile,
  UserStats,
  UserRole,
  UserStatus,
  SubscriptionPlan,
  UserPreferences,
  userProfileConverter,
  userStatsConverter,
} from './user-types';

export class UserService {
  private static readonly PROFILES_COLLECTION = 'profiles';
  private static readonly STATS_COLLECTION = 'stats';

  // Profile Management
  static async getProfile(uid: string): Promise<UserProfile | null> {
    const profileRef = doc(firestore, this.PROFILES_COLLECTION, uid).withConverter(userProfileConverter);
    const snapshot = await getDoc(profileRef);
    return snapshot.exists() ? snapshot.data() : null;
  }

  static async createProfile(
    uid: string,
    email: string,
    displayName: string,
    role: UserRole = 'user',
    preferences?: Partial<UserPreferences>
  ): Promise<UserProfile> {
    const profilesRef = collection(firestore, this.PROFILES_COLLECTION).withConverter(userProfileConverter);
    const now = Timestamp.now();
    
    const defaultPreferences: UserPreferences = {
      theme: 'system',
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: true,
        push: true,
        frequency: 'immediate',
      },
      privacy: {
        showEmail: false,
        showPhone: false,
        showLocation: false,
      },
    };

    const newProfile = {
      uid,
      email,
      displayName,
      role,
      status: 'active' as UserStatus,
      subscription: {
        plan: 'free' as SubscriptionPlan,
        startDate: now,
        autoRenew: false,
      },
      preferences: {
        ...defaultPreferences,
        ...preferences,
      },
      metadata: {
        lastLogin: now,
        lastActive: now,
        loginCount: 1,
        devices: [],
        createdAt: now,
        updatedAt: now,
      },
    } as unknown as WithFieldValue<UserProfile>;

    const docRef = await addDoc(profilesRef, newProfile);
    const snapshot = await getDoc(docRef.withConverter(userProfileConverter));
    return snapshot.data()!;
  }

  static async updateProfile(
    uid: string,
    updates: Partial<UserProfile>
  ): Promise<void> {
    const profileRef = doc(firestore, this.PROFILES_COLLECTION, uid);
    await updateDoc(profileRef, {
      ...updates,
      'metadata.updatedAt': Timestamp.now(),
    });
  }

  static async deleteProfile(uid: string): Promise<void> {
    const profileRef = doc(firestore, this.PROFILES_COLLECTION, uid);
    await deleteDoc(profileRef);
  }

  // Role and Status Management
  static async updateRole(uid: string, role: UserRole): Promise<void> {
    const profileRef = doc(firestore, this.PROFILES_COLLECTION, uid);
    await updateDoc(profileRef, {
      role,
      'metadata.updatedAt': Timestamp.now(),
    });
  }

  static async updateStatus(uid: string, status: UserStatus): Promise<void> {
    const profileRef = doc(firestore, this.PROFILES_COLLECTION, uid);
    await updateDoc(profileRef, {
      status,
      'metadata.updatedAt': Timestamp.now(),
    });
  }

  // Subscription Management
  static async updateSubscription(
    uid: string,
    plan: SubscriptionPlan,
    autoRenew: boolean,
    endDate?: Timestamp
  ): Promise<void> {
    const profileRef = doc(firestore, this.PROFILES_COLLECTION, uid);
    await updateDoc(profileRef, {
      'subscription.plan': plan,
      'subscription.autoRenew': autoRenew,
      'subscription.endDate': endDate,
      'metadata.updatedAt': Timestamp.now(),
    });
  }

  // Preferences Management
  static async updatePreferences(
    uid: string,
    preferences: Partial<UserPreferences>
  ): Promise<void> {
    const profileRef = doc(firestore, this.PROFILES_COLLECTION, uid);
    await updateDoc(profileRef, {
      'preferences': preferences,
      'metadata.updatedAt': Timestamp.now(),
    });
  }

  // Activity Tracking
  static async updateLastLogin(uid: string): Promise<void> {
    const profileRef = doc(firestore, this.PROFILES_COLLECTION, uid);
    const now = Timestamp.now();
    await updateDoc(profileRef, {
      'metadata.lastLogin': now,
      'metadata.lastActive': now,
      'metadata.loginCount': increment(1),
      'metadata.updatedAt': now,
    });
  }

  static async updateLastActive(uid: string): Promise<void> {
    const profileRef = doc(firestore, this.PROFILES_COLLECTION, uid);
    const now = Timestamp.now();
    await updateDoc(profileRef, {
      'metadata.lastActive': now,
      'metadata.updatedAt': now,
    });
  }

  // Device Management
  static async addDevice(uid: string, deviceId: string): Promise<void> {
    const profileRef = doc(firestore, this.PROFILES_COLLECTION, uid);
    await updateDoc(profileRef, {
      'metadata.devices': arrayUnion(deviceId),
      'metadata.updatedAt': Timestamp.now(),
    });
  }

  static async removeDevice(uid: string, deviceId: string): Promise<void> {
    const profileRef = doc(firestore, this.PROFILES_COLLECTION, uid);
    await updateDoc(profileRef, {
      'metadata.devices': arrayRemove(deviceId),
      'metadata.updatedAt': Timestamp.now(),
    });
  }

  // Stats Management
  static async getStats(uid: string): Promise<UserStats | null> {
    const statsRef = doc(firestore, this.STATS_COLLECTION, uid).withConverter(userStatsConverter);
    const snapshot = await getDoc(statsRef);
    return snapshot.exists() ? snapshot.data() : null;
  }

  static async updateStats(
    uid: string,
    updates: Partial<UserStats>
  ): Promise<void> {
    const statsRef = doc(firestore, this.STATS_COLLECTION, uid);
    await updateDoc(statsRef, {
      ...updates,
      lastUpdated: Timestamp.now(),
    });
  }

  // Real-time Listeners
  static onProfileUpdate(
    uid: string,
    callback: (profile: UserProfile | null) => void
  ): Unsubscribe {
    const profileRef = doc(firestore, this.PROFILES_COLLECTION, uid).withConverter(userProfileConverter);
    return onSnapshot(profileRef, (snapshot) => {
      callback(snapshot.exists() ? snapshot.data() : null);
    });
  }

  static onStatsUpdate(
    uid: string,
    callback: (stats: UserStats | null) => void
  ): Unsubscribe {
    const statsRef = doc(firestore, this.STATS_COLLECTION, uid).withConverter(userStatsConverter);
    return onSnapshot(statsRef, (snapshot) => {
      callback(snapshot.exists() ? snapshot.data() : null);
    });
  }

  // Utility Methods
  static async getUsersByRole(role: UserRole): Promise<UserProfile[]> {
    const profilesRef = collection(firestore, this.PROFILES_COLLECTION).withConverter(userProfileConverter);
    const q = query(profilesRef, where('role', '==', role));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  static async getActiveUsers(): Promise<UserProfile[]> {
    const profilesRef = collection(firestore, this.PROFILES_COLLECTION).withConverter(userProfileConverter);
    const q = query(profilesRef, where('status', '==', 'active'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  static async getUsersBySubscription(plan: SubscriptionPlan): Promise<UserProfile[]> {
    const profilesRef = collection(firestore, this.PROFILES_COLLECTION).withConverter(userProfileConverter);
    const q = query(profilesRef, where('subscription.plan', '==', plan));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }
} 