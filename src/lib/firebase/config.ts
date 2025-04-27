import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

export const firebaseConfig = {
  apiKey: "AIzaSyAt9Qh74ESysmtesot4gx9sUYbtn7TSxb0",
  authDomain: "vasenvolt-application.firebaseapp.com",
  projectId: "vasenvolt-application",
  storageBucket: "vasenvolt-application.firebasestorage.app",
  messagingSenderId: "138916781929",
  appId: "1:138916781929:web:8bb8aab49ff95bd16b67f8",
  measurementId: "G-5EJ3P981LR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

// Only initialize analytics in the browser environment
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null; 