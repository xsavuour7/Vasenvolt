'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertCircle, Info, RefreshCw, Settings2 } from 'lucide-react';
import { DeviceLog } from '@/lib/firebase/firestore/device-types';
import { DeviceService } from '@/lib/firebase/firestore/device-service';

interface DeviceLogsProps {
  deviceId: string;
}

export function DeviceLogs({ deviceId }: DeviceLogsProps) {
  const [logs, setLogs] = useState<DeviceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const deviceLogs = await DeviceService.getDeviceLogs(deviceId);
        setLogs(deviceLogs);
        setError(null);
      } catch (error) {
        console.error('Error loading device logs:', error);
        setError('Failed to load device logs');
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [deviceId]);

  const getLogTypeColor = (type: DeviceLog['type']) => {
    switch (type) {
      case 'status_change':
        return 'bg-blue-100 text-blue-800';
      case 'metric_update':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'info':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLogTypeIcon = (type: DeviceLog['type']) => {
    switch (type) {
      case 'status_change':
        return <Settings2 className="h-4 w-4" />;
      case 'metric_update':
        return <Activity className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-destructive">
            <AlertCircle className="h-5 w-5 mr-2" />
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
            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            Loading logs...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-muted-foreground">
            <Info className="h-5 w-5 mr-2" />
            No logs available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Device Activity Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start space-x-4 p-4 rounded-lg border"
            >
              <div className={`p-2 rounded-full ${getLogTypeColor(log.type)}`}>
                {getLogTypeIcon(log.type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium">
                    {log.type.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {log.message}
                </div>
                {log.data && (
                  <div className="text-xs text-muted-foreground mt-1">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 