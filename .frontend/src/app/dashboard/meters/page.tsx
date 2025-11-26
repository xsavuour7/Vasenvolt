'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Gauge } from 'lucide-react';

export default function MetersPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Gauge className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Meters</h1>
        </div>
        <p className="text-gray-600">Manage and monitor your energy meters</p>
      </div>

      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center py-12">
          <Gauge className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Meters Management</h2>
          <p className="text-gray-500 mb-4">
            This section will display your energy meters and monitoring data.
          </p>
          <p className="text-sm text-gray-400">
            Meter configuration and telemetry data will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}

