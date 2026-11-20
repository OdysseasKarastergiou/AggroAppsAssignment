import type { ForecastResult, GeocodingResult, Place, WeatherSnapshot } from '~/types/weather'

export function placeFromGeocoding(result: GeocodingResult): Place {
  const region = [result.admin1, result.country].filter(Boolean).join(', ')
  return {
    id: `geo-${result.id}`,
    name: result.name,
    region: region || undefined,
    latitude: result.latitude,
    longitude: result.longitude,
    kind: 'search',
  }
}

/**
 * A place picked by coordinates (map click or geolocation). Open-Meteo has no reverse
 * geocoding, so the coordinates double as the name. The id uses the same ~1 km grid as
 * the forecast cache, so clicking the same spot twice resolves to the same place.
 */
export function placeFromCoordinates(latitude: number, longitude: number, kind: 'point' | 'current' = 'point'): Place {
  const coordinates = formatCoordinates(latitude, longitude)
  return {
    id: `pt-${latitude.toFixed(2)},${longitude.toFixed(2)}`,
    name: kind === 'current' ? 'My location' : coordinates,
    region: kind === 'current' ? coordinates : 'Point on the map',
    latitude,
    longitude,
    kind,
  }
}

export function toSnapshot({ data, fetchedAt }: ForecastResult): WeatherSnapshot {
  return {
    temperature: data.current.temperature_2m,
    weatherCode: data.current.weather_code,
    isDay: data.current.is_day === 1,
    fetchedAt,
  }
}
