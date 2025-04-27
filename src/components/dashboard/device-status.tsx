'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2, Clock, Zap } from 'lucide-react';

const devices = [
  {
    id: 1,
    name: 'HVAC System',
    status: 'operational',
    power: 2500,
    efficiency: 85,
    lastMaintenance: '2024-02-15',
    nextMaintenance: '2024-05-15',
    alerts: 0,
  },
  {
    id: 2,
    name: 'Lighting System',
    status: 'operational',
    power: 800,
    efficiency: 92,
    lastMaintenance: '2024-03-01',
    nextMaintenance: '2024-06-01',
    alerts: 0,
  },
  {
    id: 3,
    name: 'Server Room',
    status: 'warning',
    power: 3500,
    efficiency: 78,
    lastMaintenance: '2024-01-20',
    nextMaintenance: '2024-04-20',
    alerts: 2,
  },
  {
    id: 4,
    name: 'Water Heater',
    status: 'critical',
    power: 1800,
    efficiency: 65,
    lastMaintenance: '2023-12-10',
    nextMaintenance: '2024-03-10',
    alerts: 5,
  },
];

const insights = [
  {
    title: 'Maintenance Schedule',
    description: 'Water Heater requires immediate attention',
    icon: AlertCircle,
    impact: 'critical',
  },
  {
    title: 'Efficiency Alert',
    description: 'Server Room efficiency below target',
    icon: Zap,
    impact: 'warning',
  },
  {
    title: 'Optimal Performance',
    description: 'Lighting System operating at peak efficiency',
    icon: CheckCircle2,
    impact: 'positive',
  },
];

export function DeviceStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Status & Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {devices.map((device) => (
              <div
                key={device.id}
                className="rounded-lg border p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{device.name}</h3>
                  <Badge
                    variant={
                      device.status === 'operational'
                        ? 'default'
                        : device.status === 'warning'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {device.status}
                  </Badge>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Power Usage</span>
                    <span className="font-medium">{device.power}W</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Efficiency</span>
                    <span className="font-medium">{device.efficiency}%</span>
                  </div>
                  <Progress value={device.efficiency} className="h-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Maintenance</span>
                    <span className="font-medium">{device.lastMaintenance}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Next Maintenance</span>
                    <span className="font-medium">{device.nextMaintenance}</span>
                  </div>
                  {device.alerts > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-yellow-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{device.alerts} active alerts</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
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
                        insight.impact === 'critical'
                          ? 'bg-red-100 text-red-600'
                          : insight.impact === 'warning'
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-green-100 text-green-600'
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
        </div>
      </CardContent>
    </Card>
  );
} 