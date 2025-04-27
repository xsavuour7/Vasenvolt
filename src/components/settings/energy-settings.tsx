'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Zap, Clock, Shield, Database, Mail } from 'lucide-react';

const notificationSettings = [
  {
    id: 1,
    title: 'High Energy Consumption',
    description: 'Receive alerts when energy usage exceeds threshold',
    icon: Bell,
    enabled: true,
  },
  {
    id: 2,
    title: 'Peak Hours',
    description: 'Get notified during peak energy pricing hours',
    icon: Clock,
    enabled: true,
  },
  {
    id: 3,
    title: 'System Updates',
    description: 'Receive notifications about system updates and maintenance',
    icon: Shield,
    enabled: true,
  },
];

const dataSettings = [
  {
    id: 1,
    title: 'Data Retention',
    description: 'How long to keep historical data',
    options: ['30 days', '90 days', '1 year', 'Indefinitely'],
    value: '90 days',
  },
  {
    id: 2,
    title: 'Data Export Format',
    description: 'Preferred format for data exports',
    options: ['CSV', 'JSON', 'Excel', 'PDF'],
    value: 'CSV',
  },
  {
    id: 3,
    title: 'Backup Frequency',
    description: 'How often to backup system data',
    options: ['Daily', 'Weekly', 'Monthly'],
    value: 'Weekly',
  },
];

export function EnergySettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <Button>Save Changes</Button>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
          <TabsTrigger value="system">System Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {notificationSettings.map((setting) => {
              const Icon = setting.icon;
              return (
                <Card key={setting.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-lg">{setting.title}</CardTitle>
                      </div>
                      <Switch defaultChecked={setting.enabled} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {setting.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dataSettings.map((setting) => (
              <Card key={setting.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{setting.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {setting.description}
                  </p>
                  <Select defaultValue={setting.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {setting.options.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Energy Unit</Label>
                <Select defaultValue="kWh">
                  <SelectTrigger>
                    <SelectValue placeholder="Select energy unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kWh">kWh</SelectItem>
                    <SelectItem value="MWh">MWh</SelectItem>
                    <SelectItem value="GJ">GJ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                <Select defaultValue="USD">
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Time Zone</Label>
                <Select defaultValue="UTC">
                  <SelectTrigger>
                    <SelectValue placeholder="Select time zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="EST">EST</SelectItem>
                    <SelectItem value="PST">PST</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Email Notifications</Label>
                <Input type="email" placeholder="Enter email address" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 