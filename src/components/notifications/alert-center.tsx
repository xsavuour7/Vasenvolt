'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Bell, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Shield, 
  Wrench,
  Server,
  Activity
} from 'lucide-react';
import { 
  Alert, 
  AlertType,
  AlertStatus,
  AlertSeverity
} from '@/lib/firebase/firestore/alerts-types';
import { AlertsService } from '@/lib/firebase/firestore/alerts-service';
import { useAuth } from '@/lib/firebase/auth/context';

export function AlertCenter() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AlertType | 'all'>('all');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const unsubscribe = AlertsService.onAlertsUpdate(
      user.uid,
      (updatedAlerts) => {
        setAlerts(updatedAlerts);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleAcknowledge = async (alertId: string) => {
    try {
      await AlertsService.acknowledgeAlert(alertId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to acknowledge alert');
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      await AlertsService.resolveAlert(alertId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve alert');
    }
  };

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'system':
        return <Server className="h-4 w-4" />;
      case 'device':
        return <Activity className="h-4 w-4" />;
      case 'energy':
        return <Zap className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'maintenance':
        return <Wrench className="h-4 w-4" />;
      case 'performance':
        return <Activity className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'error':
        return 'bg-orange-100 text-orange-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAlerts = alerts.filter(
    alert => activeTab === 'all' || alert.type === activeTab
  );

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Alerts</span>
          </div>
          <Badge variant="outline">
            {filteredAlerts.length} {filteredAlerts.length === 1 ? 'alert' : 'alerts'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" onValueChange={(value) => setActiveTab(value as AlertType | 'all')}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="device">Device</TabsTrigger>
            <TabsTrigger value="energy">Energy</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-4">
            {filteredAlerts.length === 0 ? (
              <div className="flex items-center justify-center text-muted-foreground py-8">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                No alerts
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div>
                      <div className="font-medium">{alert.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {alert.description}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {new Date(alert.metadata.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {alert.status === 'active' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAcknowledge(alert.id)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    )}
                    {alert.status === 'acknowledged' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleResolve(alert.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
} 