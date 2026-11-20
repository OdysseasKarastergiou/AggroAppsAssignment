import type { Place, SavedPlace, WeatherSnapshot } from '~/types/weather'

const STORAGE_KEY = 'weather-explorer:saved-places'

export function useSavedPlaces() {
  const places = useState<SavedPlace[]>('saved-places', () => readSession(STORAGE_KEY, []))

  function persist(): void {
    writeSession(STORAGE_KEY, places.value)
  }

  function isSaved(id: string): boolean {
    return places.value.some(place => place.id === id)
  }

  function save(place: Place, snapshot?: WeatherSnapshot): void {
    if (isSaved(place.id)) return
    places.value = [{ ...place, snapshot, savedAt: Date.now() }, ...places.value]
    persist()
  }

  function remove(id: string): void {
    places.value = places.value.filter(place => place.id !== id)
    persist()
  }

  function updateSnapshot(id: string, snapshot: WeatherSnapshot): void {
    if (!isSaved(id)) return
    places.value = places.value.map(place => (place.id === id ? { ...place, snapshot } : place))
    persist()
  }

  return { places, isSaved, save, remove, updateSnapshot }
}
