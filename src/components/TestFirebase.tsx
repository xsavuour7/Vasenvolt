"use client";

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function TestFirebase() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Firebase Test Component</h2>
      <div className="bg-gray-100 p-4 rounded">
        <p className="mb-2">Firebase is {user ? 'connected' : 'not connected'}</p>
        {user && (
          <div>
            <p>User email: {user.email}</p>
            <p>User ID: {user.uid}</p>
          </div>
        )}
      </div>
    </div>
  );
} 