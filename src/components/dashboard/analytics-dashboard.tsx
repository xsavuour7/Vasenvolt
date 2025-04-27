'use client';

import { useState, useEffect } from 'react';
import { useEmailAuth } from '@/lib/firebase/auth/hooks';
import { AnalyticsService } from '@/lib/firebase/firestore/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, TrendingUp, Zap, DollarSign, Clock } from 'lucide-react';

interface AnalyticsData {
  energy: {
    consumption: number;
    peakHours: string[];
    cost: number;
    savings: number;
  };
  performance: {
    efficiency: number;
    uptime: number;
    responseTime: number;
  };
  financial: {
    cost: number;
    savings: number;
    roi: number;
  };
}

interface TimeSeriesData {
  timestamp: string;
  value: number;
}

export function AnalyticsDashboard() {
  const { user } = useEmailAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'energy' | 'performance' | 'financial'>('energy');

  useEffect(() => {
    if (!user) return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await AnalyticsService.getAnalytics(user.uid);
        setAnalytics(data);
        
        // Fetch time series data
        const series = await AnalyticsService.getTimeSeriesData(user.uid, 'energy');
        setTimeSeries(series);
      } catch (err) {
        setError('Failed to load analytics data');
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!analytics) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Data Available</AlertTitle>
        <AlertDescription>Start using your devices to see analytics data.</AlertDescription>
      </Alert>
    );
  }

  const renderEnergyAnalytics = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Energy Consumption
            </CardTitle>
            <CardDescription>Total energy used this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.energy.consumption} kWh</div>
            <Badge variant="outline" className="mt-2">
              {analytics.energy.savings > 0 ? '↓' : '↑'} {Math.abs(analytics.energy.savings)}% vs last month
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Cost
            </CardTitle>
            <CardDescription>Total energy cost this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.energy.cost.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Peak Hours
            </CardTitle>
            <CardDescription>Most energy-intensive periods</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {analytics.energy.peakHours.map((hour, index) => (
                <li key={index} className="text-sm">{hour}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Energy Consumption Trend</CardTitle>
          <CardDescription>Daily energy usage over the past month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPerformanceAnalytics = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Efficiency
          </CardTitle>
          <CardDescription>Overall system efficiency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.performance.efficiency}%</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Uptime
          </CardTitle>
          <CardDescription>System availability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.performance.uptime}%</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Response Time
          </CardTitle>
          <CardDescription>Average system response time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.performance.responseTime}ms</div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFinancialAnalytics = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Total Cost
          </CardTitle>
          <CardDescription>Total operational cost</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${analytics.financial.cost.toFixed(2)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Savings
          </CardTitle>
          <CardDescription>Total cost savings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${analytics.financial.savings.toFixed(2)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            ROI
          </CardTitle>
          <CardDescription>Return on investment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.financial.roi}%</div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-4">
      <Tabs defaultValue="energy" onValueChange={(value) => setSelectedType(value as 'energy' | 'performance' | 'financial')}>
        <TabsList>
          <TabsTrigger value="energy">Energy</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>
        <TabsContent value="energy">{renderEnergyAnalytics()}</TabsContent>
        <TabsContent value="performance">{renderPerformanceAnalytics()}</TabsContent>
        <TabsContent value="financial">{renderFinancialAnalytics()}</TabsContent>
      </Tabs>
    </div>
  );
} 