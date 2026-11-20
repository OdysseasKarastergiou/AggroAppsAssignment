export type PlaceKind = 'search' | 'point' | 'current'

export interface Place {
  id: string
  name: string
  /** Secondary line, e.g. "Attica, Greece". */
  region?: string
  latitude: number
  longitude: number
  kind: PlaceKind
}

/** How a place was chosen; the map only flies to places that weren't clicked on it. */
export type SelectionSource = 'search' | 'map' | 'saved' | 'geolocation'

export interface Selection {
  place: Place
  source: SelectionSource
}

export interface WeatherSnapshot {
  temperature: number
  weatherCode: number
  isDay: boolean
  fetchedAt: number
}

export interface SavedPlace extends Place {
  savedAt: number
  snapshot?: WeatherSnapshot
}

export interface GeocodingResult {
  id: number
  name: string
  latitude: number
  longitude: number
  country?: string
  country_code?: string
  admin1?: string
  admin2?: string
  population?: number
}

export interface GeocodingResponse {
  results?: GeocodingResult[]
}

export interface ForecastResponse {
  latitude: number
  longitude: number
  timezone: string
  timezone_abbreviation: string
  current: {
    time: string
    temperature_2m: number
    apparent_temperature: number
    relative_humidity_2m: number
    precipitation: number
    weather_code: number
    wind_speed_10m: number
    wind_direction_10m: number
    is_day: 0 | 1
  }
  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_probability_max: (number | null)[]
  }
}

export interface ForecastResult {
  data: ForecastResponse
  fetchedAt: number
  fromCache: boolean
}
