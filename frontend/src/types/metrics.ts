/**
 * Types for metrics API
 */

export interface MetricsDataPoint {
  timestamp: string;
  kwh?: number | null;
  voltage?: number | null;
  current?: number | null;
  power_factor?: number | null;
  power?: number | null;
}

export interface MetricsResponse {
  meter_id: number | null;
  site_id: number | null;
  range: string;
  start_time: string;
  end_time: string;
  aggregations: Record<string, string>;
  data: MetricsDataPoint[];
  total_points: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface MetricsQueryParams {
  meter_id?: number;
  site_id?: number;
  range: string; // e.g., '24h', '7d', '30d'
  aggregation?: string; // 'sum', 'avg', 'min', 'max' (default: 'sum')
  fields?: string; // comma-separated: 'kwh,voltage,current,power_factor,power'
  page?: number;
  page_size?: number;
}

