'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Bell, CheckCircle2 } from 'lucide-react';
import { DeviceAlert } from '@/lib/firebase/firestore/device-types';
import { DeviceService } from '@/lib/firebase/firestore/device-service';

interface DeviceAlertsProps {
  deviceId: string;
}

export function DeviceAlerts({ deviceId }: DeviceAlertsProps) {
  const [alerts, setAlerts] = useState<DeviceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = DeviceService.onDeviceAlerts(deviceId, (updatedAlerts) => {
      setAlerts(updatedAlerts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [deviceId]);

  const handleResolveAlert = async (alertId: string) => {
    try {
      await DeviceService.resolveAlert(alertId);
    } catch (error) {
      console.error('Error resolving alert:', error);
      setError('Failed to resolve alert');
    }
  };

  const getSeverityColor = (severity: DeviceAlert['severity']) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertTypeIcon = (type: DeviceAlert['type']) => {
    switch (type) {
      case 'power':
        return <AlertTriangle className="h-4 w-4" />;
      case 'temperature':
        return <AlertTriangle className="h-4 w-4" />;
      case 'connection':
        return <AlertTriangle className="h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-destructive">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Bell className="h-5 w-5 mr-2 animate-pulse" />
            Loading alerts...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-muted-foreground">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            No active alerts
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                  {getAlertTypeIcon(alert.type)}
                </div>
                <div>
                  <div className="font-medium">
                    {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert
                  </div>
                  <div className="text-sm text-muted-foreground">{alert.message}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getSeverityColor(alert.severity)}>
                  {alert.severity}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleResolveAlert(alert.id)}
                >
                  Resolve
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 