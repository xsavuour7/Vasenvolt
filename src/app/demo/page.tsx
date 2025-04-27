"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { formatNumber } from '@/lib/utils/format';
import { useSettings } from '@/hooks/use-settings';
import { DecimalPrecision } from '@/lib/types/settings';

// Sample data for the demo
const generateSampleData = (timeRange: string) => {
  const data = [];
  const now = new Date();
  let hours = 24;
  
  if (timeRange === 'week') hours = 24 * 7;
  if (timeRange === 'month') hours = 24 * 30;
  
  for (let i = 0; i < hours; i++) {
    const date = new Date(now);
    date.setHours(date.getHours() - i);
    data.unshift({
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      consumption: Math.random() * 100 + 50,
      cost: Math.random() * 20 + 10,
      carbon: Math.random() * 30 + 15,
    });
  }
  return data;
};

// Sample device data
const deviceData = [
  { id: 1, name: 'HVAC System', status: 'active', power: 3.5, efficiency: 85 },
  { id: 2, name: 'Lighting', status: 'active', power: 1.2, efficiency: 90 },
  { id: 3, name: 'Server Room', status: 'warning', power: 5.8, efficiency: 75 },
  { id: 4, name: 'Kitchen Equipment', status: 'active', power: 2.4, efficiency: 88 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function DemoPage() {
  const { settings, updateDecimalPrecision } = useSettings();
  const [timeRange, setTimeRange] = useState('day');
  const [data, setData] = useState(generateSampleData('day'));
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [devices, setDevices] = useState(deviceData);

  const handleStartDemo = () => {
    setIsDemoActive(true);
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setData(prevData => {
        const newData = [...prevData];
        newData.shift();
        const lastPoint = newData[newData.length - 1];
        newData.push({
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          consumption: lastPoint.consumption + (Math.random() * 20 - 10),
          cost: lastPoint.cost + (Math.random() * 4 - 2),
          carbon: lastPoint.carbon + (Math.random() * 6 - 3),
        });
        return newData;
      });

      // Simulate device status changes
      setDevices(prevDevices => 
        prevDevices.map(device => ({
          ...device,
          status: Math.random() > 0.95 ? 'warning' : 'active',
          power: device.power + (Math.random() * 0.4 - 0.2),
          efficiency: Math.min(100, Math.max(60, device.efficiency + (Math.random() * 4 - 2)))
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  };

  if (!settings) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Experience VasenVolt in Action</h1>
        <p className="text-xl text-muted-foreground mb-8">
          See how our energy monitoring platform can transform your energy management
        </p>
        <Button 
          size="lg" 
          onClick={handleStartDemo}
          disabled={isDemoActive}
        >
          {isDemoActive ? 'Demo in Progress' : 'Start Demo'}
        </Button>
      </div>

      {/* Controls Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Decimal Precision</CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={settings.display.decimalPrecision.selected.toString()}
              onValueChange={(value) => updateDecimalPrecision(parseInt(value) as DecimalPrecision)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select precision" />
              </SelectTrigger>
              <SelectContent>
                {[...Array(settings.display.decimalPrecision.maxAllowed + 1)].map((_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {i} decimal place{i !== 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time Range</CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={timeRange} 
              onValueChange={(value) => {
                setTimeRange(value);
                setData(generateSampleData(value));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">24 Hours</SelectItem>
                <SelectItem value="week">1 Week</SelectItem>
                <SelectItem value="month">1 Month</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Energy Consumption Threshold</CardTitle>
          </CardHeader>
          <CardContent>
            <Slider 
              defaultValue={[50]} 
              max={100} 
              step={1} 
              className="w-full"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Threshold</CardTitle>
          </CardHeader>
          <CardContent>
            <Slider 
              defaultValue={[10]} 
              max={20} 
              step={1} 
              className="w-full"
            />
          </CardContent>
        </Card>
      </div>

      {/* Device Status Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Device Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {devices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{device.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Power: {formatNumber(device.power, settings)} kW
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={device.status === 'active' ? 'default' : 'destructive'}>
                      {device.status}
                    </Badge>
                    <div className="text-sm">
                      {formatNumber(device.efficiency / 100, settings, 'percentage')} efficiency
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Energy Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={devices.map(device => ({
                      name: device.name,
                      value: device.power
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => 
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {devices.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => value.toFixed(1)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Energy Consumption</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="consumption" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Carbon Footprint</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="carbon" 
                    stroke="#82ca9d" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 