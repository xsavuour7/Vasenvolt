import { useMetrics } from '../hooks/useMetrics'
import { usePreviousPeriodMetrics } from '../hooks/usePreviousPeriodMetrics'
import {
  calculateTotalKWh,
  calculateAverageLoad,
  calculatePeakUsage,
} from '../utils/metricsCalculations'
import KPICard from './KPICard'

interface KPICardsProps {
  meterId: number | null
  siteId?: number | null
  timeRange: string
}

/**
 * Container component that displays three KPI cards:
 * - Total kWh
 * - Average Load
 * - Peak Usage
 */
export default function KPICards({ meterId, siteId, timeRange }: KPICardsProps) {
  // Fetch current period metrics
  const {
    data: currentMetrics,
    isLoading: currentLoading,
    error: currentError,
  } = useMetrics({
    meter_id: meterId,
    site_id: siteId,
    range: timeRange,
  })

  // Fetch previous period metrics
  const {
    data: previousMetrics,
    isLoading: previousLoading,
    error: previousError,
  } = usePreviousPeriodMetrics({
    meter_id: meterId,
    site_id: siteId,
    range: timeRange,
    startTime: currentMetrics?.start_time || '',
    endTime: currentMetrics?.end_time || '',
    enabled: !!currentMetrics && !!meterId,
  })

  const isLoading = currentLoading || previousLoading
  const hasError = currentError || previousError

  // Calculate KPI values for current period
  const currentTotalKWh = currentMetrics
    ? calculateTotalKWh(currentMetrics.data)
    : 0
  const currentAvgLoad = currentMetrics
    ? calculateAverageLoad(currentMetrics.data)
    : 0
  const currentPeakUsage = currentMetrics
    ? calculatePeakUsage(currentMetrics.data)
    : 0

  // Calculate KPI values for previous period
  const previousTotalKWh = previousMetrics
    ? calculateTotalKWh(previousMetrics.data)
    : null
  const previousAvgLoad = previousMetrics
    ? calculateAverageLoad(previousMetrics.data)
    : null
  const previousPeakUsage = previousMetrics
    ? calculatePeakUsage(previousMetrics.data)
    : null

  // Loading state
  if (isLoading && !currentMetrics) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-card p-6 shadow-sm"
          >
            <div className="h-8 w-32 animate-pulse rounded bg-muted"></div>
            <div className="mt-4 h-12 w-24 animate-pulse rounded bg-muted"></div>
          </div>
        ))}
      </div>
    )
  }

  // Error state
  if (hasError && !currentMetrics) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6 shadow-sm">
        <p className="text-sm text-destructive">
          {currentError || previousError || 'Error loading KPI data'}
        </p>
      </div>
    )
  }

  // No data state
  if (!currentMetrics || currentMetrics.data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground text-center">
          No metrics data available for the selected time range
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <KPICard
        title="Total kWh"
        currentValue={currentTotalKWh}
        previousValue={previousTotalKWh}
        unit="kWh"
        formatValue={(val) => val.toFixed(2)}
        isIncreaseGood={false} // Increase in consumption is bad
      />
      <KPICard
        title="Average Load"
        currentValue={currentAvgLoad}
        previousValue={previousAvgLoad}
        unit="W"
        formatValue={(val) => val.toFixed(2)}
        isIncreaseGood={false} // Increase in load is bad
      />
      <KPICard
        title="Peak Usage"
        currentValue={currentPeakUsage}
        previousValue={previousPeakUsage}
        unit="kWh"
        formatValue={(val) => val.toFixed(2)}
        isIncreaseGood={false} // Increase in peak usage is bad
      />
    </div>
  )
}


