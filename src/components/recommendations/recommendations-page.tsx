'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Lightbulb, 
  Zap, 
  DollarSign, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

type Status = 'pending' | 'in-progress' | 'completed';
type Priority = 'high' | 'medium' | 'low';

const recommendations = [
  {
    id: 'rec-1',
    title: 'Optimize HVAC Schedule',
    description: 'Adjust heating and cooling schedules based on occupancy patterns to reduce energy waste.',
    category: 'HVAC',
    impact: {
      savings: 15,
      cost: 120,
      implementation: 'medium',
      timeframe: '1 week',
    },
    status: 'pending' as Status,
    priority: 'high' as Priority,
  },
  {
    id: 'rec-2',
    title: 'Upgrade Lighting System',
    description: 'Replace traditional lighting with LED fixtures to reduce energy consumption.',
    category: 'Lighting',
    impact: {
      savings: 25,
      cost: 500,
      implementation: 'medium',
      timeframe: '2 weeks',
    },
    status: 'in-progress' as Status,
    priority: 'medium' as Priority,
  },
  {
    id: 'rec-3',
    title: 'Install Smart Thermostats',
    description: 'Implement smart thermostats for better temperature control and energy savings.',
    category: 'HVAC',
    impact: {
      savings: 20,
      cost: 300,
      implementation: 'easy',
      timeframe: '3 days',
    },
    status: 'completed' as Status,
    priority: 'high' as Priority,
  },
];

const statusColors: Record<Status, string> = {
  pending: 'bg-yellow-500',
  'in-progress': 'bg-blue-500',
  completed: 'bg-green-500',
};

const priorityColors: Record<Priority, string> = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

export function RecommendationsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recommendations</h1>
          <p className="text-muted-foreground">
            AI-powered suggestions to optimize your energy usage
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Lightbulb className="h-4 w-4 mr-2" />
            Generate New
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {recommendations.map((rec) => (
          <Card key={rec.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle>{rec.title}</CardTitle>
                    <Badge variant="outline">{rec.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {rec.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={priorityColors[rec.priority]}
                  >
                    {rec.priority}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={statusColors[rec.status]}
                  >
                    {rec.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setExpandedId(expandedId === rec.id ? null : rec.id)
                    }
                  >
                    {expandedId === rec.id ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            {expandedId === rec.id && (
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Potential Savings
                      </span>
                      <span className="font-medium">{rec.impact.savings}%</span>
                    </div>
                    <Progress value={rec.impact.savings} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Implementation Cost
                      </span>
                      <span className="font-medium">${rec.impact.cost}</span>
                    </div>
                    <Progress
                      value={
                        (rec.impact.cost / Math.max(...recommendations.map((r) => r.impact.cost))) *
                        100
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Implementation Time
                      </span>
                      <span className="font-medium">{rec.impact.timeframe}</span>
                    </div>
                    <Progress
                      value={
                        rec.impact.implementation === 'easy'
                          ? 25
                          : rec.impact.implementation === 'medium'
                          ? 50
                          : 75
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Learn More</Button>
                  <Button>Implement</Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recommendation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">3 Active Recommendations</p>
                <p className="text-sm text-muted-foreground">
                  {recommendations.filter((r) => r.status === 'completed').length}{' '}
                  implemented
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Potential Savings</p>
                <p className="text-sm text-muted-foreground">
                  Up to {Math.max(...recommendations.map((r) => r.impact.savings))}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-medium">Total Investment</p>
                <p className="text-sm text-muted-foreground">
                  ${recommendations.reduce((sum, r) => sum + r.impact.cost, 0)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 