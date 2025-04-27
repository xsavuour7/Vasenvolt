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
} from 'recharts';
import { AlertCircle, TrendingUp, Zap } from 'lucide-react';

const data = [
  { time: '00:00', consumption: 400, predicted: 420 },
  { time: '03:00', consumption: 300, predicted: 310 },
  { time: '06:00', consumption: 200, predicted: 220 },
  { time: '09:00', consumption: 500, predicted: 480 },
  { time: '12:00', consumption: 800, predicted: 750 },
  { time: '15:00', consumption: 700, predicted: 680 },
  { time: '18:00', consumption: 600, predicted: 620 },
  { time: '21:00', consumption: 400, predicted: 410 },
];

const insights = [
  {
    title: 'Peak Hours Optimization',
    description: 'AI suggests shifting 15% of load to off-peak hours',
    icon: AlertCircle,
    impact: 'high',
  },
  {
    title: 'Efficiency Trend',
    description: 'Consumption 8% lower than predicted',
    icon: TrendingUp,
    impact: 'positive',
  },
  {
    title: 'Load Balancing',
    description: 'Optimal distribution across phases',
    icon: Zap,
    impact: 'optimal',
  },
];

export function EnergyOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Real-time Energy Consumption</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="consumption"
                stroke="#8884d8"
                strokeWidth={2}
                name="Actual"
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#82ca9d"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Predicted"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Current Usage</p>
            <p className="text-2xl font-bold">700 kW</p>
            <p className="text-sm text-green-500">↓ 5% from predicted</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Peak Demand</p>
            <p className="text-2xl font-bold">800 kW</p>
            <p className="text-sm text-yellow-500">↑ 2% from average</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Cost Savings</p>
            <p className="text-2xl font-bold">$150</p>
            <p className="text-sm text-green-500">This month</p>
          </div>
        </div>
        <div className="mt-4 space-y-4">
          <h3 className="text-sm font-medium">AI Insights</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {insights.map((insight) => {
              const Icon = insight.icon;
              return (
                <div
                  key={insight.title}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <div
                    className={`rounded-full p-2 ${
                      insight.impact === 'high'
                        ? 'bg-red-100 text-red-600'
                        : insight.impact === 'positive'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{insight.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {insight.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 