import { apiClient } from './client'

export interface AnomalyItem {
  timestamp: string
  meter_id: number
  meter_name?: string | null
  site_id: number
  site_name?: string | null
  kwh: number
  previous_kwh: number
  deviation_percent: number
}

export interface AnomalyQueryParams {
  meter_id?: number | null
  site_id?: number | null
  range: string
  limit?: number
}

function validateRange(range: string): boolean {
  return /^\d+[hdm]$/i.test(range)
}

function buildQueryString(params: AnomalyQueryParams): string {
  const queryParams = new URLSearchParams()

  if (params.meter_id !== null && params.meter_id !== undefined) {
    queryParams.append('meter_id', params.meter_id.toString())
  }

  if (params.site_id !== null && params.site_id !== undefined) {
    queryParams.append('site_id', params.site_id.toString())
  }

  queryParams.append('range', params.range)

  if (params.limit !== undefined) {
    queryParams.append('limit', params.limit.toString())
  }

  return queryParams.toString()
}

export const anomaliesApi = {
  async getAnomalies(params: AnomalyQueryParams): Promise<AnomalyItem[]> {
    if (!validateRange(params.range)) {
      throw new Error(
        `Invalid range format: ${params.range}. Expected format: '24h', '7d', '30d', etc.`
      )
    }

    if (
      (params.meter_id === null || params.meter_id === undefined) &&
      (params.site_id === null || params.site_id === undefined)
    ) {
      throw new Error('At least one of meter_id or site_id must be provided')
    }

    const queryString = buildQueryString(params)
    return apiClient.get<AnomalyItem[]>(`/api/telemetry/anomalies?${queryString}`)
  },
}
