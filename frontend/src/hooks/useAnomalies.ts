import { useQuery } from '@tanstack/react-query'
import { anomaliesApi, type AnomalyItem, type AnomalyQueryParams } from '../api/anomalies'

interface UseAnomaliesParams {
  meter_id?: number | null
  site_id?: number | null
  range: string
  limit?: number
}

export function useAnomalies(params: UseAnomaliesParams) {
  const { meter_id, site_id, range, limit = 5 } = params

  const hasFilter =
    (meter_id !== null && meter_id !== undefined) ||
    (site_id !== null && site_id !== undefined)
  const hasRange = range !== undefined && range !== ''

  const queryParams: AnomalyQueryParams = {
    meter_id: meter_id ?? null,
    site_id: site_id ?? null,
    range,
    limit,
  }

  const query = useQuery<AnomalyItem[], Error>({
    queryKey: ['anomalies', meter_id, site_id, range, limit],
    queryFn: () => anomaliesApi.getAnomalies(queryParams),
    enabled: hasFilter && hasRange,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    retry: 2,
  })

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  }
}
