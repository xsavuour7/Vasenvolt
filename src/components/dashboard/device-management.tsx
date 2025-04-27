'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Settings, Power } from 'lucide-react';
import { DeviceService } from '@/lib/firebase/firestore/device-service';
import { Device } from '@/lib/firebase/firestore/types';
import { DeviceConfigModal } from './device-config-modal';

export function DeviceManagement() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | undefined>();
  const deviceService = new DeviceService();

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const deviceList = await deviceService.getDevices();
      setDevices(deviceList);
    } catch (error) {
      console.error('Error loading devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = () => {
    setSelectedDevice(undefined);
    setIsModalOpen(true);
  };

  const handleEditDevice = (device: Device) => {
    setSelectedDevice(device);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    loadDevices();
  };

  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Device Management</CardTitle>
            <p className="text-sm text-muted-foreground">
              Monitor and control your connected devices
            </p>
          </div>
          <Button onClick={handleAddDevice}>
            <Plus className="mr-2 h-4 w-4" />
            Add Device
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search devices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">Loading devices...</p>
            </div>
          ) : filteredDevices.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">No devices found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredDevices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className={`rounded-full p-2 ${
                      device.status === 'online' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      <Power className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">{device.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {device.type} • {device.status}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditDevice(device)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={device.status === 'online' ? 'default' : 'outline'}
                      size="sm"
                    >
                      {device.status === 'online' ? 'Turn Off' : 'Turn On'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DeviceConfigModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        device={selectedDevice}
        onSuccess={handleModalSuccess}
      />
    </>
  );
} 