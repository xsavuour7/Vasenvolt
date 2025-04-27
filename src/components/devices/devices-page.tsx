'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Sun, 
  Battery, 
  Plus, 
  Settings, 
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';

const devices = [
  {
    id: 'solar-1',
    name: 'Solar Panel Array',
    type: 'solar',
    status: 'active',
    power: 4500,
    capacity: 5000,
    efficiency: 92,
    lastUpdate: '2 minutes ago',
    icon: Sun,
  },
  {
    id: 'battery-1',
    name: 'Energy Storage System',
    type: 'battery',
    status: 'active',
    power: 3200,
    capacity: 10000,
    efficiency: 95,
    lastUpdate: '1 minute ago',
    icon: Battery,
  },
  {
    id: 'grid-1',
    name: 'Grid Connection',
    type: 'grid',
    status: 'active',
    power: 1500,
    capacity: 5000,
    efficiency: 100,
    lastUpdate: '30 seconds ago',
    icon: Zap,
  },
];

const statusColors = {
  active: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
  offline: 'bg-gray-500',
};

export function DevicesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Devices</h1>
          <p className="text-muted-foreground">
            Monitor and manage your energy devices
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Device
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {devices.map((device) => {
          const Icon = device.icon;
          return (
            <Card key={device.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle>{device.name}</CardTitle>
                  </div>
                  <Badge variant={device.status === 'active' ? 'default' : 'secondary'}>
                    {device.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Power Output</span>
                    <span className="font-medium">
                      {device.power}W / {device.capacity}W
                    </span>
                  </div>
                  <Progress value={(device.power / device.capacity) * 100} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Efficiency</p>
                    <p className="text-lg font-medium">{device.efficiency}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Last Update</p>
                    <p className="text-sm font-medium">{device.lastUpdate}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Alerts
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Device Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">All Systems Operational</p>
                <p className="text-sm text-muted-foreground">
                  All devices are functioning normally
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Last System Check</p>
                <p className="text-sm text-muted-foreground">
                  2 minutes ago
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-medium">Active Alerts</p>
                <p className="text-sm text-muted-foreground">
                  No critical alerts
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 