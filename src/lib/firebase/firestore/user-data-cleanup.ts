import { db } from '@/lib/firebase';
import { deleteDoc, collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';

export async function cleanupUserData(userId: string): Promise<void> {
  const batch = writeBatch(db);
  
  try {
    // Delete user profile
    const userProfileRef = doc(db, 'users', userId);
    batch.delete(userProfileRef);

    // Delete user settings
    const userSettingsRef = doc(db, 'settings', userId);
    batch.delete(userSettingsRef);

    // Delete user devices
    const devicesQuery = query(
      collection(db, 'devices'),
      where('userId', '==', userId)
    );
    const devicesSnapshot = await getDocs(devicesQuery);
    devicesSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete user notifications
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId)
    );
    const notificationsSnapshot = await getDocs(notificationsQuery);
    notificationsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete user sessions
    const sessionsQuery = query(
      collection(db, 'sessions'),
      where('userId', '==', userId)
    );
    const sessionsSnapshot = await getDocs(sessionsQuery);
    sessionsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete user preferences
    const preferencesQuery = query(
      collection(db, 'preferences'),
      where('userId', '==', userId)
    );
    const preferencesSnapshot = await getDocs(preferencesQuery);
    preferencesSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Commit all deletions in a single batch
    await batch.commit();
  } catch (error) {
    console.error('Error cleaning up user data:', error);
    throw new Error('Failed to clean up user data');
  }
} 