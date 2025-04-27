'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

type Settings = {
  dashboard: {
    refreshInterval: number;
    showEnergyCosts: boolean;
    showCarbonEmissions: boolean;
  };
  notifications: {
    email: string;
    highConsumptionThreshold: number;
    peakDemandThreshold: number;
    receiveAlerts: boolean;
  };
  monitoring: {
    dataCollectionInterval: number;
    storeHistoricalData: boolean;
    dataRetentionPeriod: number;
  };
  account: {
    companyName: string;
    contactPerson: string;
    phoneNumber: string;
    address: string;
  };
};

const defaultSettings: Settings = {
  dashboard: {
    refreshInterval: 5,
    showEnergyCosts: true,
    showCarbonEmissions: true,
  },
  notifications: {
    email: 'admin@company.com',
    highConsumptionThreshold: 1000,
    peakDemandThreshold: 500,
    receiveAlerts: true,
  },
  monitoring: {
    dataCollectionInterval: 15,
    storeHistoricalData: true,
    dataRetentionPeriod: 365,
  },
  account: {
    companyName: 'Example Company',
    contactPerson: 'John Doe',
    phoneNumber: '+1 (555) 123-4567',
    address: '123 Main St, City, Country',
  },
};

export function SettingsForm() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (section: keyof Settings, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setIsDirty(true);
  };

  const handleSave = () => {
    // Here you would typically make an API call to save the settings
    console.log('Saving settings:', settings);
    setIsDirty(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>System Settings</CardTitle>
          {isDirty && (
            <Button onClick={handleSave}>Save Changes</Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Dashboard Refresh Interval (minutes)</Label>
                <Input
                  type="number"
                  value={settings.dashboard.refreshInterval}
                  onChange={(e) =>
                    handleChange('dashboard', 'refreshInterval', parseInt(e.target.value))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show Energy Costs</Label>
                <Switch
                  checked={settings.dashboard.showEnergyCosts}
                  onCheckedChange={(checked) =>
                    handleChange('dashboard', 'showEnergyCosts', checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show Carbon Emissions</Label>
                <Switch
                  checked={settings.dashboard.showCarbonEmissions}
                  onCheckedChange={(checked) =>
                    handleChange('dashboard', 'showCarbonEmissions', checked)
                  }
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="notifications">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Notification Email</Label>
                <Input
                  type="email"
                  value={settings.notifications.email}
                  onChange={(e) =>
                    handleChange('notifications', 'email', e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>High Consumption Threshold (kWh)</Label>
                <Input
                  type="number"
                  value={settings.notifications.highConsumptionThreshold}
                  onChange={(e) =>
                    handleChange(
                      'notifications',
                      'highConsumptionThreshold',
                      parseInt(e.target.value)
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Peak Demand Threshold (kW)</Label>
                <Input
                  type="number"
                  value={settings.notifications.peakDemandThreshold}
                  onChange={(e) =>
                    handleChange(
                      'notifications',
                      'peakDemandThreshold',
                      parseInt(e.target.value)
                    )
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Receive Email Alerts</Label>
                <Switch
                  checked={settings.notifications.receiveAlerts}
                  onCheckedChange={(checked) =>
                    handleChange('notifications', 'receiveAlerts', checked)
                  }
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="monitoring">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Data Collection Interval (minutes)</Label>
                <Input
                  type="number"
                  value={settings.monitoring.dataCollectionInterval}
                  onChange={(e) =>
                    handleChange(
                      'monitoring',
                      'dataCollectionInterval',
                      parseInt(e.target.value)
                    )
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Store Historical Data</Label>
                <Switch
                  checked={settings.monitoring.storeHistoricalData}
                  onCheckedChange={(checked) =>
                    handleChange('monitoring', 'storeHistoricalData', checked)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Data Retention Period (days)</Label>
                <Input
                  type="number"
                  value={settings.monitoring.dataRetentionPeriod}
                  onChange={(e) =>
                    handleChange(
                      'monitoring',
                      'dataRetentionPeriod',
                      parseInt(e.target.value)
                    )
                  }
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="account">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input
                  value={settings.account.companyName}
                  onChange={(e) =>
                    handleChange('account', 'companyName', e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input
                  value={settings.account.contactPerson}
                  onChange={(e) =>
                    handleChange('account', 'contactPerson', e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  value={settings.account.phoneNumber}
                  onChange={(e) =>
                    handleChange('account', 'phoneNumber', e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={settings.account.address}
                  onChange={(e) =>
                    handleChange('account', 'address', e.target.value)
                  }
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 