import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  UserCredential
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, firestore, storage } from './index';
import type { 
  UserProfile, 
  AnalyticsData, 
  Report, 
  Recommendation, 
  UserSettings 
} from './types';

export class AuthService {
  static async createUser(email: string, password: string): Promise<UserCredential> {
    if (!auth) throw new Error('Firebase Auth not initialized');
    return createUserWithEmailAndPassword(auth, email, password);
  }

  static async signIn(email: string, password: string): Promise<UserCredential> {
    if (!auth) throw new Error('Firebase Auth not initialized');
    return signInWithEmailAndPassword(auth, email, password);
  }

  static async signOut(): Promise<void> {
    if (!auth) throw new Error('Firebase Auth not initialized');
    await signOut(auth);
  }

  static async resetPassword(email: string): Promise<void> {
    if (!auth) throw new Error('Firebase Auth not initialized');
    await sendPasswordResetEmail(auth, email);
  }
}

// User Profile Services
export const userProfileService = {
  createProfile: async (userId: string, profile: Omit<UserProfile, 'id'>) => {
    if (!firestore) throw new Error('Firestore not initialized');
    const profileRef = doc(firestore, 'userProfiles', userId);
    await setDoc(profileRef, { ...profile, id: userId });
  },

  getProfile: async (userId: string): Promise<UserProfile | null> => {
    if (!firestore) throw new Error('Firestore not initialized');
    const profileRef = doc(firestore, 'userProfiles', userId);
    const profileSnap = await getDoc(profileRef);
    return profileSnap.exists() ? profileSnap.data() as UserProfile : null;
  },

  updateProfile: async (userId: string, profile: Partial<UserProfile>) => {
    if (!firestore) throw new Error('Firestore not initialized');
    const profileRef = doc(firestore, 'userProfiles', userId);
    await updateDoc(profileRef, profile);
  }
};

// Analytics Services
export const analyticsService = {
  addData: async (userId: string, data: Omit<AnalyticsData, 'id' | 'userId' | 'timestamp'>) => {
    if (!firestore) throw new Error('Firestore not initialized');
    const analyticsRef = collection(firestore, 'analytics');
    const newData = {
      ...data,
      userId,
      timestamp: Timestamp.now()
    };
    const docRef = await addDoc(analyticsRef, newData);
    return { ...newData, id: docRef.id };
  },

  getUserAnalytics: async (userId: string): Promise<AnalyticsData[]> => {
    if (!firestore) throw new Error('Firestore not initialized');
    const analyticsRef = collection(firestore, 'analytics');
    const q = query(analyticsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as AnalyticsData[];
  }
};

// Report Services
export const reportService = {
  createReport: async (userId: string, report: Omit<Report, 'id' | 'userId' | 'createdAt'>) => {
    if (!firestore) throw new Error('Firestore not initialized');
    const reportsRef = collection(firestore, 'reports');
    const newReport = {
      ...report,
      userId,
      createdAt: Timestamp.now()
    };
    const docRef = await addDoc(reportsRef, newReport);
    return { ...newReport, id: docRef.id };
  },

  getUserReports: async (userId: string): Promise<Report[]> => {
    if (!firestore) throw new Error('Firestore not initialized');
    const reportsRef = collection(firestore, 'reports');
    const q = query(reportsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Report[];
  },

  deleteReport: async (reportId: string) => {
    if (!firestore) throw new Error('Firestore not initialized');
    const reportRef = doc(firestore, 'reports', reportId);
    await deleteDoc(reportRef);
  }
};

// Recommendation Services
export const recommendationService = {
  createRecommendation: async (userId: string, recommendation: Omit<Recommendation, 'id' | 'userId' | 'createdAt'>) => {
    if (!firestore) throw new Error('Firestore not initialized');
    const recommendationsRef = collection(firestore, 'recommendations');
    const newRecommendation = {
      ...recommendation,
      userId,
      createdAt: Timestamp.now()
    };
    const docRef = await addDoc(recommendationsRef, newRecommendation);
    return { ...newRecommendation, id: docRef.id };
  },

  getUserRecommendations: async (userId: string): Promise<Recommendation[]> => {
    if (!firestore) throw new Error('Firestore not initialized');
    const recommendationsRef = collection(firestore, 'recommendations');
    const q = query(recommendationsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Recommendation[];
  },

  updateRecommendationStatus: async (recommendationId: string, status: 'pending' | 'completed' | 'dismissed') => {
    if (!firestore) throw new Error('Firestore not initialized');
    const recommendationRef = doc(firestore, 'recommendations', recommendationId);
    await updateDoc(recommendationRef, { status });
  }
};

// User Settings Services
export const userSettingsService = {
  getSettings: async (userId: string): Promise<UserSettings | null> => {
    if (!firestore) throw new Error('Firestore not initialized');
    const settingsRef = doc(firestore, 'userSettings', userId);
    const settingsSnap = await getDoc(settingsRef);
    return settingsSnap.exists() ? settingsSnap.data() as UserSettings : null;
  },

  updateSettings: async (userId: string, settings: Partial<UserSettings>) => {
    if (!firestore) throw new Error('Firestore not initialized');
    const settingsRef = doc(firestore, 'userSettings', userId);
    await updateDoc(settingsRef, settings);
  }
};

// Storage Services
export const storageService = {
  uploadFile: async (userId: string, file: File, path: string): Promise<string> => {
    if (!storage) throw new Error('Firebase Storage not initialized');
    const storageRef = ref(storage, `${userId}/${path}/${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }
}; 