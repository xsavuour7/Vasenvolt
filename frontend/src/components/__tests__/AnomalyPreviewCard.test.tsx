import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AnomalyPreviewCard from '../AnomalyPreviewCard'
import { useAnomalies } from '../../hooks/useAnomalies'

vi.mock('../../hooks/useAnomalies', () => ({
  useAnomalies: vi.fn(),
}))

describe('AnomalyPreviewCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders empty state when no anomalies are returned', () => {
    vi.mocked(useAnomalies).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    render(<AnomalyPreviewCard meterId={1} siteId={1} timeRange="24h" />)

    expect(screen.getByText('Recent Anomalies')).toBeInTheDocument()
    expect(screen.getByText('No anomalies detected in the selected time range.')).toBeInTheDocument()
  })

  it('opens and closes the detail modal when an anomaly is clicked', async () => {
    const user = userEvent.setup()

    vi.mocked(useAnomalies).mockReturnValue({
      data: [
        {
          timestamp: '2024-01-15T10:30:00Z',
          meter_id: 1,
          meter_name: 'Main Meter',
          site_id: 1,
          site_name: 'Main Site',
          kwh: 150,
          previous_kwh: 100,
          deviation_percent: 50,
        },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    render(<AnomalyPreviewCard meterId={1} siteId={1} timeRange="24h" />)

    await user.click(screen.getByRole('button', { name: /main meter/i }))

    const dialog = screen.getByRole('dialog', { name: 'Anomaly details' })
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByText('150.00 kWh')).toBeInTheDocument()
    expect(within(dialog).getByText('100.00 kWh')).toBeInTheDocument()
    expect(within(dialog).getByText('50.0%')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close' }))

    expect(screen.queryByRole('dialog', { name: 'Anomaly details' })).not.toBeInTheDocument()
  })
})
