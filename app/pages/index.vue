<script setup lang="ts">
import type { ForecastResult, Place, SelectionSource, Selection } from '~/types/weather'

const { getForecast } = useForecast()
const { places: savedPlaces, isSaved, save, remove, updateSnapshot } = useSavedPlaces()
const { locate, locating, error: locationError } = useCurrentPosition()
const stats = useApiStats()

const weatherMap = useTemplateRef('weatherMap')

const selection = ref<Selection | null>(null)
const forecast = ref<ForecastResult | null>(null)
const status = ref<'loading' | 'success' | 'error'>('loading')

// Lets a slow response be ignored once the user has already moved on to another place.
let latestRequestId = 0

const selectedPlace = computed(() => selection.value?.place ?? null)
const selectedIsSaved = computed(() => (selectedPlace.value ? isSaved(selectedPlace.value.id) : false))

async function showPlace(place: Place, source: SelectionSource): Promise<void> {
  selection.value = { place, source }
  forecast.value = null
  status.value = 'loading'

  const requestId = ++latestRequestId
  try {
    const result = await getForecast(place.latitude, place.longitude)
    if (requestId !== latestRequestId) return
    forecast.value = result
    status.value = 'success'
    updateSnapshot(place.id, toSnapshot(result))
  }
  catch {
    if (requestId !== latestRequestId) return
    status.value = 'error'
  }
}

function onMapPick(latitude: number, longitude: number): void {
  showPlace(placeFromCoordinates(latitude, longitude), 'map')
}

async function showMyLocation(): Promise<void> {
  const coords = await locate()
  if (coords) showPlace(placeFromCoordinates(coords.latitude, coords.longitude, 'current'), 'geolocation')
}

function toggleSave(): void {
  const place = selectedPlace.value
  if (!place) return
  if (isSaved(place.id)) remove(place.id)
  else save(place, forecast.value ? toSnapshot(forecast.value) : undefined)
}

function retry(): void {
  if (selection.value) showPlace(selection.value.place, selection.value.source)
}

function closePanel(): void {
  latestRequestId++
  selection.value = null
  forecast.value = null
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 text-slate-900">
    <div class="mx-auto flex max-w-7xl flex-col gap-4 p-4 lg:p-6">
      <header class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">
            🌦️ Weather Explorer
          </h1>
          <p class="text-sm text-slate-500">
            Search for a place or click anywhere on the map to see its weather.
          </p>
        </div>

        <div class="flex w-full flex-col gap-2 sm:flex-row lg:max-w-xl">
          <SearchBar class="flex-1" @select="place => showPlace(place, 'search')" />
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-60"
            :disabled="locating"
            @click="showMyLocation"
          >
            <span aria-hidden="true">📍</span>
            {{ locating ? 'Locating…' : 'My location' }}
          </button>
        </div>
      </header>

      <p v-if="locationError" class="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200" role="alert">
        {{ locationError }}
      </p>

      <main class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div class="relative">
          <WeatherMap
            ref="weatherMap"
            :selection="selection"
            :saved-places="savedPlaces"
            @pick="onMapPick"
            @select-saved="place => showPlace(place, 'saved')"
          />

          <div v-if="selectedPlace" class="mt-4 lg:absolute lg:right-4 lg:top-4 lg:z-[1000] lg:mt-0">
            <WeatherPanel
              :place="selectedPlace"
              :status="status"
              :forecast="forecast"
              :saved="selectedIsSaved"
              @toggle-save="toggleSave"
              @close="closePanel"
              @retry="retry"
            />
          </div>
          <p
            v-else
            class="pointer-events-none absolute bottom-6 left-1/2 z-[1000] w-max max-w-[90%] -translate-x-1/2 rounded-full bg-white/90 px-4 py-2 text-center text-sm text-slate-600 shadow-md"
          >
            Click anywhere on the map to see the weather there
          </p>
        </div>

        <aside class="flex flex-col gap-4">
          <SavedPlaces
            :places="savedPlaces"
            :active-id="selectedPlace?.id"
            @select="place => showPlace(place, 'saved')"
            @remove="remove"
            @show-all="weatherMap?.showAllSaved()"
          />
        </aside>
      </main>

      <footer class="flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:justify-between">
        <span>
          Weather data by <a href="https://open-meteo.com/" class="underline hover:text-slate-700" target="_blank" rel="noopener">Open-Meteo.com</a>
        </span>
        <span>
          API requests since page load: {{ stats.forecastRequests }} forecast · {{ stats.geocodingRequests }} search ·
          {{ stats.cacheHits }} served from cache
        </span>
      </footer>
    </div>
  </div>
</template>
