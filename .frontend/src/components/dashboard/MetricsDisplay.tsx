'use client';

import React from 'react';
import { MetricsResponse } from '@/types/metrics';
import { Activity, TrendingUp, AlertCircle } from 'lucide-react';

interface MetricsDisplayProps {
  data: MetricsResponse | undefined;
  isLoading: boolean;
  error: Error | null;
}

export const MetricsDisplay: React.FC<MetricsDisplayProps> = ({
  data,
  isLoading,
  error,
}) => {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 text-red-800">
          <AlertCircle className="h-5 w-5" />
          <h3 className="font-semibold">Error loading metrics</h3>
        </div>
        <p className="text-red-600 mt-2 text-sm">{error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading metrics data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12 text-gray-500">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p>No metrics data available</p>
          <p className="text-sm mt-2">Select a meter to view live data</p>
        </div>
      </div>
    );
  }

  if (data.data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12 text-gray-500">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p>No metrics data available</p>
          <p className="text-sm mt-2">Select a meter to view live data</p>
        </div>
      </div>
    );
  }

  // Calculate summary statistics
  const totalKwh = data.data.reduce((sum, point) => sum + (point.kwh || 0), 0);
  const avgVoltage = data.data.length > 0
    ? data.data.reduce((sum, point) => sum + (point.voltage || 0), 0) / data.data.length
    : 0;
  const avgCurrent = data.data.length > 0
    ? data.data.reduce((sum, point) => sum + (point.current || 0), 0) / data.data.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Energy</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {totalKwh.toFixed(2)} kWh
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Voltage</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {avgVoltage.toFixed(1)} V
              </p>
            </div>
            <Activity className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Current</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {avgCurrent.toFixed(2)} A
              </p>
            </div>
            <Activity className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Metrics Data</h3>
          <p className="text-sm text-gray-500 mt-1">
            Range: {data.range} | {data.total_points} data points
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Energy (kWh)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Voltage (V)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current (A)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Power Factor
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.data.slice(0, 10).map((point, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(point.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {point.kwh?.toFixed(2) ?? '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {point.voltage?.toFixed(1) ?? '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {point.current?.toFixed(2) ?? '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {point.power_factor?.toFixed(2) ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.data.length > 10 && (
          <div className="px-6 py-4 bg-gray-50 text-sm text-gray-500 text-center">
            Showing 10 of {data.data.length} data points
          </div>
        )}
      </div>
    </div>
  );
};

