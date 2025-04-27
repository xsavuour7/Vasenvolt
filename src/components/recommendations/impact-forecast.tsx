'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const forecastData = [
  {
    category: 'Energy Consumption',
    current: 120000,
    projected: 90000,
    savings: 30000,
  },
  {
    category: 'Carbon Emissions',
    current: 85000,
    projected: 60000,
    savings: 25000,
  },
  {
    category: 'Energy Costs',
    current: 25000,
    projected: 18000,
    savings: 7000,
  },
  {
    category: 'Efficiency Score',
    current: 75,
    projected: 90,
    savings: 15,
  },
];

export function ImpactForecast() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Impact Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="current"
                fill="#8884d8"
                name="Current"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="projected"
                fill="#82ca9d"
                name="Projected"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-medium">Total Annual Savings</h3>
            <p className="mt-2 text-2xl font-bold text-green-500">
              ${forecastData.reduce((sum, item) => sum + item.savings, 0).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              Projected savings after implementing all recommendations
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-medium">Efficiency Improvement</h3>
            <p className="mt-2 text-2xl font-bold text-green-500">
              {((forecastData[3].savings / forecastData[3].current) * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-muted-foreground">
              Overall system efficiency increase
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 