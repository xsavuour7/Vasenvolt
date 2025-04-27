'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Zap,
  Shield,
  Leaf,
  BarChart2,
  Clock,
  Users,
  ArrowRight,
} from 'lucide-react';

const features = [
  {
    title: 'AI-Powered Monitoring',
    description:
      'Advanced artificial intelligence algorithms analyze energy patterns and provide actionable insights.',
    icon: Zap,
  },
  {
    title: 'Enterprise-Grade Security',
    description:
      'Bank-level encryption and security protocols to protect your energy data.',
    icon: Shield,
  },
  {
    title: 'Sustainability Focus',
    description:
      'Help reduce carbon footprint and promote sustainable energy practices.',
    icon: Leaf,
  },
  {
    title: 'Real-time Analytics',
    description:
      'Instant access to detailed energy consumption metrics and trends.',
    icon: BarChart2,
  },
  {
    title: '24/7 Monitoring',
    description:
      'Continuous energy monitoring with automated alerts and notifications.',
    icon: Clock,
  },
  {
    title: 'Team Collaboration',
    description:
      'Share insights and collaborate with team members for better energy management.',
    icon: Users,
  },
];

const stats = [
  { label: 'Active Users', value: '10,000+' },
  { label: 'Energy Saved', value: '1.2M kWh' },
  { label: 'Cost Reduced', value: '$500K+' },
  { label: 'Devices Monitored', value: '50,000+' },
];

export function AboutPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Transforming Energy Management with AI
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          VasenVolt is revolutionizing how businesses and homeowners monitor and
          optimize their energy consumption through cutting-edge AI technology.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Our Mission</h2>
        <p className="text-muted-foreground">
          At VasenVolt, we believe that efficient energy management is crucial for
          both economic and environmental sustainability. Our mission is to
          empower businesses and homeowners with intelligent tools that make
          energy monitoring simple, insightful, and actionable.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-bold">Join Our Mission</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Be part of the energy revolution. Start monitoring your energy
            consumption intelligently today.
          </p>
          <Button>
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 