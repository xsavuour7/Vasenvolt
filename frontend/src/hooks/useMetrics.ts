import { useQuery } from '@tanstack/react-query'
import { metricsApi, type MetricsQueryParams, type MetricsResponse } from '../api/metrics'

interface UseMetricsParams {
  meter_id?: number | null
  site_id?: number | null
  range: string
  aggregation?: string
  fields?: string
  page?: number
  page_size?: number
}

/**
 * Custom React Query hook for fetching metrics data
 */
export function useMetrics(params: UseMetricsParams) {
  const { meter_id, site_id, range, aggregation, fields, page, page_size } = params

  // Determine if query should be enabled
  // Query is enabled when at least one filter (meter_id or site_id) is provided AND range is provided
  const hasFilter = (meter_id !== null && meter_id !== undefined) || (site_id !== null && site_id !== undefined)
  const hasRange = range !== undefined && range !== ''
  const isEnabled = hasFilter && hasRange

  const queryParams: MetricsQueryParams = {
    meter_id: meter_id ?? null,
    site_id: site_id ?? null,
    range,
    aggregation,
    fields,
    page,
    page_size,
  }

  const query = useQuery<MetricsResponse, Error>({
    queryKey: ['metrics', meter_id, site_id, range, aggregation, fields, page, page_size],
    queryFn: () => metricsApi.getMetrics(queryParams),
    enabled: isEnabled,
    staleTime: 30 * 1000, // 30 seconds - for live data updates
    refetchInterval: 60 * 1000, // 60 seconds - auto-refresh
    retry: 2,
  })

  // Transform error to user-friendly message
  const errorMessage = query.error
    ? query.error instanceof Error
      ? query.error.message
      : 'An error occurred while fetching metrics data'
    : null

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: errorMessage,
    refetch: query.refetch,
  }
}

