import type { MetricsDataPoint } from '../api/metrics'

/**
 * Calculate total kWh consumption from metrics data points
 */
export function calculateTotalKWh(data: MetricsDataPoint[]): number {
  if (!data || data.length === 0) return 0
  
  return data.reduce((sum, point) => {
    const kwh = point.kwh ?? 0
    return sum + kwh
  }, 0)
}

/**
 * Calculate average load (power) from metrics data points
 * Uses power field if available, otherwise calculates from voltage * current
 */
export function calculateAverageLoad(data: MetricsDataPoint[]): number {
  if (!data || data.length === 0) return 0
  
  const validPoints = data.filter(point => {
    // Use power if available, otherwise calculate from voltage * current
    return point.power !== null && point.power !== undefined
      ? true
      : (point.voltage !== null && point.voltage !== undefined && 
         point.current !== null && point.current !== undefined)
  })
  
  if (validPoints.length === 0) return 0
  
  const totalLoad = validPoints.reduce((sum, point) => {
    if (point.power !== null && point.power !== undefined) {
      return sum + point.power
    } else if (
      point.voltage !== null && point.voltage !== undefined &&
      point.current !== null && point.current !== undefined
    ) {
      // Calculate power from voltage * current
      return sum + (point.voltage * point.current)
    }
    return sum
  }, 0)
  
  return totalLoad / validPoints.length
}

/**
 * Calculate peak usage (maximum kWh value) from metrics data points
 */
export function calculatePeakUsage(data: MetricsDataPoint[]): number {
  if (!data || data.length === 0) return 0
  
  const kwhValues = data
    .map(point => point.kwh ?? 0)
    .filter(kwh => kwh > 0)
  
  if (kwhValues.length === 0) return 0
  
  return Math.max(...kwhValues)
}

/**
 * Calculate previous period time range based on current period
 * Returns the same duration period immediately before the current period
 */
export function getPreviousPeriodRange(
  _range: string,
  startTime: string,
  endTime: string
): { start: string; end: string } {
  const start = new Date(startTime)
  const end = new Date(endTime)
  const duration = end.getTime() - start.getTime()
  
  // Calculate previous period: shift back by the duration
  const previousEnd = new Date(start.getTime() - 1) // 1ms before current start
  const previousStart = new Date(previousEnd.getTime() - duration)
  
  return {
    start: previousStart.toISOString(),
    end: previousEnd.toISOString(),
  }
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    // If previous is 0, return 100% if current > 0, else 0%
    return current > 0 ? 100 : 0
  }
  
  return ((current - previous) / previous) * 100
}


