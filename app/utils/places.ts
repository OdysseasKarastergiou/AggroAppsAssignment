import type { ForecastResult, GeocodingResult, NearestCity, Place, WeatherSnapshot } from '~/types/weather'

/** Closer than this, a point is labelled as the city itself. */
const IN_CITY_KM = 5
/** Farther than this (e.g. open sea), "Near <city>" would be misleading, so coordinates are used. */
const NEARBY_KM = 150

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

function describePoint(coordinates: string, nearest: NearestCity | null): { name: string, region: string } {
  if (!nearest) return { name: coordinates, region: 'Point on the map' }

  const { city, distanceKm } = nearest
  const area = [city.region, city.country].filter(Boolean).join(', ')
  const km = Math.round(distanceKm)

  if (distanceKm < IN_CITY_KM) return { name: city.name, region: area }
  if (distanceKm <= NEARBY_KM) return { name: `Near ${city.name}`, region: `${km} km away · ${area}` }
  return { name: coordinates, region: `${km} km from ${city.name}, ${city.country}` }
}

/**
 * A place picked by coordinates (map click or geolocation). Open-Meteo has no reverse
 * geocoding, so it is named after the nearest city from the bundled GeoNames list.
 * The id uses the same ~1 km grid as the forecast cache, so clicking the same spot
 * twice resolves to the same place.
 */
export function placeFromCoordinates(
  latitude: number,
  longitude: number,
  kind: 'point' | 'current' = 'point',
  nearest: NearestCity | null = null,
): Place {
  const coordinates = formatCoordinates(latitude, longitude)
  const label = kind === 'current'
    ? {
        name: 'My location',
        region: nearest ? `Near ${nearest.city.name}, ${nearest.city.country}` : coordinates,
      }
    : describePoint(coordinates, nearest)

  return {
    id: `pt-${latitude.toFixed(2)},${longitude.toFixed(2)}`,
    ...label,
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
