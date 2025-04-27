'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const comparisonData = [
  { period: 'Jan', current: 120000, previous: 130000 },
  { period: 'Feb', current: 115000, previous: 125000 },
  { period: 'Mar', current: 125000, previous: 135000 },
  { period: 'Apr', current: 130000, previous: 140000 },
  { period: 'May', current: 140000, previous: 150000 },
  { period: 'Jun', current: 135000, previous: 145000 },
];

export function ConsumptionComparison() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Consumption Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="current"
                stroke="#8884d8"
                name="Current Period"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="previous"
                stroke="#82ca9d"
                name="Previous Period"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-medium">Total Savings</h3>
            <p className="mt-2 text-2xl font-bold text-green-500">$2,500</p>
            <p className="text-sm text-muted-foreground">
              Compared to previous period
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-medium">Efficiency Improvement</h3>
            <p className="mt-2 text-2xl font-bold text-green-500">8.5%</p>
            <p className="text-sm text-muted-foreground">
              Reduction in energy consumption
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 