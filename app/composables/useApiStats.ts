export interface ApiStats {
  forecastRequests: number
  geocodingRequests: number
  cacheHits: number
}

export function useApiStats() {
  return useState<ApiStats>('api-stats', () => ({
    forecastRequests: 0,
    geocodingRequests: 0,
    cacheHits: 0,
  }))
}
