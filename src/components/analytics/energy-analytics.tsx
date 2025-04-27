'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { AlertCircle, Clock, TrendingUp, Zap } from 'lucide-react';
import {
  defaultXAxisConfig,
  defaultYAxisConfig,
  defaultCartesianGridConfig,
  defaultBarStyle,
  defaultLineStyle,
  defaultTooltipConfig,
} from '@/lib/utils/chart-config';

const hourlyData = [
  { hour: '00:00', consumption: 400, cost: 40 },
  { hour: '03:00', consumption: 300, cost: 30 },
  { hour: '06:00', consumption: 200, cost: 20 },
  { hour: '09:00', consumption: 500, cost: 50 },
  { hour: '12:00', consumption: 800, cost: 80 },
  { hour: '15:00', consumption: 700, cost: 70 },
  { hour: '18:00', consumption: 600, cost: 60 },
  { hour: '21:00', consumption: 400, cost: 40 },
];

const weeklyData = [
  { day: 'Mon', consumption: 4000, cost: 400 },
  { day: 'Tue', consumption: 3800, cost: 380 },
  { day: 'Wed', consumption: 4200, cost: 420 },
  { day: 'Thu', consumption: 4100, cost: 410 },
  { day: 'Fri', consumption: 4500, cost: 450 },
  { day: 'Sat', consumption: 3500, cost: 350 },
  { day: 'Sun', consumption: 3200, cost: 320 },
];

const monthlyData = [
  { month: 'Jan', consumption: 120000, cost: 12000 },
  { month: 'Feb', consumption: 115000, cost: 11500 },
  { month: 'Mar', consumption: 125000, cost: 12500 },
  { month: 'Apr', consumption: 130000, cost: 13000 },
  { month: 'May', consumption: 140000, cost: 14000 },
  { month: 'Jun', consumption: 135000, cost: 13500 },
];

const insights = [
  {
    title: 'Peak Hours Analysis',
    description: 'Highest consumption between 12:00-15:00',
    icon: Clock,
    impact: 'info',
  },
  {
    title: 'Cost Optimization',
    description: 'Potential savings of $500/month by shifting load',
    icon: TrendingUp,
    impact: 'positive',
  },
  {
    title: 'Anomaly Detection',
    description: 'Unusual consumption pattern on Fridays',
    icon: AlertCircle,
    impact: 'warning',
  },
];

export function EnergyAnalytics() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consumption</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,250,000 kW</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$125,000</div>
            <p className="text-xs text-muted-foreground">
              +8.3% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Cost/kW</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.10</div>
            <p className="text-xs text-muted-foreground">
              -2.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Demand</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">800 kW</div>
            <p className="text-xs text-muted-foreground">
              +5.2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consumption Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="hourly">
            <TabsList>
              <TabsTrigger value="hourly">Hourly</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
            <TabsContent value="hourly">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData}>
                    <CartesianGrid {...defaultCartesianGridConfig} />
                    <XAxis dataKey="hour" {...defaultXAxisConfig} />
                    <YAxis yAxisId="left" {...defaultYAxisConfig} />
                    <YAxis yAxisId="right" orientation="right" {...defaultYAxisConfig} />
                    <Tooltip contentStyle={defaultTooltipConfig.contentStyle} labelStyle={defaultTooltipConfig.labelStyle} />
                    <Bar
                      yAxisId="left"
                      dataKey="consumption"
                      fill={defaultBarStyle.fill}
                      radius={defaultBarStyle.radius}
                      name="Consumption (kW)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="cost"
                      stroke={defaultLineStyle.stroke}
                      strokeWidth={defaultLineStyle.strokeWidth}
                      dot={defaultLineStyle.dot}
                      activeDot={defaultLineStyle.activeDot}
                      name="Cost ($)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="weekly">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid {...defaultCartesianGridConfig} />
                    <XAxis dataKey="day" {...defaultXAxisConfig} />
                    <YAxis yAxisId="left" {...defaultYAxisConfig} />
                    <YAxis yAxisId="right" orientation="right" {...defaultYAxisConfig} />
                    <Tooltip contentStyle={defaultTooltipConfig.contentStyle} labelStyle={defaultTooltipConfig.labelStyle} />
                    <Bar
                      yAxisId="left"
                      dataKey="consumption"
                      fill={defaultBarStyle.fill}
                      radius={defaultBarStyle.radius}
                      name="Consumption (kW)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="cost"
                      stroke={defaultLineStyle.stroke}
                      strokeWidth={defaultLineStyle.strokeWidth}
                      dot={defaultLineStyle.dot}
                      activeDot={defaultLineStyle.activeDot}
                      name="Cost ($)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="monthly">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid {...defaultCartesianGridConfig} />
                    <XAxis dataKey="month" {...defaultXAxisConfig} />
                    <YAxis yAxisId="left" {...defaultYAxisConfig} />
                    <YAxis yAxisId="right" orientation="right" {...defaultYAxisConfig} />
                    <Tooltip contentStyle={defaultTooltipConfig.contentStyle} labelStyle={defaultTooltipConfig.labelStyle} />
                    <Bar
                      yAxisId="left"
                      dataKey="consumption"
                      fill={defaultBarStyle.fill}
                      radius={defaultBarStyle.radius}
                      name="Consumption (kW)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="cost"
                      stroke={defaultLineStyle.stroke}
                      strokeWidth={defaultLineStyle.strokeWidth}
                      dot={defaultLineStyle.dot}
                      activeDot={defaultLineStyle.activeDot}
                      name="Cost ($)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h4 className="text-sm font-medium">Load Shifting</h4>
                <p className="text-xs text-muted-foreground">
                  Shift 20% of peak hour consumption to off-peak hours to save $200/month
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h4 className="text-sm font-medium">Equipment Upgrade</h4>
                <p className="text-xs text-muted-foreground">
                  Upgrade HVAC system to save 15% on energy consumption
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h4 className="text-sm font-medium">Maintenance Schedule</h4>
                <p className="text-xs text-muted-foreground">
                  Schedule preventive maintenance for optimal performance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 