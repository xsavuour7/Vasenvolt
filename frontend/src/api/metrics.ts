import { apiClient } from './client'

export interface MetricsDataPoint {
  timestamp: string
  kwh?: number | null
  voltage?: number | null
  current?: number | null
  power_factor?: number | null
  power?: number | null
}

export interface MetricsResponse {
  meter_id: number | null
  site_id: number | null
  range: string
  start_time: string
  end_time: string
  aggregations: Record<string, string>
  data: MetricsDataPoint[]
  total_points: number
  page: number
  page_size: number
  has_more: boolean
}

export interface MetricsQueryParams {
  meter_id?: number | null
  site_id?: number | null
  range: string
  aggregation?: string
  fields?: string
  page?: number
  page_size?: number
}

/**
 * Validates the range format (e.g., '24h', '7d', '30d')
 */
function validateRange(range: string): boolean {
  const rangePattern = /^\d+[hdm]$/i
  return rangePattern.test(range)
}

/**
 * Builds query string from parameters, handling optional values
 */
function buildQueryString(params: MetricsQueryParams): string {
  const queryParams = new URLSearchParams()

  if (params.meter_id !== null && params.meter_id !== undefined) {
    queryParams.append('meter_id', params.meter_id.toString())
  }

  if (params.site_id !== null && params.site_id !== undefined) {
    queryParams.append('site_id', params.site_id.toString())
  }

  queryParams.append('range', params.range)

  if (params.aggregation) {
    queryParams.append('aggregation', params.aggregation)
  }

  if (params.fields) {
    queryParams.append('fields', params.fields)
  }

  if (params.page !== undefined) {
    queryParams.append('page', params.page.toString())
  }

  if (params.page_size !== undefined) {
    queryParams.append('page_size', params.page_size.toString())
  }

  return queryParams.toString()
}

export const metricsApi = {
  /**
   * Fetch metrics data from the /api/metrics endpoint
   */
  async getMetrics(params: MetricsQueryParams): Promise<MetricsResponse> {
    // Validate range format before making API call
    if (!validateRange(params.range)) {
      throw new Error(
        `Invalid range format: ${params.range}. Expected format: '24h', '7d', '30d', etc.`
      )
    }

    // Validate that at least one filter is provided
    if (
      (params.meter_id === null || params.meter_id === undefined) &&
      (params.site_id === null || params.site_id === undefined)
    ) {
      throw new Error('At least one of meter_id or site_id must be provided')
    }

    const queryString = buildQueryString(params)
    return apiClient.get<MetricsResponse>(`/api/metrics?${queryString}`)
  },
}

