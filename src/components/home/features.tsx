'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Activity,
  AlertCircle,
  Brain,
  Cloud,
  Leaf,
  LineChart,
} from 'lucide-react';

const features = [
  {
    title: 'Real-time Monitoring',
    description: 'Track your energy consumption in real-time with detailed insights and analytics.',
    icon: Activity,
  },
  {
    title: 'AI-Driven Analysis',
    description: 'Leverage artificial intelligence to identify patterns and optimize energy usage.',
    icon: Brain,
  },
  {
    title: 'Predictive Analytics',
    description: 'Get accurate forecasts of your energy needs and potential savings opportunities.',
    icon: LineChart,
  },
  {
    title: 'Automated Alerts',
    description: 'Receive instant notifications about unusual energy consumption patterns.',
    icon: AlertCircle,
  },
  {
    title: 'IoT Integration',
    description: 'Seamlessly connect with your smart devices and energy systems.',
    icon: Cloud,
  },
  {
    title: 'Carbon Footprint Tracking',
    description: 'Monitor and reduce your environmental impact with detailed carbon metrics.',
    icon: Leaf,
  },
];

export function Features() {
  return (
    <section className="py-16">
      <div className="container">
        <h2 className="mb-12 text-center text-3xl font-bold">Key Features</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
} 