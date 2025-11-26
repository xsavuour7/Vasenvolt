import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { MetricsResponse, MetricsQueryParams } from '@/types/metrics';
import { metricsApi } from '@/api/metrics';

/**
 * React Query hook for fetching metrics data
 * @param params Metrics query parameters
 * @param enabled Whether the query should run (default: true)
 * @returns React Query result with metrics data
 */
export function useMetrics(
  params: MetricsQueryParams,
  enabled: boolean = true
): UseQueryResult<MetricsResponse, Error> {
  return useQuery({
    queryKey: ['metrics', params],
    queryFn: () => metricsApi.getMetrics(params),
    enabled: enabled && (params.meter_id !== undefined || params.site_id !== undefined),
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchInterval: 60000, // Refetch every minute for live data
  });
}

/**
 * Hook for fetching metrics by meter ID
 */
export function useMetricsByMeter(
  meterId: number | undefined,
  range: string = '24h',
  enabled: boolean = true
): UseQueryResult<MetricsResponse, Error> {
  return useMetrics(
    {
      meter_id: meterId,
      range,
    },
    enabled && meterId !== undefined
  );
}

/**
 * Hook for fetching metrics by site ID
 */
export function useMetricsBySite(
  siteId: number | undefined,
  range: string = '24h',
  enabled: boolean = true
): UseQueryResult<MetricsResponse, Error> {
  return useMetrics(
    {
      site_id: siteId,
      range,
    },
    enabled && siteId !== undefined
  );
}

