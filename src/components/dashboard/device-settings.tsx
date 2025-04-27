'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Device } from '@/lib/firebase/firestore/types';
import { DeviceService } from '@/lib/firebase/firestore/device-service';

interface DeviceSettingsProps {
  device: Device;
  onSuccess?: () => void;
}

export function DeviceSettings({ device, onSuccess }: DeviceSettingsProps) {
  const [settings, setSettings] = useState(device.settings || {});
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await DeviceService.updateDevice(device.id, {
        ...device,
        settings: {
          ...device.settings,
          ...settings
        }
      });
      onSuccess?.();
    } catch (error) {
      console.error('Error updating device settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Power Management</Label>
            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.autoPowerOff || false}
                onCheckedChange={(checked) => handleInputChange('autoPowerOff', checked)}
              />
              <Label>Auto Power Off</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Power Threshold</Label>
            <Slider
              value={[settings.powerThreshold || 0]}
              onValueChange={([value]) => handleInputChange('powerThreshold', value)}
              max={100}
              step={1}
            />
            <div className="text-sm text-muted-foreground">
              {settings.powerThreshold || 0}% of maximum power
            </div>
          </div>

          <div className="space-y-2">
            <Label>Operating Mode</Label>
            <Select
              value={settings.operatingMode || 'normal'}
              onValueChange={(value) => handleInputChange('operatingMode', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="eco">Eco</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Alert Thresholds</Label>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Temperature (°C)</Label>
                <Input
                  type="number"
                  value={settings.temperatureThreshold || 0}
                  onChange={(e) => handleInputChange('temperatureThreshold', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Voltage (V)</Label>
                <Input
                  type="number"
                  value={settings.voltageThreshold || 0}
                  onChange={(e) => handleInputChange('voltageThreshold', Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Schedule</Label>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={settings.schedule?.startTime || ''}
                  onChange={(e) => handleInputChange('schedule', {
                    ...settings.schedule,
                    startTime: e.target.value
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={settings.schedule?.endTime || ''}
                  onChange={(e) => handleInputChange('schedule', {
                    ...settings.schedule,
                    endTime: e.target.value
                  })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 