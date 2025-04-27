'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  AlertTriangle, 
  FileText, 
  Settings, 
  Zap, 
  Wrench, 
  Shield,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { 
  Notification, 
  NotificationType,
  NotificationStatus 
} from '@/lib/firebase/firestore/notifications-types';
import { NotificationsService } from '@/lib/firebase/firestore/notifications-service';
import { useAuth } from '@/lib/firebase/auth/context';

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<NotificationType | 'all'>('all');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const unsubscribe = NotificationsService.onNotificationsUpdate(
      user.uid,
      (updatedNotifications) => {
        setNotifications(updatedNotifications);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await NotificationsService.markAsRead(notificationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await NotificationsService.deleteNotification(notificationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="h-4 w-4" />;
      case 'report':
        return <FileText className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      case 'device':
        return <Zap className="h-4 w-4" />;
      case 'energy':
        return <Zap className="h-4 w-4" />;
      case 'maintenance':
        return <Wrench className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: NotificationStatus) => {
    switch (status) {
      case 'unread':
        return 'bg-blue-100 text-blue-800';
      case 'read':
        return 'bg-gray-100 text-gray-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNotifications = notifications.filter(
    notification => activeTab === 'all' || notification.type === activeTab
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
            Loading notifications...
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
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </div>
          <Badge variant="outline">
            {filteredNotifications.length} {filteredNotifications.length === 1 ? 'notification' : 'notifications'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" onValueChange={(value) => setActiveTab(value as NotificationType | 'all')}>
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="alert">Alerts</TabsTrigger>
            <TabsTrigger value="device">Devices</TabsTrigger>
            <TabsTrigger value="energy">Energy</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="report">Reports</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="flex items-center justify-center text-muted-foreground py-8">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                No notifications
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${getStatusColor(notification.status)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div>
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {new Date(notification.metadata.createdAt.toDate()).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {notification.status === 'unread' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(notification.id)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
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