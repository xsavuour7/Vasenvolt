'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp, TrendingUp, TrendingDown } from 'lucide-react';

const insights = [
  {
    title: 'Peak Usage Time',
    value: '12:00 - 15:00',
    description: 'Highest energy consumption period',
    trend: 'up',
  },
  {
    title: 'Cost Savings',
    value: '$1,200',
    description: 'Compared to last month',
    trend: 'down',
  },
  {
    title: 'Efficiency Score',
    value: '85%',
    description: 'Based on consumption patterns',
    trend: 'up',
  },
];

export function InsightsSummary() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {insights.map((insight) => (
            <div
              key={insight.title}
              className="flex flex-col items-center rounded-lg border p-4 text-center"
            >
              <h3 className="text-sm font-medium">{insight.title}</h3>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-2xl font-bold">{insight.value}</span>
                {insight.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {insight.description}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 