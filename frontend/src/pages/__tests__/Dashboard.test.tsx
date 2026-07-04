import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Dashboard from '../Dashboard'
import { useAuth } from '../../contexts/AuthContext'
import { useMetrics } from '../../hooks/useMetrics'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

// Mock dependencies
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../../hooks/useMetrics', () => ({
  useMetrics: vi.fn(),
}))

vi.mock('../../components/SiteMeterFilters', () => ({
  default: ({ selectedSiteId, selectedMeterId, onSiteChange, onMeterChange }) => (
    <div data-testid="site-meter-filters">
      <select
        data-testid="site-select"
        value={selectedSiteId || ''}
        onChange={(e) => onSiteChange(e.target.value ? parseInt(e.target.value) : null)}
      >
        <option value="">-- Select a site --</option>
        <option value="1">Site 1</option>
        <option value="2">Site 2</option>
      </select>
      <select
        data-testid="meter-select"
        value={selectedMeterId || ''}
        onChange={(e) => onMeterChange(e.target.value ? parseInt(e.target.value) : null)}
        disabled={!selectedSiteId}
      >
        <option value="">-- Select a meter --</option>
        {selectedSiteId === 1 && (
          <>
            <option value="1">Meter 1</option>
            <option value="2">Meter 2</option>
          </>
        )}
        {selectedSiteId === 2 && <option value="3">Meter 3</option>}
      </select>
    </div>
  ),
}))

vi.mock('../../components/KPICards', () => ({
  default: ({ meterId, siteId }: any) => (
    <div data-testid="kpi-cards">
      KPI Cards - Meter: {meterId}, Site: {siteId}
    </div>
  ),
}))

vi.mock('../../components/ConsumptionChart', () => ({
  default: ({ data, isLoading, error }: { data: unknown; isLoading: boolean; error: string | null }) => (
    <div data-testid="consumption-chart">
      Chart - Loading: {isLoading ? 'true' : 'false'}, Error: {error || 'none'}, Data: {data ? 'present' : 'none'}
    </div>
  ),
}))

