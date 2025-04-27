'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, TrendingUp, Zap } from 'lucide-react';

const metrics = [
  {
    title: 'High Energy Consumption Alert',
    description: 'Energy usage in Building A is 20% above normal levels',
    icon: AlertCircle,
    type: 'alert',
  },
  {
    title: 'Peak Hours Optimization',
    description: 'Successfully reduced peak hour consumption by 15%',
    icon: CheckCircle2,
    type: 'success',
  },
  {
    title: 'Energy Efficiency Trend',
    description: 'Overall efficiency improved by 8% this month',
    icon: TrendingUp,
    type: 'info',
  },
  {
    title: 'Power Surge Detected',
    description: 'Temporary power surge detected in Main Distribution Panel',
    icon: Zap,
    type: 'warning',
  },
];

export function MetricHighlights() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Critical Metrics & Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.title}
                className="flex items-start gap-4 rounded-lg border p-4"
              >
                <div
                  className={`rounded-full p-2 ${
                    metric.type === 'alert'
                      ? 'bg-red-100 text-red-600'
                      : metric.type === 'success'
                      ? 'bg-green-100 text-green-600'
                      : metric.type === 'warning'
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{metric.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {metric.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 