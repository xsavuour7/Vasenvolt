'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
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

const temporalData = [
  { time: '00:00', consumption: 400 },
  { time: '03:00', consumption: 300 },
  { time: '06:00', consumption: 200 },
  { time: '09:00', consumption: 500 },
  { time: '12:00', consumption: 800 },
  { time: '15:00', consumption: 700 },
  { time: '18:00', consumption: 600 },
  { time: '21:00', consumption: 400 },
];

const categoryData = [
  { category: 'Lighting', consumption: 12000 },
  { category: 'HVAC', consumption: 35000 },
  { category: 'Equipment', consumption: 28000 },
  { category: 'Other', consumption: 15000 },
];

export function UsagePatterns() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Patterns</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="temporal" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="temporal">Temporal Analysis</TabsTrigger>
            <TabsTrigger value="category">Category Breakdown</TabsTrigger>
          </TabsList>
          <TabsContent value="temporal">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={temporalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="consumption"
                    stroke="#8884d8"
                    name="Consumption (kWh)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="category">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="consumption"
                    fill="#8884d8"
                    name="Consumption (kWh)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-medium">Peak Consumption</h3>
            <p className="mt-2 text-2xl font-bold">
              {Math.max(...temporalData.map((d) => d.consumption)).toLocaleString()} kWh
            </p>
            <p className="text-sm text-muted-foreground">
              At {temporalData.find((d) => d.consumption === Math.max(...temporalData.map((d) => d.consumption)))?.time}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-medium">Average Consumption</h3>
            <p className="mt-2 text-2xl font-bold">
              {(temporalData.reduce((sum, d) => sum + d.consumption, 0) / temporalData.length).toLocaleString()} kWh
            </p>
            <p className="text-sm text-muted-foreground">
              Per hour
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-medium">Total Daily Consumption</h3>
            <p className="mt-2 text-2xl font-bold">
              {temporalData.reduce((sum, d) => sum + d.consumption, 0).toLocaleString()} kWh
            </p>
            <p className="text-sm text-muted-foreground">
              Across all categories
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 