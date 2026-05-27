import { apiClient } from './client'

export interface Site {
  id: number
  name: string
  slug?: string
  description?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  postal_code?: string | null
  latitude?: number | null
  longitude?: number | null
  site_type?: string | null
  total_area?: number | null
  is_active?: boolean
}

export interface Meter {
  id: number
  name: string
  serial_number: string
  model?: string | null
  manufacturer?: string | null
  meter_type: string
  status: string
  voltage_rating?: number | null
  current_rating?: number | null
  power_rating?: number | null
  accuracy_class?: string | null
  installation_date?: string | null
  last_calibration?: string | null
  next_calibration?: string | null
  communication_protocol?: string | null
  ip_address?: string | null
  port?: number | null
  site_id: number
  site?: Site | null
  created_at?: string
  updated_at?: string | null
}

export type MetersResponse = Meter[]

export const metersApi = {
  /**
   * Fetch meters list from the /api/meters endpoint
   */
  async getMeters(): Promise<MetersResponse> {
    return apiClient.get<MetersResponse>('/api/meters')
  },
}

