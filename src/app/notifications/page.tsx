'use client';

import { withAuth } from '@/lib/firebase/auth/withAuth';
import { NotificationCenter } from '@/components/notifications/notification-center';
import { AlertCenter } from '@/components/notifications/alert-center';
import { NotificationSettings } from '@/components/notifications/notification-settings';

function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">
          View and manage your system notifications and alerts
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <AlertCenter />
        <NotificationCenter />
      </div>
      <NotificationSettings />
    </div>
  );
}

export default withAuth(NotificationsPage); 