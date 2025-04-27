'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

type Recommendation = {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedSavings: number;
  implementationTime: string;
  status: 'pending' | 'in-progress' | 'completed';
};

const recommendations: Recommendation[] = [
  {
    id: '1',
    title: 'Upgrade HVAC System',
    description: 'Replace aging HVAC system with energy-efficient model to reduce cooling costs',
    impact: 'high',
    difficulty: 'hard',
    estimatedSavings: 2500,
    implementationTime: '2-3 weeks',
    status: 'pending',
  },
  {
    id: '2',
    title: 'Install Smart Thermostats',
    description: 'Implement smart thermostats for better temperature control and scheduling',
    impact: 'medium',
    difficulty: 'easy',
    estimatedSavings: 800,
    implementationTime: '1-2 days',
    status: 'in-progress',
  },
  {
    id: '3',
    title: 'LED Lighting Retrofit',
    description: 'Replace all traditional lighting with energy-efficient LED fixtures',
    impact: 'medium',
    difficulty: 'medium',
    estimatedSavings: 1200,
    implementationTime: '1 week',
    status: 'completed',
  },
  {
    id: '4',
    title: 'Solar Panel Installation',
    description: 'Install rooftop solar panels to generate renewable energy',
    impact: 'high',
    difficulty: 'hard',
    estimatedSavings: 5000,
    implementationTime: '4-6 weeks',
    status: 'pending',
  },
];

const getImpactColor = (impact: Recommendation['impact']) => {
  switch (impact) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
  }
};

const getDifficultyColor = (difficulty: Recommendation['difficulty']) => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'hard':
      return 'bg-red-100 text-red-800';
  }
};

const getStatusIcon = (status: Recommendation['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'in-progress':
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case 'pending':
      return <AlertCircle className="h-5 w-5 text-gray-500" />;
  }
};

export function RecommendationsList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Energy Optimization Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className="rounded-lg border p-4 hover:bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium">{recommendation.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {recommendation.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(recommendation.status)}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge className={getImpactColor(recommendation.impact)}>
                  Impact: {recommendation.impact}
                </Badge>
                <Badge className={getDifficultyColor(recommendation.difficulty)}>
                  Difficulty: {recommendation.difficulty}
                </Badge>
                <Badge variant="outline">
                  Savings: ${recommendation.estimatedSavings.toLocaleString()}/year
                </Badge>
                <Badge variant="outline">
                  Time: {recommendation.implementationTime}
                </Badge>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 