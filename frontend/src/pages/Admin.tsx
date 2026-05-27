import { useAuth } from '../contexts/AuthContext'

export default function Admin() {
  const { user } = useAuth()

  if (!user?.is_admin) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
          <h3 className="text-lg font-semibold text-destructive">Access Denied</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            You do not have administrator privileges to access this page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin</h1>
        <p className="mt-2 text-muted-foreground">
          Administrative controls and system management
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-card-foreground">Administration Panel</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Administrative features will be available here. You'll be able to manage users, system settings, and monitor system health.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-card-foreground">User Management</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-card-foreground">System Settings</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Configure system-wide settings and preferences
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-card-foreground">System Health</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Monitor system performance and health metrics
          </p>
        </div>
      </div>
    </div>
  )
}

