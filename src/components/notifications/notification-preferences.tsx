'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Mail, Smartphone, AlertTriangle } from 'lucide-react';
import type { NotificationPreferences } from '@/lib/firebase/firestore/settings-types';
import type { UserSettings } from '@/lib/firebase/firestore/settings-types';
import { SettingsService } from '@/lib/firebase/firestore/settings-service';
import { useAuth } from '@/lib/firebase/auth/context';

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const loadPreferences = async () => {
      try {
        const settings = await SettingsService.getSettings(user.uid);
        setPreferences(settings?.notifications || null);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load preferences');
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  const handleToggle = async (path: string, value: boolean) => {
    if (!user || !preferences) return;

    try {
      const newPreferences = { ...preferences };
      const pathParts = path.split('.');
      let current: any = newPreferences;
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }
      
      current[pathParts[pathParts.length - 1]] = value;
      
      await SettingsService.updateSettings(user.uid, {
        notifications: newPreferences
      });
      
      setPreferences(newPreferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    }
  };

  const handleFrequencyChange = async (path: string, value: string) => {
    if (!user || !preferences) return;

    try {
      const newPreferences = { ...preferences };
      const pathParts = path.split('.');
      let current: any = newPreferences;
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }
      
      current[pathParts[pathParts.length - 1]] = value;
      
      await SettingsService.updateSettings(user.uid, {
        notifications: newPreferences
      });
      
      setPreferences(newPreferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    }
  };

  const handleThresholdChange = async (path: string, value: number) => {
    if (!user || !preferences) return;

    try {
      const newPreferences = { ...preferences };
      const pathParts = path.split('.');
      let current: any = newPreferences;
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }
      
      current[pathParts[pathParts.length - 1]] = value;
      
      await SettingsService.updateSettings(user.uid, {
        notifications: newPreferences
      });
      
      setPreferences(newPreferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Bell className="h-5 w-5 mr-2 animate-pulse" />
            Loading preferences...
          </div>
        </CardContent>
      </Card>
    );
  }

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

  if (!preferences) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-muted-foreground">
            No preferences found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <span>Notification Preferences</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Notifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <h3 className="font-medium">Email Notifications</h3>
          </div>
          <div className="space-y-4 pl-7">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                checked={preferences.email.enabled}
                onCheckedChange={(checked) => handleToggle('email.enabled', checked)}
              />
            </div>
            {preferences.email.enabled && (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts via email
                    </p>
                  </div>
                  <Switch
                    checked={preferences.email.types.alerts}
                    onCheckedChange={(checked) => handleToggle('email.types.alerts', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive reports via email
                    </p>
                  </div>
                  <Switch
                    checked={preferences.email.types.reports}
                    onCheckedChange={(checked) => handleToggle('email.types.reports', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive maintenance notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={preferences.email.types.maintenance}
                    onCheckedChange={(checked) => handleToggle('email.types.maintenance', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive system updates via email
                    </p>
                  </div>
                  <Switch
                    checked={preferences.email.types.system}
                    onCheckedChange={(checked) => handleToggle('email.types.system', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notification Frequency</Label>
                    <p className="text-sm text-muted-foreground">
                      How often to receive email notifications
                    </p>
                  </div>
                  <Select
                    value={preferences.email.frequency}
                    onValueChange={(value) => handleFrequencyChange('email.frequency', value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Push Notifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            <h3 className="font-medium">Push Notifications</h3>
          </div>
          <div className="space-y-4 pl-7">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications on your devices
                </p>
              </div>
              <Switch
                checked={preferences.push.enabled}
                onCheckedChange={(checked) => handleToggle('push.enabled', checked)}
              />
            </div>
            {preferences.push.enabled && (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts via push notifications
                    </p>
                  </div>
                  <Switch
                    checked={preferences.push.types.alerts}
                    onCheckedChange={(checked) => handleToggle('push.types.alerts', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive reports via push notifications
                    </p>
                  </div>
                  <Switch
                    checked={preferences.push.types.reports}
                    onCheckedChange={(checked) => handleToggle('push.types.reports', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive maintenance notifications via push
                    </p>
                  </div>
                  <Switch
                    checked={preferences.push.types.maintenance}
                    onCheckedChange={(checked) => handleToggle('push.types.maintenance', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive system updates via push
                    </p>
                  </div>
                  <Switch
                    checked={preferences.push.types.system}
                    onCheckedChange={(checked) => handleToggle('push.types.system', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notification Frequency</Label>
                    <p className="text-sm text-muted-foreground">
                      How often to receive push notifications
                    </p>
                  </div>
                  <Select
                    value={preferences.push.frequency}
                    onValueChange={(value) => handleFrequencyChange('push.frequency', value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Alert Thresholds */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-medium">Alert Thresholds</h3>
          </div>
          <div className="space-y-4 pl-7">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Energy Consumption Threshold</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when energy consumption exceeds this value (kWh)
                </p>
              </div>
              <input
                type="number"
                value={preferences.thresholds.energyConsumption}
                onChange={(e) => handleThresholdChange('thresholds.energyConsumption', parseFloat(e.target.value))}
                className="w-[100px] rounded-md border p-2"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Cost Threshold</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when cost exceeds this value ($)
                </p>
              </div>
              <input
                type="number"
                value={preferences.thresholds.cost}
                onChange={(e) => handleThresholdChange('thresholds.cost', parseFloat(e.target.value))}
                className="w-[100px] rounded-md border p-2"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Device Status Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts for device status changes
                </p>
              </div>
              <Switch
                checked={preferences.thresholds.deviceStatus}
                onCheckedChange={(checked) => handleToggle('thresholds.deviceStatus', checked)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 