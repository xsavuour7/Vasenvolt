'use client';

import { useEffect, useState } from 'react';
import { populateTestData } from '@/lib/firebase/firestore/test-data';
import { auth, firestore } from '@/lib/firebase';
import { signInAnonymously, onAuthStateChanged, Auth, User } from 'firebase/auth';
import { collection, getDocs, Firestore } from 'firebase/firestore';

// Ensure Firebase instances are initialized
if (!auth || !firestore) {
  throw new Error('Firebase services not initialized');
}

// Type guard to ensure Firebase services are initialized
const getAuth = () => {
  if (!auth) throw new Error('Firebase Auth not initialized');
  return auth;
};

const getFirestore = () => {
  if (!firestore) throw new Error('Firestore not initialized');
  return firestore;
};

export default function TestPage() {
  const [status, setStatus] = useState<string>('Initializing...');
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authState, setAuthState] = useState<User | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (info: string) => {
    console.log(info);
    setDebugInfo(prev => [...prev, info]);
  };

  useEffect(() => {
    const auth = getAuth();
    addDebugInfo('Setting up auth state listener...');

    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState(user);
      addDebugInfo(`Auth state changed: ${user ? 'User authenticated' : 'No user'}`);
      
      // Only proceed with Firestore access if user is authenticated
      if (user) {
        runTest();
      }
    });

    return () => unsubscribe();
  }, []);

  async function runTest() {
    try {
      setStatus('Testing Firestore access...');
      setError(null);
      setAuthError(null);
      
      // Test Firestore access
      try {
        addDebugInfo('Testing Firestore access...');
        // Try accessing the userProfiles collection which we know exists
        const db = getFirestore();
        const userProfilesCollection = collection(db, 'userProfiles');
        await getDocs(userProfilesCollection);
        addDebugInfo('Firestore access successful');
      } catch (firestoreErr) {
        addDebugInfo(`Firestore access error: ${firestoreErr}`);
        throw new Error(`Firestore access failed: ${firestoreErr}`);
      }
      
      try {
        addDebugInfo('Starting test data population...');
        await populateTestData();
        addDebugInfo('Test data population completed successfully');
        setStatus('Test data population completed successfully!');
      } catch (dataErr) {
        addDebugInfo(`Data population error: ${dataErr}`);
        setError(dataErr instanceof Error ? dataErr.message : 'Data population error');
        setStatus('Test data population failed');
      }
    } catch (err) {
      addDebugInfo(`General error: ${err}`);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setStatus('Operation failed');
    }
  }

  // Initial authentication
  useEffect(() => {
    const auth = getAuth();
    addDebugInfo('Starting authentication process...');

    async function signIn() {
      try {
        setStatus('Authenticating...');
        setAuthError(null);
        addDebugInfo('Starting authentication process...');
        
        // Sign in anonymously
        await signInAnonymously(auth);
        addDebugInfo('Anonymous sign-in successful');
        setStatus('Authentication successful. Starting test data population...');
      } catch (authErr) {
        addDebugInfo(`Authentication error: ${authErr}`);
        setAuthError('Authentication failed. Please make sure Anonymous Authentication is enabled in Firebase Console.');
        setError(authErr instanceof Error ? authErr.message : 'Authentication error');
      }
    }

    signIn();
  }, []);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Firestore Test Page</h1>
      <div className="bg-white p-4 rounded shadow">
        <p className="mb-2">Status: {status}</p>
        <div className="mb-4 p-2 bg-gray-100 rounded">
          <p className="font-semibold">Auth State:</p>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(authState, null, 2)}
          </pre>
        </div>
        <div className="mb-4 p-2 bg-gray-100 rounded">
          <p className="font-semibold">Debug Information:</p>
          <ul className="text-sm">
            {debugInfo.map((info, index) => (
              <li key={index} className="mb-1">{info}</li>
            ))}
          </ul>
        </div>
        {authError && (
          <div className="text-yellow-600 mb-4">
            <p className="font-semibold">Authentication Issue:</p>
            <p>{authError}</p>
            <p className="mt-2">Please follow these steps:</p>
            <ol className="list-decimal list-inside">
              <li>Go to Firebase Console</li>
              <li>Select your project</li>
              <li>Go to Authentication</li>
              <li>Click "Sign-in method"</li>
              <li>Enable "Anonymous" authentication</li>
              <li>Click "Save"</li>
            </ol>
          </div>
        )}
        {error && (
          <div className="text-red-500">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
} 