describe('Dashboard', () => {
  let queryClient: QueryClient
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    is_verified: true,
    is_active: true,
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      user: { ...mockUser, is_admin: false, created_at: new Date().toISOString() },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      signup: vi.fn(),
      refreshUser: function (): Promise<void> {
        throw new Error('Function not implemented.')
      }
    })
    vi.mocked(useMetrics).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })
  })

  const renderDashboard = (initialEntries = ['/dashboard']) => {
    const Wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    )

    // Mock window.location for URL params
    const mockLocation = {
      pathname: initialEntries[0],
      search: initialEntries[0].includes('?') ? initialEntries[0].split('?')[1] : '',
    }

    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    })

    return render(<Dashboard />, { wrapper: Wrapper })
  }

  it('should render dashboard with filters', () => {
    renderDashboard()

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByTestId('site-meter-filters')).toBeInTheDocument()
    expect(screen.getByLabelText('Select Time Range')).toBeInTheDocument()
  })

  it('should read site and meter from URL params', () => {
    renderDashboard(['/dashboard?site=1&meter=2'])

    const siteSelect = screen.getByTestId('site-select') as HTMLSelectElement
    const meterSelect = screen.getByTestId('meter-select') as HTMLSelectElement

    expect(siteSelect.value).toBe('1')
    expect(meterSelect.value).toBe('2')
  })

  it('should update URL params when site is selected', async () => {
    const user = userEvent.setup()
    renderDashboard()

    const siteSelect = screen.getByTestId('site-select')
    await user.selectOptions(siteSelect, '1')

    await waitFor(() => {
      const updatedSiteSelect = screen.getByTestId('site-select') as HTMLSelectElement
      expect(updatedSiteSelect.value).toBe('1')
    })
  })

  it('should update URL params when meter is selected', async () => {
    const user = userEvent.setup()
    renderDashboard(['/dashboard?site=1'])

    const meterSelect = screen.getByTestId('meter-select')
    await user.selectOptions(meterSelect, '1')

    await waitFor(() => {
      const updatedMeterSelect = screen.getByTestId('meter-select') as HTMLSelectElement
      expect(updatedMeterSelect.value).toBe('1')
    })
  })

  it('should clear meter when site is cleared', async () => {
    const user = userEvent.setup()
    renderDashboard(['/dashboard?site=1&meter=2'])

    const siteSelect = screen.getByTestId('site-select')
    await user.selectOptions(siteSelect, '')

    await waitFor(() => {
      const meterSelect = screen.getByTestId('meter-select') as HTMLSelectElement
      expect(meterSelect.value).toBe('')
      expect(meterSelect).toBeDisabled()
    })
  })

  it('should call useMetrics with correct params from URL', () => {
    renderDashboard(['/dashboard?site=1&meter=2'])

    expect(useMetrics).toHaveBeenCalledWith({
      meter_id: 2,
      site_id: 1,
      range: '24h',
    })
  })

  it('should handle invalid URL params gracefully', () => {
    renderDashboard(['/dashboard?site=abc&meter=xyz'])

    const siteSelect = screen.getByTestId('site-select') as HTMLSelectElement
    const meterSelect = screen.getByTestId('meter-select') as HTMLSelectElement

    expect(siteSelect.value).toBe('')
    expect(meterSelect.value).toBe('')
    expect(useMetrics).toHaveBeenCalledWith({
      meter_id: null,
      site_id: null,
      range: '24h',
    })
  })

  it('should show empty state when no filters are selected', () => {
    renderDashboard()

    expect(screen.getByText('No Filters Selected')).toBeInTheDocument()
    expect(screen.getByText('Please select a site and meter above to view live metrics data')).toBeInTheDocument()
  })

  it('should show KPI cards and chart when filters are selected', () => {
    renderDashboard(['/dashboard?site=1&meter=2'])

    expect(screen.getByTestId('kpi-cards')).toBeInTheDocument()
    expect(screen.getByTestId('consumption-chart')).toBeInTheDocument()
  })

  it('should show loading state when metrics are loading', () => {
    vi.mocked(useMetrics).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    })

    renderDashboard(['/dashboard?site=1&meter=2'])

    expect(screen.getByText('Loading metrics data...')).toBeInTheDocument()
  })

  it('should show error state when metrics fail', () => {
    vi.mocked(useMetrics).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: 'Failed to fetch metrics',
      refetch: vi.fn(),
    })

    renderDashboard(['/dashboard?site=1&meter=2'])

    expect(screen.getByText('Error Loading Metrics')).toBeInTheDocument()
    expect(screen.getByText('Failed to fetch metrics')).toBeInTheDocument()
  })

  it('should update metrics when time range changes', async () => {
    const user = userEvent.setup()
    renderDashboard(['/dashboard?site=1&meter=2'])

    const timeRangeSelect = screen.getByLabelText('Select Time Range')
    await user.selectOptions(timeRangeSelect, '7d')

    await waitFor(() => {
      expect(useMetrics).toHaveBeenCalledWith({
        meter_id: 2,
        site_id: 1,
        range: '7d',
      })
    })
  })

  it('should work with site-only filter', () => {
    renderDashboard(['/dashboard?site=1'])

    expect(useMetrics).toHaveBeenCalledWith({
      meter_id: null,
      site_id: 1,
      range: '24h',
    })
    expect(screen.getByTestId('kpi-cards')).toBeInTheDocument()
  })

  it('should work with meter-only filter', () => {
    renderDashboard(['/dashboard?meter=2'])

    expect(useMetrics).toHaveBeenCalledWith({
      meter_id: 2,
      site_id: null,
      range: '24h',
    })
    expect(screen.getByTestId('kpi-cards')).toBeInTheDocument()
  })
})

