'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Device } from '@/lib/firebase/firestore/types';
import { DeviceService } from '@/lib/firebase/firestore/device-service';

interface DeviceConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device?: Device;
  onSuccess?: () => void;
}

const deviceTypes = [
  { value: 'sensor', label: 'Sensor' },
  { value: 'controller', label: 'Controller' },
  { value: 'monitor', label: 'Monitor' },
  { value: 'gateway', label: 'Gateway' },
  { value: 'battery', label: 'Battery' },
  { value: 'inverter', label: 'Inverter' },
  { value: 'charger', label: 'Charger' },
];

export function DeviceConfigModal({ open, onOpenChange, device, onSuccess }: DeviceConfigModalProps) {
  const [name, setName] = useState(device?.name || '');
  const [type, setType] = useState(device?.type || '');
  const [location, setLocation] = useState(device?.location || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deviceService = new DeviceService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const deviceData = {
        name,
        type,
        location,
        status: 'offline',
        lastUpdated: new Date(),
      };

      if (device) {
        // Update existing device
        await deviceService.updateDevice(device.id, deviceData);
      } else {
        // Create new device
        await deviceService.createDevice(deviceData);
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{device ? 'Edit Device' : 'Add New Device'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Device Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter device name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Device Type</Label>
            <Select value={type} onValueChange={setType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select device type" />
              </SelectTrigger>
              <SelectContent>
                {deviceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter device location"
            />
          </div>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : device ? 'Save Changes' : 'Add Device'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 