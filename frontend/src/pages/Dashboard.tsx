import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { useAuth } from '../contexts/useAuth'
import { useMetrics } from '../hooks/useMetrics'
import KPICards from '../components/KPICards'
import ConsumptionChart from '../components/ConsumptionChart'
import AnomalyPreviewCard from '../components/AnomalyPreviewCard'
import SiteMeterFilters from '../components/SiteMeterFilters'

export default function Dashboard() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [timeRange, setTimeRange] = useState<string>('24h')

  // Read site and meter from URL params
  const siteIdParam = searchParams.get('site')
  const meterIdParam = searchParams.get('meter')
  const selectedSiteId = siteIdParam && !isNaN(parseInt(siteIdParam, 10)) 
    ? parseInt(siteIdParam, 10) 
    : null
  const selectedMeterId = meterIdParam && !isNaN(parseInt(meterIdParam, 10))
    ? parseInt(meterIdParam, 10)
    : null

  // Update URL params when filters change
  const handleSiteChange = (siteId: number | null) => {
    const newParams = new URLSearchParams(searchParams)
    if (siteId) {
      newParams.set('site', siteId.toString())
    } else {
      newParams.delete('site')
      // Also remove meter if site is cleared
      newParams.delete('meter')
    }
    setSearchParams(newParams, { replace: true })
  }

  const handleMeterChange = (meterId: number | null) => {
    const newParams = new URLSearchParams(searchParams)
    if (meterId) {
      newParams.set('meter', meterId.toString())
    } else {
      newParams.delete('meter')
    }
    setSearchParams(newParams, { replace: true })
  }

  // Fetch metrics data when site or meter is selected
  const { data: metricsData, isLoading, error, refetch } = useMetrics({
    meter_id: selectedMeterId,
    site_id: selectedSiteId,
    range: timeRange,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back, {user?.username || user?.email}!
        </p>
      </div>

      {/* Site and Meter Filters */}
      <SiteMeterFilters
        selectedSiteId={selectedSiteId}
        selectedMeterId={selectedMeterId}
        onSiteChange={handleSiteChange}
        onMeterChange={handleMeterChange}
      />

      {/* Time Range Control */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Time Range</h3>
        <div className="max-w-xs">
          <label htmlFor="range-select" className="block text-sm font-medium text-foreground mb-2">
            Select Time Range
          </label>
          <select
            id="range-select"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (selectedMeterId || selectedSiteId) && (
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">Loading metrics data...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (selectedMeterId || selectedSiteId) && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-destructive mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-destructive">Error Loading Metrics</h3>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              <button
                onClick={() => refetch()}
                className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State - No Site or Meter Selected */}
      {!selectedSiteId && !selectedMeterId && !isLoading && (
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-foreground">No Filters Selected</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Please select a site and meter above to view live metrics data
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards and Chart */}
      {(selectedMeterId || selectedSiteId) && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <KPICards
            meterId={selectedMeterId}
            siteId={selectedSiteId}
            timeRange={timeRange}
          />

          {/* Consumption Chart */}
          <ConsumptionChart
            data={metricsData}
            isLoading={isLoading}
            error={error}
          />

          <AnomalyPreviewCard
            meterId={selectedMeterId}
            siteId={selectedSiteId}
            timeRange={timeRange}
          />
        </div>
      )}

      {user && (
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-card-foreground">User Information</h3>
          <div className="mt-4 space-y-2 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Email:</span>{' '}
              <span className="text-foreground">{user.email}</span>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Username:</span>{' '}
              <span className="text-foreground">{user.username}</span>
            </div>
            {user.first_name && (
              <div>
                <span className="font-medium text-muted-foreground">Name:</span>{' '}
                <span className="text-foreground">
                  {user.first_name} {user.last_name || ''}
                </span>
              </div>
            )}
            {user.phone && (
              <div>
                <span className="font-medium text-muted-foreground">Phone:</span>{' '}
                <span className="text-foreground">{user.phone}</span>
              </div>
            )}
            <div>
              <span className="font-medium text-muted-foreground">Status:</span>{' '}
              <span className="text-foreground">
                {user.is_verified ? 'Verified' : 'Not Verified'} |{' '}
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

