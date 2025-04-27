'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, BarChart2, Lightbulb, Shield, Clock, Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const features = [
  {
    title: 'Real-time Monitoring',
    description: 'Track your energy consumption in real-time with detailed analytics and insights.',
    icon: Zap,
  },
  {
    title: 'Advanced Analytics',
    description: 'Get deep insights into your energy usage patterns and identify optimization opportunities.',
    icon: BarChart2,
  },
  {
    title: 'Smart Recommendations',
    description: 'Receive AI-powered suggestions to improve your energy efficiency and reduce costs.',
    icon: Lightbulb,
  },
  {
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security and reliability for your energy management needs.',
    icon: Shield,
  },
  {
    title: '24/7 Monitoring',
    description: 'Round-the-clock monitoring and alerts to keep your systems running smoothly.',
    icon: Clock,
  },
  {
    title: 'Customizable Settings',
    description: 'Tailor the system to your specific needs with flexible configuration options.',
    icon: Settings,
  },
];

export function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1581094794329-c8112c4e0e0c?q=80&w=1920&auto=format&fit=crop"
            alt="Energy Management"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/60" />
        </div>
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl space-y-8">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl drop-shadow-lg">
              Smart Energy Management for the Modern World
            </h1>
            <p className="text-xl text-white/90 drop-shadow-md">
              Take control of your energy consumption with our AI-powered platform.
              Monitor, analyze, and optimize your energy usage in real-time.
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg">
                <Link href="/demo">View Demo</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white/10 text-white">
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Powerful Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform provides everything you need to manage your energy consumption effectively.
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
                    <CardTitle>{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to Transform Your Energy Management?
          </h2>
          <p className="text-xl max-w-2xl mx-auto">
            Join thousands of businesses already using VasenVolt to optimize their energy consumption.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/signup">Get Started Today</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold text-gray-900">VasenVolt</h3>
              <p className="text-gray-600 mt-2">Smart energy management for a sustainable future</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
                About Us
              </Link>
              <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500">
            <p>© {new Date().getFullYear()} VasenVolt. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 