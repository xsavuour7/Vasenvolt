'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard } from 'lucide-react';
import { useMetricsByMeter } from '@/hooks/useMetrics';
import { MeterSelector } from '@/components/dashboard/MeterSelector';
import { MetricsDisplay } from '@/components/dashboard/MetricsDisplay';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [selectedMeterId, setSelectedMeterId] = useState<number | undefined>(undefined);
  const [timeRange, setTimeRange] = useState<string>('24h');

  // Fetch metrics when a meter is selected
  const {
    data: metricsData,
    isLoading: metricsLoading,
    error: metricsError,
  } = useMetricsByMeter(selectedMeterId, timeRange);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
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
    return null; // Will redirect via useEffect
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <LayoutDashboard className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <p className="text-gray-600">Welcome back, {user.username}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Energy</h3>
          <p className="text-3xl font-bold text-blue-600">0 kWh</p>
          <p className="text-sm text-gray-500 mt-2">All time</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Sites</h3>
          <p className="text-3xl font-bold text-green-600">0</p>
          <p className="text-sm text-gray-500 mt-2">Currently monitoring</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Meters</h3>
          <p className="text-3xl font-bold text-purple-600">0</p>
          <p className="text-sm text-gray-500 mt-2">Total devices</p>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Live Metrics</h2>
          
          {/* Meter Selection and Time Range */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <MeterSelector
              selectedMeterId={selectedMeterId}
              onMeterChange={setSelectedMeterId}
            />
            
            <div className="flex items-center space-x-4">
              <label htmlFor="time-range" className="text-sm font-medium text-gray-700">
                Time Range:
              </label>
              <select
                id="time-range"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Metrics Display */}
        {selectedMeterId ? (
          <MetricsDisplay
            data={metricsData}
            isLoading={metricsLoading}
            error={metricsError}
          />
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>Select a meter to view live metrics data</p>
            <p className="text-sm mt-2">Choose a meter from the dropdown above</p>
          </div>
        )}
      </div>
    </div>
  );
}

