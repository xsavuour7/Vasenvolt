'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit2, Cpu } from 'lucide-react';
import { DeviceGroup, GroupType, BaseGroup, LocationGroup, FunctionGroup, SystemGroup, CustomGroup } from '@/lib/firebase/firestore/device-groups-types';
import { DeviceGroupsService } from '@/lib/firebase/firestore/device-groups-service';
import { Device } from '@/lib/firebase/firestore/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

type NewGroup = Omit<BaseGroup, 'id' | 'metadata'>;

export function DeviceGroups() {
  const [groups, setGroups] = useState<DeviceGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [newGroup, setNewGroup] = useState<NewGroup>({
    userId: 'current-user-id',
    name: '',
    type: 'custom',
    description: '',
    deviceIds: [],
    status: 'active'
  });
  const [editingGroup, setEditingGroup] = useState<DeviceGroup | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const userGroups = await DeviceGroupsService.getGroupsByUser('current-user-id');
      setGroups(userGroups);
    } catch (error) {
      console.error('Error loading device groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name) return;
    
    setLoading(true);
    try {
      const groupToCreate = {
        ...newGroup,
        ...(newGroup.type === 'location' && {
          location: {
            building: '',
            floor: '',
            room: '',
            coordinates: {
              latitude: 0,
              longitude: 0
            }
          }
        }),
        ...(newGroup.type === 'function' && {
          function: {
            category: '',
            subcategory: '',
            purpose: ''
          }
        }),
        ...(newGroup.type === 'system' && {
          system: {
            type: '',
            subsystem: '',
            dependencies: []
          }
        }),
        ...(newGroup.type === 'custom' && {
          custom: {
            attributes: {}
          }
        })
      };

      await DeviceGroupsService.createGroup(groupToCreate);
      setNewGroup({
        userId: 'current-user-id',
        name: '',
        type: 'custom',
        description: '',
        deviceIds: [],
        status: 'active'
      });
      await loadGroups();
    } catch (error) {
      console.error('Error creating device group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    setLoading(true);
    try {
      await DeviceGroupsService.deleteGroup(groupId);
      await loadGroups();
    } catch (error) {
      console.error('Error deleting device group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditGroup = async () => {
    if (!editingGroup) return;
    
    setLoading(true);
    try {
      const groupToUpdate = {
        name: editingGroup.name,
        type: editingGroup.type,
        description: editingGroup.description,
        deviceIds: editingGroup.deviceIds,
        status: editingGroup.status,
        ...(editingGroup.type === 'location' && {
          location: editingGroup.location
        }),
        ...(editingGroup.type === 'function' && {
          function: editingGroup.function
        }),
        ...(editingGroup.type === 'system' && {
          system: editingGroup.system
        }),
        ...(editingGroup.type === 'custom' && {
          custom: editingGroup.custom
        })
      };

      await DeviceGroupsService.updateGroup(editingGroup.id, groupToUpdate);
      setIsEditModalOpen(false);
      await loadGroups();
    } catch (error) {
      console.error('Error updating device group:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGroupTypeColor = (type: GroupType) => {
    switch (type) {
      case 'location':
        return 'bg-blue-100 text-blue-800';
      case 'function':
        return 'bg-green-100 text-green-800';
      case 'system':
        return 'bg-purple-100 text-purple-800';
      case 'custom':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderTypeSpecificFields = (group: DeviceGroup) => {
    switch (group.type) {
      case 'location':
        return (
          <div className="space-y-2">
            <Label>Building</Label>
            <Input
              value={group.location.building}
              onChange={(e) => setEditingGroup({
                ...group,
                location: { ...group.location, building: e.target.value }
              })}
            />
            <Label>Floor</Label>
            <Input
              value={group.location.floor}
              onChange={(e) => setEditingGroup({
                ...group,
                location: { ...group.location, floor: e.target.value }
              })}
            />
            <Label>Room</Label>
            <Input
              value={group.location.room}
              onChange={(e) => setEditingGroup({
                ...group,
                location: { ...group.location, room: e.target.value }
              })}
            />
          </div>
        );
      case 'function':
        return (
          <div className="space-y-2">
            <Label>Category</Label>
            <Input
              value={group.function.category}
              onChange={(e) => setEditingGroup({
                ...group,
                function: { ...group.function, category: e.target.value }
              })}
            />
            <Label>Subcategory</Label>
            <Input
              value={group.function.subcategory}
              onChange={(e) => setEditingGroup({
                ...group,
                function: { ...group.function, subcategory: e.target.value }
              })}
            />
            <Label>Purpose</Label>
            <Input
              value={group.function.purpose}
              onChange={(e) => setEditingGroup({
                ...group,
                function: { ...group.function, purpose: e.target.value }
              })}
            />
          </div>
        );
      case 'system':
        return (
          <div className="space-y-2">
            <Label>System Type</Label>
            <Input
              value={group.system.type}
              onChange={(e) => setEditingGroup({
                ...group,
                system: { ...group.system, type: e.target.value }
              })}
            />
            <Label>Subsystem</Label>
            <Input
              value={group.system.subsystem}
              onChange={(e) => setEditingGroup({
                ...group,
                system: { ...group.system, subsystem: e.target.value }
              })}
            />
          </div>
        );
      case 'custom':
        return (
          <div className="space-y-2">
            <Label>Custom Attributes</Label>
            <Input
              value={JSON.stringify(group.custom.attributes)}
              onChange={(e) => setEditingGroup({
                ...group,
                custom: { attributes: JSON.parse(e.target.value) }
              })}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Group</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Group Name</Label>
              <Input
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                placeholder="Enter group name"
              />
            </div>
            <div className="space-y-2">
              <Label>Group Type</Label>
              <Select
                value={newGroup.type}
                onValueChange={(value) => setNewGroup({ ...newGroup, type: value as GroupType })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select group type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="location">Location</SelectItem>
                  <SelectItem value="function">Function</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                placeholder="Enter group description"
              />
            </div>
            <Button onClick={handleCreateGroup} disabled={loading || !newGroup.name}>
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Card key={group.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{group.name}</CardTitle>
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    setEditingGroup(group);
                    setIsEditModalOpen(true);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteGroup(group.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge className={getGroupTypeColor(group.type)}>
                    {group.type}
                  </Badge>
                  <Badge variant="outline">
                    {group.deviceIds.length} devices
                  </Badge>
                </div>
                {group.description && (
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                )}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Cpu className="h-4 w-4" />
                  <span>Last updated: {new Date(group.metadata.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
          </DialogHeader>
          {editingGroup && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Group Name</Label>
                <Input
                  value={editingGroup.name}
                  onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Group Type</Label>
                <Select
                  value={editingGroup.type}
                  onValueChange={(value) => {
                    const newType = value as GroupType;
                    const baseGroup = {
                      ...editingGroup,
                      type: newType,
                      name: editingGroup.name,
                      description: editingGroup.description,
                      deviceIds: editingGroup.deviceIds,
                      status: editingGroup.status
                    };

                    switch (newType) {
                      case 'location':
                        setEditingGroup({
                          ...baseGroup,
                          location: {
                            building: '',
                            floor: '',
                            room: '',
                            coordinates: {
                              latitude: 0,
                              longitude: 0
                            }
                          }
                        } as LocationGroup);
                        break;
                      case 'function':
                        setEditingGroup({
                          ...baseGroup,
                          function: {
                            category: '',
                            subcategory: '',
                            purpose: ''
                          }
                        } as FunctionGroup);
                        break;
                      case 'system':
                        setEditingGroup({
                          ...baseGroup,
                          system: {
                            type: '',
                            subsystem: '',
                            dependencies: []
                          }
                        } as SystemGroup);
                        break;
                      case 'custom':
                        setEditingGroup({
                          ...baseGroup,
                          custom: {
                            attributes: {}
                          }
                        } as CustomGroup);
                        break;
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select group type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="location">Location</SelectItem>
                    <SelectItem value="function">Function</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={editingGroup.description}
                  onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
                />
              </div>
              {renderTypeSpecificFields(editingGroup)}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditGroup} disabled={loading}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 