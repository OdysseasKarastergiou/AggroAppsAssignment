import type { City, NearestCity } from '~/types/weather'

/** Compact format produced by scripts/build-cities.mjs: [name, lat, lon, countryIndex, regionIndex]. */
interface CitiesFile {
  countries: string[]
  regions: string[]
  cities: [string, number, number, number, number][]
}

const EARTH_RADIUS_KM = 6371

let citiesPromise: Promise<City[]> | undefined

function decode(file: CitiesFile): City[] {
  return file.cities.map(([name, latitude, longitude, countryIndex, regionIndex]) => ({
    name,
    latitude,
    longitude,
    country: file.countries[countryIndex] ?? '',
    region: file.regions[regionIndex],
  }))
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/** Longitude difference in the range -180..180, so points across the antimeridian are close. */
function longitudeDelta(from: number, to: number): number {
  return ((((to - from) % 360) + 540) % 360) - 180
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(longitudeDelta(lon1, lon2))
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a))
}

export function useNearestCity() {
  const baseURL = useRuntimeConfig().app.baseURL

  function loadCities(): Promise<City[]> {
    citiesPromise ??= $fetch<CitiesFile>(`${baseURL}cities.json`)
      .then(decode)
      .catch((error) => {
        citiesPromise = undefined
        throw error
      })
    return citiesPromise
  }

  /** Returns null if the city list can't be loaded; callers fall back to coordinates. */
  async function findNearestCity(latitude: number, longitude: number): Promise<NearestCity | null> {
    let cities: City[]
    try {
      cities = await loadCities()
    }
    catch {
      return null
    }

    // A flat-earth approximation is enough to rank ~30k candidates; the winner gets an exact distance.
    const cosLat = Math.cos(toRadians(latitude))
    let nearest: City | undefined
    let nearestScore = Infinity
    for (const city of cities) {
      const dLat = city.latitude - latitude
      const dLon = longitudeDelta(longitude, city.longitude) * cosLat
      const score = dLat * dLat + dLon * dLon
      if (score < nearestScore) {
        nearestScore = score
        nearest = city
      }
    }

    if (!nearest) return null
    return {
      city: nearest,
      distanceKm: haversineKm(latitude, longitude, nearest.latitude, nearest.longitude),
    }
  }

  return { loadCities, findNearestCity }
}
