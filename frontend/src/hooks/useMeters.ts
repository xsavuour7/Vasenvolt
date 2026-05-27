import { useQuery } from '@tanstack/react-query'
import { metersApi, type Meter, type Site } from '../api/meters'

interface UseMetersResult {
  meters: Meter[]
  sites: Site[]
  isLoading: boolean
  error: string | null
}

/**
 * Custom React Query hook for fetching meters and extracting unique sites
 */
export function useMeters(): UseMetersResult {
  const query = useQuery({
    queryKey: ['meters'],
    queryFn: () => metersApi.getMeters(),
    staleTime: 5 * 60 * 1000, // 5 minutes - meters don't change frequently
    retry: 2,
  })

  // Extract unique sites from meters
  const siteMap = new Map<number, Site>()

  if (query.data) {
    query.data.forEach((meter) => {
      // If meter has nested site object, use it
      if (meter.site && !siteMap.has(meter.site.id)) {
        siteMap.set(meter.site.id, meter.site)
      }
      // Otherwise, create a site object from site_id (if we don't have site info)
      // For now, we'll assume the API returns site info nested in meters
      // If not, we'd need a separate sites endpoint or the API should include site data
    })

    // If no nested sites found, create minimal site objects from site_id
    if (siteMap.size === 0) {
      query.data.forEach((meter) => {
        if (!siteMap.has(meter.site_id)) {
          siteMap.set(meter.site_id, {
            id: meter.site_id,
            name: `Site ${meter.site_id}`, // Fallback name
          })
        }
      })
    }
  }

  const sitesArray = Array.from(siteMap.values())

  // Transform error to user-friendly message
  const errorMessage = query.error
    ? query.error instanceof Error
      ? query.error.message
      : 'An error occurred while fetching meters data'
    : null

  return {
    meters: query.data || [],
    sites: sitesArray,
    isLoading: query.isLoading,
    error: errorMessage,
  }
}

