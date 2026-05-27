export default function Meters() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Meters</h1>
        <p className="mt-2 text-muted-foreground">
          Manage and monitor your energy meters
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-card-foreground">Meter Management</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Meter management features will be available here. You'll be able to view, add, edit, and monitor your energy meters.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-card-foreground">Active Meters</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            View all active meters and their current status
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-card-foreground">Meter Readings</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Historical and real-time meter readings
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-card-foreground">Meter Configuration</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Configure meter settings and parameters
          </p>
        </div>
      </div>
    </div>
  )
}

