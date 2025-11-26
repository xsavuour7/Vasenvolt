import { MetricsResponse, MetricsQueryParams } from '@/types/metrics';
import { apiClient } from './client';

/**
 * Metrics API endpoints
 */
export const metricsApi = {
  /**
   * Get telemetry metrics for dashboard charts
   * @param params Query parameters for metrics
   * @returns Metrics response with timeseries data
   */
  async getMetrics(params: MetricsQueryParams): Promise<MetricsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.meter_id !== undefined) {
      queryParams.append('meter_id', params.meter_id.toString());
    }
    
    if (params.site_id !== undefined) {
      queryParams.append('site_id', params.site_id.toString());
    }
    
    queryParams.append('range', params.range);
    
    if (params.aggregation) {
      queryParams.append('aggregation', params.aggregation);
    }
    
    if (params.fields) {
      queryParams.append('fields', params.fields);
    }
    
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }
    
    if (params.page_size) {
      queryParams.append('page_size', params.page_size.toString());
    }
    
    const queryString = queryParams.toString();
    const endpoint = `/api/metrics${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.request<MetricsResponse>(endpoint);
  },
};

