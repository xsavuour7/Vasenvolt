'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import { 
  defaultXAxisConfig, 
  defaultYAxisConfig, 
  defaultCartesianGridConfig,
  defaultAreaStyle,
  defaultTooltipConfig
} from '@/lib/utils/chart-config';

const dailyData = [
  { date: 'Mon', consumption: 400, baseline: 450 },
  { date: 'Tue', consumption: 300, baseline: 350 },
  { date: 'Wed', consumption: 200, baseline: 250 },
  { date: 'Thu', consumption: 500, baseline: 550 },
  { date: 'Fri', consumption: 800, baseline: 750 },
  { date: 'Sat', consumption: 700, baseline: 650 },
  { date: 'Sun', consumption: 600, baseline: 550 },
];

const monthlyData = [
  { month: 'Jan', consumption: 12000, baseline: 13000 },
  { month: 'Feb', consumption: 11000, baseline: 12000 },
  { month: 'Mar', consumption: 13000, baseline: 14000 },
  { month: 'Apr', consumption: 14000, baseline: 15000 },
  { month: 'May', consumption: 15000, baseline: 16000 },
  { month: 'Jun', consumption: 16000, baseline: 17000 },
];

const yearlyData = [
  { year: '2020', consumption: 150000, baseline: 160000 },
  { year: '2021', consumption: 140000, baseline: 150000 },
  { year: '2022', consumption: 130000, baseline: 140000 },
  { year: '2023', consumption: 120000, baseline: 130000 },
];

const insights = [
  {
    title: 'Seasonal Pattern',
    description: 'Consumption typically peaks in summer months',
    icon: Clock,
    impact: 'info',
  },
  {
    title: 'Efficiency Trend',
    description: 'Year-over-year improvement of 15%',
    icon: TrendingUp,
    impact: 'positive',
  },
  {
    title: 'Anomaly Detection',
    description: 'Unusual spike detected on Friday',
    icon: AlertTriangle,
    impact: 'warning',
  },
];

export function HistoricalConsumption() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historical Energy Consumption</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily">
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
          <TabsContent value="daily">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dailyData}
                  margin={{ top: 16, right: 16, left: 8, bottom: 8 }}
                >
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--muted))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--muted))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...defaultCartesianGridConfig} />
                  <XAxis 
                    dataKey="date" 
                    {...defaultXAxisConfig}
                  />
                  <YAxis 
                    {...defaultYAxisConfig}
                    label={{ 
                      value: 'kWh', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { 
                        fill: 'hsl(var(--muted-foreground))',
                        fontSize: 11,
                        fontWeight: 500,
                        fontFamily: 'var(--font-sans)',
                      }
                    }}
                  />
                  <Tooltip {...defaultTooltipConfig} />
                  <Area
                    type="monotone"
                    dataKey="consumption"
                    stroke="hsl(var(--primary))"
                    fill="url(#colorActual)"
                    name="Actual"
                    strokeWidth={2}
                    fillOpacity={0.1}
                  />
                  <Area
                    type="monotone"
                    dataKey="baseline"
                    stroke="hsl(var(--muted))"
                    fill="url(#colorBaseline)"
                    name="Baseline"
                    strokeDasharray="3 3"
                    strokeWidth={2}
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="monthly">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyData}
                  margin={{ top: 16, right: 16, left: 8, bottom: 8 }}
                >
                  <defs>
                    <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...defaultCartesianGridConfig} />
                  <XAxis 
                    dataKey="month" 
                    {...defaultXAxisConfig}
                  />
                  <YAxis 
                    {...defaultYAxisConfig}
                    label={{ 
                      value: 'kWh', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { 
                        fill: 'hsl(var(--muted-foreground))',
                        fontSize: 11,
                        fontWeight: 500,
                        fontFamily: 'var(--font-sans)',
                      }
                    }}
                  />
                  <Tooltip {...defaultTooltipConfig} />
                  <Area 
                    type="monotone"
                    dataKey="consumption" 
                    stroke="hsl(var(--primary))" 
                    fill="url(#colorConsumption)"
                    strokeWidth={2}
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="yearly">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={yearlyData}
                  margin={{ top: 16, right: 16, left: 8, bottom: 8 }}
                >
                  <defs>
                    <linearGradient id="colorConsumptionYearly" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...defaultCartesianGridConfig} />
                  <XAxis 
                    dataKey="year" 
                    {...defaultXAxisConfig}
                  />
                  <YAxis 
                    {...defaultYAxisConfig}
                    label={{ 
                      value: 'kWh', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { 
                        fill: 'hsl(var(--muted-foreground))',
                        fontSize: 11,
                        fontWeight: 500,
                        fontFamily: 'var(--font-sans)',
                      }
                    }}
                  />
                  <Tooltip {...defaultTooltipConfig} />
                  <Area 
                    type="monotone"
                    dataKey="consumption" 
                    stroke="hsl(var(--primary))" 
                    fill="url(#colorConsumptionYearly)"
                    strokeWidth={2}
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Average Daily</p>
            <p className="text-2xl font-bold">500 kW</p>
            <p className="text-sm text-green-500">↓ 10% from baseline</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Monthly Total</p>
            <p className="text-2xl font-bold">15,000 kW</p>
            <p className="text-sm text-green-500">↓ 8% from last month</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Yearly Total</p>
            <p className="text-2xl font-bold">180,000 kW</p>
            <p className="text-sm text-green-500">↓ 12% from last year</p>
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
                      insight.impact === 'warning'
                        ? 'bg-yellow-100 text-yellow-600'
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