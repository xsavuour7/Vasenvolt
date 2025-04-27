"use client";

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
  DocumentData,
  Firestore
} from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import {
  UserProfile,
  AnalyticsData,
  Report,
  Recommendation,
  UserSettings
} from './types';

// Type guard to ensure Firestore is initialized
const getFirestore = () => {
  if (!firestore) throw new Error('Firestore not initialized');
  return firestore;
};

// Helper function to convert Firestore Timestamp to Date
const convertTimestamp = (data: DocumentData): DocumentData => {
  if (!data) return data;
  
  const converted = { ...data };
  Object.keys(converted).forEach(key => {
    const value = converted[key];
    if (value instanceof Timestamp) {
      converted[key] = value.toDate();
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      converted[key] = convertTimestamp(value);
    }
  });
  return converted;
};

// Type guard for required ID
const requireId = (data: { id?: string }, type: string): void => {
  if (!data.id) {
    throw new Error(`${type} must have an id`);
  }
};

// User Profiles Collection
export const userProfilesCollection = collection(getFirestore(), 'userProfiles');

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const docRef = doc(userProfilesCollection, uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return convertTimestamp(docSnap.data()) as UserProfile;
  }
  return null;
};

export const createUserProfile = async (profile: UserProfile): Promise<void> => {
  await setDoc(doc(userProfilesCollection, profile.uid), profile);
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
  await updateDoc(doc(userProfilesCollection, uid), data);
};

// Analytics Collection
export const analyticsCollection = collection(getFirestore(), 'analytics');

export const addAnalyticsData = async (data: AnalyticsData): Promise<void> => {
  requireId(data, 'Analytics data');
  const docRef = doc(analyticsCollection, data.id);
  await setDoc(docRef, data);
};

export const getUserAnalytics = async (userId: string, limitCount: number = 100): Promise<AnalyticsData[]> => {
  const q = query(
    analyticsCollection,
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    firestoreLimit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => convertTimestamp(doc.data()) as AnalyticsData);
};

// Reports Collection
export const reportsCollection = collection(getFirestore(), 'reports');

export const createReport = async (report: Report): Promise<void> => {
  requireId(report, 'Report');
  const docRef = doc(reportsCollection, report.id);
  await setDoc(docRef, report);
};

export const getUserReports = async (userId: string): Promise<Report[]> => {
  const q = query(
    reportsCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => convertTimestamp(doc.data()) as Report);
};

// Recommendations Collection
export const recommendationsCollection = collection(getFirestore(), 'recommendations');

export const createRecommendation = async (recommendation: Recommendation): Promise<void> => {
  requireId(recommendation, 'Recommendation');
  const docRef = doc(recommendationsCollection, recommendation.id);
  await setDoc(docRef, recommendation);
};

export const getUserRecommendations = async (userId: string): Promise<Recommendation[]> => {
  const q = query(
    recommendationsCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => convertTimestamp(doc.data()) as Recommendation);
};

export const updateRecommendationStatus = async (
  id: string, 
  status: Recommendation['status'],
  appliedAt?: Date
): Promise<void> => {
  const updateData: Partial<Recommendation> = { status };
  if (appliedAt) {
    updateData.appliedAt = appliedAt;
  }
  await updateDoc(doc(recommendationsCollection, id), updateData);
};

// User Settings Collection
export const userSettingsCollection = collection(getFirestore(), 'userSettings');

export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  const docRef = doc(userSettingsCollection, userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return convertTimestamp(docSnap.data()) as UserSettings;
  }
  return null;
};

export const updateUserSettings = async (userId: string, settings: Partial<UserSettings>): Promise<void> => {
  await updateDoc(doc(userSettingsCollection, userId), settings);
}; 