import type { ForecastResponse, ForecastResult } from '~/types/weather'

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const CACHE_TTL_MS = 15 * 60 * 1000
const STORAGE_KEY = 'weather-explorer:forecast-cache'

const CURRENT_FIELDS = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'precipitation',
  'weather_code',
  'wind_speed_10m',
  'wind_direction_10m',
  'is_day',
].join(',')

const DAILY_FIELDS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_probability_max',
].join(',')

interface CacheEntry {
  data: ForecastResponse
  fetchedAt: number
}

// Module-level so every component shares one cache, seeded from sessionStorage to survive reloads.
const cache = new Map<string, CacheEntry>(
  Object.entries(readSession<Record<string, CacheEntry>>(STORAGE_KEY, {})),
)
const inFlight = new Map<string, Promise<CacheEntry>>()

/** Two decimals is a ~1 km grid, finer than the forecast model resolution. */
function roundCoordinate(value: number): number {
  return Math.round(value * 100) / 100
}

function isFresh(entry: CacheEntry): boolean {
  return Date.now() - entry.fetchedAt < CACHE_TTL_MS
}

function persistCache(): void {
  for (const [key, entry] of cache) {
    if (!isFresh(entry)) cache.delete(key)
  }
  writeSession(STORAGE_KEY, Object.fromEntries(cache))
}

export function useForecast() {
  const stats = useApiStats()

  async function getForecast(latitude: number, longitude: number): Promise<ForecastResult> {
    const lat = roundCoordinate(latitude)
    const lon = roundCoordinate(longitude)
    const key = `${lat},${lon}`

    const cached = cache.get(key)
    if (cached && isFresh(cached)) {
      stats.value.cacheHits++
      return { ...cached, fromCache: true }
    }

    let request = inFlight.get(key)
    if (!request) {
      stats.value.forecastRequests++
      request = $fetch<ForecastResponse>(FORECAST_URL, {
        query: {
          latitude: lat,
          longitude: lon,
          current: CURRENT_FIELDS,
          daily: DAILY_FIELDS,
          timezone: 'auto',
          forecast_days: 7,
        },
      })
        .then((data) => {
          const entry = { data, fetchedAt: Date.now() }
          cache.set(key, entry)
          persistCache()
          return entry
        })
        .finally(() => inFlight.delete(key))
      inFlight.set(key, request)
    }

    return { ...(await request), fromCache: false }
  }

  return { getForecast }
}
