import type { AnomalyItem } from '../api/anomalies'

interface AnomalyDetailModalProps {
  anomaly: AnomalyItem | null
  isOpen: boolean
  onClose: () => void
}

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export default function AnomalyDetailModal({
  anomaly,
  isOpen,
  onClose,
}: AnomalyDetailModalProps) {
  if (!isOpen || !anomaly) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Anomaly details"
    >
      <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">Anomaly Details</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Review the telemetry deviation event for this reading.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-accent"
          >
            Close
          </button>
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <div>
            <dt className="font-medium text-muted-foreground">Timestamp</dt>
            <dd className="text-foreground">{formatTimestamp(anomaly.timestamp)}</dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">Meter</dt>
            <dd className="text-foreground">
              {anomaly.meter_name || `Meter ${anomaly.meter_id}`}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">Site</dt>
            <dd className="text-foreground">
              {anomaly.site_name || `Site ${anomaly.site_id}`}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">Current kWh</dt>
            <dd className="text-foreground">{anomaly.kwh.toFixed(2)} kWh</dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">Previous kWh</dt>
            <dd className="text-foreground">{anomaly.previous_kwh.toFixed(2)} kWh</dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">Deviation</dt>
            <dd className="text-destructive">{anomaly.deviation_percent.toFixed(1)}%</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
