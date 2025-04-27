'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const hourlyData = [
  { hour: '00:00', consumption: 400, peak: 600 },
  { hour: '03:00', consumption: 300, peak: 500 },
  { hour: '06:00', consumption: 200, peak: 400 },
  { hour: '09:00', consumption: 500, peak: 700 },
  { hour: '12:00', consumption: 800, peak: 1000 },
  { hour: '15:00', consumption: 700, peak: 900 },
  { hour: '18:00', consumption: 600, peak: 800 },
  { hour: '21:00', consumption: 400, peak: 600 },
];

const dailyData = [
  { day: 'Mon', consumption: 4000, peak: 5000 },
  { day: 'Tue', consumption: 3800, peak: 4800 },
  { day: 'Wed', consumption: 4200, peak: 5200 },
  { day: 'Thu', consumption: 4100, peak: 5100 },
  { day: 'Fri', consumption: 4500, peak: 5500 },
  { day: 'Sat', consumption: 3500, peak: 4500 },
  { day: 'Sun', consumption: 3200, peak: 4200 },
];

const monthlyData = [
  { month: 'Jan', consumption: 120000, peak: 150000 },
  { month: 'Feb', consumption: 115000, peak: 145000 },
  { month: 'Mar', consumption: 125000, peak: 155000 },
  { month: 'Apr', consumption: 130000, peak: 160000 },
  { month: 'May', consumption: 140000, peak: 170000 },
  { month: 'Jun', consumption: 135000, peak: 165000 },
];

export function UsagePatterns() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Energy Usage Patterns</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hourly" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hourly">Hourly</TabsTrigger>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          <TabsContent value="hourly">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="consumption" fill="#8884d8" name="Average Consumption" />
                  <Bar dataKey="peak" fill="#82ca9d" name="Peak Consumption" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="daily">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="consumption" fill="#8884d8" name="Average Consumption" />
                  <Bar dataKey="peak" fill="#82ca9d" name="Peak Consumption" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="monthly">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="consumption" fill="#8884d8" name="Average Consumption" />
                  <Bar dataKey="peak" fill="#82ca9d" name="Peak Consumption" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 