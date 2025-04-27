'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useState } from 'react';

type Metric = {
  parameter: string;
  value: number;
  unit: string;
  change: number;
};

type SortableField = 'parameter' | 'value' | 'change';

const metrics: Metric[] = [
  {
    parameter: 'Total Energy Consumption',
    value: 12500,
    unit: 'kWh',
    change: -5.2,
  },
  {
    parameter: 'Peak Demand',
    value: 800,
    unit: 'kW',
    change: 2.1,
  },
  {
    parameter: 'Average Daily Usage',
    value: 4500,
    unit: 'kWh',
    change: -3.8,
  },
  {
    parameter: 'Carbon Emissions',
    value: 8500,
    unit: 'kg CO2',
    change: -6.5,
  },
  {
    parameter: 'Energy Cost',
    value: 2500,
    unit: 'USD',
    change: -4.7,
  },
  {
    parameter: 'Power Factor',
    value: 0.95,
    unit: '',
    change: 1.2,
  },
];

export function ConsumptionMetrics() {
  const [sortField, setSortField] = useState<SortableField>('parameter');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedMetrics = [...metrics].sort((a, b) => {
    if (sortField === 'parameter') {
      return sortDirection === 'asc'
        ? a.parameter.localeCompare(b.parameter)
        : b.parameter.localeCompare(a.parameter);
    }
    
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const handleSort = (field: SortableField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consumption Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort('parameter')}
              >
                <div className="flex items-center gap-2">
                  Parameter
                  {sortField === 'parameter' && (
                    sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort('value')}
              >
                <div className="flex items-center gap-2">
                  Value
                  {sortField === 'value' && (
                    sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>Unit</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort('change')}
              >
                <div className="flex items-center gap-2">
                  Change
                  {sortField === 'change' && (
                    sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMetrics.map((metric) => (
              <TableRow key={metric.parameter}>
                <TableCell className="font-medium">{metric.parameter}</TableCell>
                <TableCell>{metric.value.toLocaleString()}</TableCell>
                <TableCell>{metric.unit}</TableCell>
                <TableCell
                  className={
                    metric.change >= 0 ? 'text-green-500' : 'text-red-500'
                  }
                >
                  {metric.change > 0 ? '+' : ''}
                  {metric.change}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 