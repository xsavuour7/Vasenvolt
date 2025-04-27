'use client';

import { useState, useEffect } from 'react';
import { useEmailAuth } from '@/lib/firebase/auth/hooks';
import { DeviceService } from '@/lib/firebase/firestore/device-service';
import { Device } from '@/lib/firebase/firestore/device-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Power, Activity, Thermometer, Battery, Clock, Settings } from 'lucide-react';

interface DeviceMonitoringProps {
  deviceId: string;
}

export function DeviceMonitoring({ deviceId }: DeviceMonitoringProps) {
  const { user } = useEmailAuth();
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = DeviceService.subscribeToDevice(deviceId, (updatedDevice) => {
      setDevice(updatedDevice);
      setLoading(false);
    }, (err) => {
      setError('Failed to load device data');
      console.error('Error subscribing to device:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, deviceId]);

  const handlePowerToggle = async () => {
    if (!device) return;
    try {
      await DeviceService.updateDevice(deviceId, {
        powerStatus: device.powerStatus === 'on' ? 'off' : 'on'
      });
    } catch (err) {
      setError('Failed to toggle power status');
      console.error('Error toggling power:', err);
    }
  };

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

  if (!device) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Device Not Found</AlertTitle>
        <AlertDescription>The requested device could not be found.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{device.name}</h2>
          <p className="text-sm text-muted-foreground">{device.model}</p>
        </div>
        <Button
          variant={device.powerStatus === 'on' ? 'destructive' : 'default'}
          onClick={handlePowerToggle}
          className="flex items-center gap-2"
        >
          <Power className="h-4 w-4" />
          {device.powerStatus === 'on' ? 'Turn Off' : 'Turn On'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Status
            </CardTitle>
            <CardDescription>Current device status</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant={device.status === 'active' ? 'default' : 'destructive'}>
              {device.status}
            </Badge>
            <div className="mt-2">
              <div className="text-sm text-muted-foreground">Last Updated</div>
              <div className="text-sm">{new Date(device.lastUpdated).toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Temperature
            </CardTitle>
            <CardDescription>Current device temperature</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {device.type === 'sensor' && device.readings.length > 0
                ? `${device.readings[device.readings.length - 1].value}${device.readings[device.readings.length - 1].unit}`
                : 'N/A'}
            </div>
            <Progress 
              value={device.type === 'sensor' && device.readings.length > 0 ? device.readings[device.readings.length - 1].value : 0} 
              max={100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Battery className="h-4 w-4" />
              Power Consumption
            </CardTitle>
            <CardDescription>Current power usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{device.powerConsumption || 0}W</div>
            <Progress value={device.powerConsumption || 0} max={1000} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Last Updated
            </CardTitle>
            <CardDescription>Device operation time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(device.metadata.lastUpdated).toLocaleTimeString()}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Last maintenance: {device.metadata.lastMaintenance?.toLocaleDateString() || 'Not available'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </CardTitle>
            <CardDescription>Device configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Auto Power Off</span>
                <Badge variant={device.settings.autoPowerOff ? 'default' : 'outline'}>
                  {device.settings.autoPowerOff ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Operating Mode</span>
                <Badge variant="outline">
                  {device.settings.operatingMode || 'Normal'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 