import { useMemo } from 'react'
import { useMeters } from '../hooks/useMeters'

interface SiteMeterFiltersProps {
  selectedSiteId: number | null
  selectedMeterId: number | null
  onSiteChange: (siteId: number | null) => void
  onMeterChange: (meterId: number | null) => void
}

/**
 * Filter component for selecting site and meter
 * Meters are filtered by the selected site
 */
export default function SiteMeterFilters({
  selectedSiteId,
  selectedMeterId,
  onSiteChange,
  onMeterChange,
}: SiteMeterFiltersProps) {
  const { meters, sites, isLoading, error } = useMeters()

  // Filter meters by selected site
  const filteredMeters = useMemo(() => {
    if (!selectedSiteId) {
      return []
    }
    return meters.filter((meter) => meter.site_id === selectedSiteId)
  }, [meters, selectedSiteId])

  // Reset meter selection if it doesn't belong to the selected site
  const handleSiteChange = (siteId: number | null) => {
    onSiteChange(siteId)
    // If current meter doesn't belong to new site, reset meter selection
    if (siteId && selectedMeterId) {
      const meter = meters.find((m) => m.id === selectedMeterId)
      if (!meter || meter.site_id !== siteId) {
        onMeterChange(null)
      }
    } else if (!siteId) {
      // If site is cleared, clear meter too
      onMeterChange(null)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Filters</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Site</label>
            <div className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
              Loading sites...
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Meter</label>
            <div className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
              Loading meters...
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Filters</h3>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">Filters</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {/* Site Filter */}
        <div>
          <label htmlFor="site-select" className="block text-sm font-medium text-foreground mb-2">
            Site
          </label>
          <select
            id="site-select"
            value={selectedSiteId || ''}
            onChange={(e) => handleSiteChange(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">-- Select a site --</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
        </div>

        {/* Meter Filter */}
        <div>
          <label htmlFor="meter-select" className="block text-sm font-medium text-foreground mb-2">
            Meter
          </label>
          <select
            id="meter-select"
            value={selectedMeterId || ''}
            onChange={(e) => onMeterChange(e.target.value ? parseInt(e.target.value) : null)}
            disabled={!selectedSiteId}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">-- Select a meter --</option>
            {filteredMeters.map((meter) => (
              <option key={meter.id} value={meter.id}>
                {meter.name}
              </option>
            ))}
          </select>
          {!selectedSiteId && (
            <p className="mt-1 text-xs text-muted-foreground">Please select a site first</p>
          )}
        </div>
      </div>
    </div>
  )
}

