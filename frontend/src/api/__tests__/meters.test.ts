import { describe, it, expect, vi, beforeEach } from 'vitest'
import { metersApi, type Meter } from '../meters'
import { apiClient } from '../client'

// Mock the apiClient
vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

describe('metersApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getMeters', () => {
    it('should fetch meters list successfully', async () => {
      const mockMeters: Meter[] = [
        {
          id: 1,
          name: 'Meter 1',
          serial_number: 'SN001',
          meter_type: 'electricity',
          status: 'active',
          site_id: 1,
          site: {
            id: 1,
            name: 'Site 1',
          },
        },
        {
          id: 2,
          name: 'Meter 2',
          serial_number: 'SN002',
          meter_type: 'electricity',
          status: 'active',
          site_id: 1,
          site: {
            id: 1,
            name: 'Site 1',
          },
        },
        {
          id: 3,
          name: 'Meter 3',
          serial_number: 'SN003',
          meter_type: 'electricity',
          status: 'active',
          site_id: 2,
          site: {
            id: 2,
            name: 'Site 2',
          },
        },
      ]

      vi.mocked(apiClient.get).mockResolvedValue(mockMeters)

      const result = await metersApi.getMeters()

      expect(apiClient.get).toHaveBeenCalledWith('/api/meters')
      expect(result).toEqual(mockMeters)
      expect(result).toHaveLength(3)
    })

    it('should handle empty meters list', async () => {
      vi.mocked(apiClient.get).mockResolvedValue([])

      const result = await metersApi.getMeters()

      expect(apiClient.get).toHaveBeenCalledWith('/api/meters')
      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('should handle API errors', async () => {
      const error = new Error('Failed to fetch meters')
      vi.mocked(apiClient.get).mockRejectedValue(error)

      await expect(metersApi.getMeters()).rejects.toThrow('Failed to fetch meters')
      expect(apiClient.get).toHaveBeenCalledWith('/api/meters')
    })

    it('should handle meters without nested site objects', async () => {
      const mockMeters: Meter[] = [
        {
          id: 1,
          name: 'Meter 1',
          serial_number: 'SN001',
          meter_type: 'electricity',
          status: 'active',
          site_id: 1,
        },
      ]

      vi.mocked(apiClient.get).mockResolvedValue(mockMeters)

      const result = await metersApi.getMeters()

      expect(result).toEqual(mockMeters)
      expect(result[0].site).toBeUndefined()
    })

    it('should preserve all meter properties', async () => {
      const mockMeter: Meter = {
        id: 1,
        name: 'Meter 1',
        serial_number: 'SN001',
        model: 'Model X',
        manufacturer: 'Manufacturer Y',
        meter_type: 'electricity',
        status: 'active',
        voltage_rating: 240,
        current_rating: 100,
        power_rating: 24000,
        accuracy_class: 'Class 1',
        installation_date: '2024-01-01T00:00:00Z',
        last_calibration: '2024-01-01T00:00:00Z',
        next_calibration: '2025-01-01T00:00:00Z',
        communication_protocol: 'Modbus',
        ip_address: '192.168.1.100',
        port: 502,
        site_id: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: null,
      }

      vi.mocked(apiClient.get).mockResolvedValue([mockMeter])

      const result = await metersApi.getMeters()

      expect(result[0]).toMatchObject(mockMeter)
    })
  })
})

