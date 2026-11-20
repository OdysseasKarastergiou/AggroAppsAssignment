import type { GeocodingResponse, GeocodingResult } from '~/types/weather'

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
export const MAX_SUGGESTIONS = 5
export const MIN_QUERY_LENGTH = 2

// Place names don't change, so results are kept for the whole page lifetime.
const cache = new Map<string, GeocodingResult[]>()

export function useGeocoding() {
  const stats = useApiStats()

  async function searchPlaces(query: string, signal?: AbortSignal): Promise<GeocodingResult[]> {
    const name = query.trim()
    const key = name.toLowerCase()
    if (name.length < MIN_QUERY_LENGTH) return []

    const cached = cache.get(key)
    if (cached) {
      stats.value.cacheHits++
      return cached
    }

    stats.value.geocodingRequests++
    const response = await $fetch<GeocodingResponse>(GEOCODING_URL, {
      query: { name, count: MAX_SUGGESTIONS, language: 'en', format: 'json' },
      signal,
    })
    const results = response.results ?? []
    cache.set(key, results)
    return results
  }

  return { searchPlaces }
}
