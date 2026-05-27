import { useState } from 'react'
import type { AnomalyItem } from '../api/anomalies'
import { useAnomalies } from '../hooks/useAnomalies'
import AnomalyDetailModal from './AnomalyDetailModal'

interface AnomalyPreviewCardProps {
  meterId: number | null
  siteId?: number | null
  timeRange: string
}

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export default function AnomalyPreviewCard({
  meterId,
  siteId,
  timeRange,
}: AnomalyPreviewCardProps) {
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyItem | null>(null)
  const { data, isLoading, error, refetch } = useAnomalies({
    meter_id: meterId,
    site_id: siteId,
    range: timeRange,
    limit: 5,
  })

  return (
    <>
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">Recent Anomalies</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Readings with more than 20% deviation from the previous point.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-accent"
          >
            Refresh
          </button>
        </div>

        {isLoading && (
          <div className="mt-6 text-sm text-muted-foreground">Loading anomalies...</div>
        )}

        {!isLoading && error && (
          <div className="mt-6 rounded-md border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {!isLoading && !error && data.length === 0 && (
          <div className="mt-6 text-sm text-muted-foreground">
            No anomalies detected in the selected time range.
          </div>
        )}

        {!isLoading && !error && data.length > 0 && (
          <div className="mt-6 space-y-3">
            {data.slice(0, 5).map((anomaly) => (
              <button
                key={`${anomaly.meter_id}-${anomaly.timestamp}`}
                type="button"
                onClick={() => setSelectedAnomaly(anomaly)}
                className="flex w-full items-center justify-between rounded-md border border-border px-4 py-3 text-left hover:bg-accent"
              >
                <div>
                  <div className="font-medium text-foreground">
                    {anomaly.meter_name || `Meter ${anomaly.meter_id}`}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {formatTimestamp(anomaly.timestamp)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-destructive">
                    {anomaly.deviation_percent.toFixed(1)}%
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {anomaly.kwh.toFixed(2)} vs {anomaly.previous_kwh.toFixed(2)} kWh
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <AnomalyDetailModal
        anomaly={selectedAnomaly}
        isOpen={selectedAnomaly !== null}
        onClose={() => setSelectedAnomaly(null)}
      />
    </>
  )
}
