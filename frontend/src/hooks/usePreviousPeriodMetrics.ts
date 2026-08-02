import { useQuery } from '@tanstack/react-query'
import { metricsApi, type MetricsQueryParams, type MetricsResponse, type MetricsDataPoint } from '../api/metrics'
import { getPreviousPeriodRange } from '../utils/metricsCalculations'

interface UsePreviousPeriodMetricsParams {
  meter_id?: number | null
  site_id?: number | null
  range: string
  startTime: string
  endTime: string
  enabled?: boolean
}

/**
 * Calculate double range for fetching previous period data
 * e.g., '24h' -> '48h', '7d' -> '14d', '30d' -> '60d'
 */
function getDoubleRange(range: string): string {
  const match = range.match(/^(\d+)([hdm])$/i)
  if (!match) return range
  
  const [, value, unit] = match
  const doubleValue = parseInt(value, 10) * 2
  return `${doubleValue}${unit.toLowerCase()}`
}

/**
 * Filter data points to get only the previous period
 * Since data is aggregated into time buckets, we filter points that fall
 * before the current period start time
 */
function filterPreviousPeriodData(
  data: MetricsDataPoint[],
  currentStartTime: string,
): MetricsDataPoint[] {
  const currentStart = new Date(currentStartTime).getTime()

  // Filter points that are strictly before the current period start
  // This handles aggregated time buckets that might not align exactly
  return data.filter(point => {
    const pointTime = new Date(point.timestamp).getTime()
    return pointTime < currentStart
  })
}

/**
 * Custom hook to fetch metrics for the previous period (same duration before current period)
 * Used for period-over-period comparison in KPI cards
 * 
 * Note: Since the API only supports range strings (not custom start/end times),
 * we fetch double the range and filter to get the previous period data
 */
export function usePreviousPeriodMetrics(params: UsePreviousPeriodMetricsParams) {
  const { meter_id, site_id, range, startTime, endTime, enabled = true } = params

  // Calculate previous period time range (for reference)
  const previousRange = getPreviousPeriodRange(range, startTime, endTime)

  // Determine if query should be enabled
  const hasFilter = (meter_id !== null && meter_id !== undefined) || (site_id !== null && site_id !== undefined)
  const isEnabled = enabled && hasFilter && range !== undefined && range !== ''

  // Fetch double the range to get both current and previous period data
  const doubleRange = getDoubleRange(range)

  const queryParams: MetricsQueryParams = {
    meter_id: meter_id ?? null,
    site_id: site_id ?? null,
    range: doubleRange, // Fetch 2x range to get previous period data
  }

  const query = useQuery<MetricsResponse, Error>({
    queryKey: ['metrics', 'previous', meter_id, site_id, range, startTime, endTime],
    queryFn: async () => {
      const response = await metricsApi.getMetrics(queryParams)
      
      // Filter to get only the previous period data
      const previousPeriodData = filterPreviousPeriodData(response.data, startTime)
      
      // Return a modified response with only previous period data
      return {
        ...response,
        data: previousPeriodData,
        total_points: previousPeriodData.length,
        range: `${range} (previous)`, // Mark as previous period
        start_time: previousRange.start,
        end_time: previousRange.end,
      }
    },
    enabled: isEnabled,
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  })

  const errorMessage = query.error
    ? query.error instanceof Error
      ? query.error.message
      : 'An error occurred while fetching previous period metrics'
    : null

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: errorMessage,
    refetch: query.refetch,
  }
}
