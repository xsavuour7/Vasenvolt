import { enableIndexedDbPersistence } from 'firebase/firestore';
import { auth, firestore, storage, analytics } from './config';

// Enable offline persistence
if (typeof window !== 'undefined' && firestore) {
  enableIndexedDbPersistence(firestore).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support persistence.');
    }
  });
}

// Export services
export { auth, firestore as db, storage, analytics }; 