'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Clock, Zap } from 'lucide-react';

const recommendations = [
  {
    id: 1,
    title: 'Load Shifting Optimization',
    description: 'Shift 20% of peak hour consumption to off-peak hours',
    impact: 'high',
    savings: 200,
    implementation: 'medium',
    status: 'pending',
    details: {
      currentPeak: '12:00-15:00',
      targetShift: '20%',
      estimatedSavings: '$200/month',
      paybackPeriod: '3 months',
    },
  },
  {
    id: 2,
    title: 'HVAC System Upgrade',
    description: 'Replace outdated HVAC system with energy-efficient model',
    impact: 'very high',
    savings: 500,
    implementation: 'high',
    status: 'in_progress',
    details: {
      currentEfficiency: '65%',
      targetEfficiency: '85%',
      estimatedSavings: '$500/month',
      paybackPeriod: '12 months',
    },
  },
  {
    id: 3,
    title: 'Lighting Retrofit',
    description: 'Replace traditional lighting with LED fixtures',
    impact: 'medium',
    savings: 150,
    implementation: 'low',
    status: 'completed',
    details: {
      currentType: 'Fluorescent',
      targetType: 'LED',
      estimatedSavings: '$150/month',
      paybackPeriod: '6 months',
    },
  },
];

const implementationSteps = [
  {
    id: 1,
    title: 'Load Shifting',
    steps: [
      {
        id: '1.1',
        description: 'Analyze current consumption patterns',
        status: 'completed',
      },
      {
        id: '1.2',
        description: 'Identify shiftable loads',
        status: 'completed',
      },
      {
        id: '1.3',
        description: 'Develop load shifting schedule',
        status: 'in_progress',
      },
      {
        id: '1.4',
        description: 'Implement automated controls',
        status: 'pending',
      },
    ],
  },
  {
    id: 2,
    title: 'HVAC Upgrade',
    steps: [
      {
        id: '2.1',
        description: 'Conduct energy audit',
        status: 'completed',
      },
      {
        id: '2.2',
        description: 'Select new equipment',
        status: 'in_progress',
      },
      {
        id: '2.3',
        description: 'Schedule installation',
        status: 'pending',
      },
      {
        id: '2.4',
        description: 'Commission new system',
        status: 'pending',
      },
    ],
  },
];

export function EnergyRecommendations() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {recommendations.map((recommendation) => (
          <Card key={recommendation.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                <Badge
                  variant={
                    recommendation.status === 'completed'
                      ? 'default'
                      : recommendation.status === 'in_progress'
                      ? 'secondary'
                      : 'outline'
                  }
                >
                  {recommendation.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {recommendation.description}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Impact</span>
                    <span className="font-medium">{recommendation.impact}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Monthly Savings</span>
                    <span className="font-medium">${recommendation.savings}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Implementation</span>
                    <span className="font-medium">
                      {recommendation.implementation}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Details</h4>
                  <div className="rounded-lg border p-3 space-y-2">
                    {Object.entries(recommendation.details).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button className="w-full">View Implementation Plan</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Implementation Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {implementationSteps.map((project) => (
              <div key={project.id} className="space-y-4">
                <h3 className="text-lg font-medium">{project.title}</h3>
                <div className="space-y-2">
                  {project.steps.map((step) => (
                    <div
                      key={step.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`rounded-full p-2 ${
                            step.status === 'completed'
                              ? 'bg-green-100 text-green-600'
                              : step.status === 'in_progress'
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {step.status === 'completed' ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : step.status === 'in_progress' ? (
                            <Clock className="h-4 w-4" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{step.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          step.status === 'completed'
                            ? 'default'
                            : step.status === 'in_progress'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {step.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 