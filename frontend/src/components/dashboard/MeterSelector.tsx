'use client';

import React from 'react';
import { Gauge } from 'lucide-react';

interface MeterSelectorProps {
  selectedMeterId: number | undefined;
  onMeterChange: (meterId: number | undefined) => void;
  meters?: Array<{ id: number; name: string }>;
}

export const MeterSelector: React.FC<MeterSelectorProps> = ({
  selectedMeterId,
  onMeterChange,
  meters = [],
}) => {
  // For now, we'll use placeholder meters
  // In a real app, these would come from an API
  const placeholderMeters = meters.length > 0 
    ? meters 
    : [
        { id: 1, name: 'Meter 1' },
        { id: 2, name: 'Meter 2' },
        { id: 3, name: 'Meter 3' },
      ];

  return (
    <div className="flex items-center space-x-4">
      <label htmlFor="meter-select" className="text-sm font-medium text-gray-700 flex items-center">
        <Gauge className="h-4 w-4 mr-2" />
        Select Meter:
      </label>
      <select
        id="meter-select"
        value={selectedMeterId || ''}
        onChange={(e) => {
          const value = e.target.value;
          onMeterChange(value ? parseInt(value, 10) : undefined);
        }}
        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
      >
        <option value="">-- Select a meter --</option>
        {placeholderMeters.map((meter) => (
          <option key={meter.id} value={meter.id}>
            {meter.name}
          </option>
        ))}
      </select>
    </div>
  );
};

