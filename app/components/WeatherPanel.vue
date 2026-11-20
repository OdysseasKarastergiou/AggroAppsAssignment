<script setup lang="ts">
import type { ForecastResult, Place } from '~/types/weather'

const props = defineProps<{
  place: Place
  status: 'loading' | 'success' | 'error'
  forecast: ForecastResult | null
  saved: boolean
}>()

const emit = defineEmits<{
  toggleSave: []
  close: []
  retry: []
}>()

const current = computed(() => props.forecast?.data.current)

const condition = computed(() =>
  current.value ? describeWeather(current.value.weather_code, current.value.is_day === 1) : null,
)

const days = computed(() => {
  const daily = props.forecast?.data.daily
  if (!daily) return []
  return daily.time.map((date, index) => ({
    date,
    label: formatWeekday(date, index),
    icon: describeWeather(daily.weather_code[index] ?? -1).icon,
    max: daily.temperature_2m_max[index] ?? 0,
    min: daily.temperature_2m_min[index] ?? 0,
    rainChance: daily.precipitation_probability_max[index] ?? null,
  }))
})
</script>

<template>
  <article class="w-full rounded-2xl bg-white/95 p-5 shadow-xl ring-1 ring-slate-200 backdrop-blur lg:w-80">
    <header class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h2 class="truncate text-lg font-semibold text-slate-900">
          {{ place.name }}
        </h2>
        <p class="truncate text-sm text-slate-500">
          {{ place.region ?? formatCoordinates(place.latitude, place.longitude) }}
        </p>
      </div>
      <div class="flex shrink-0 items-center gap-1">
        <button
          type="button"
          class="rounded-lg px-2.5 py-1.5 text-sm font-medium transition"
          :class="saved
            ? 'bg-emerald-50 text-emerald-700 hover:bg-red-50 hover:text-red-700'
            : 'bg-sky-600 text-white hover:bg-sky-700'"
          :title="saved ? 'Remove from saved places' : 'Save this place'"
          :aria-pressed="saved"
          @click="emit('toggleSave')"
        >
          {{ saved ? '✓ Saved' : '+ Save' }}
        </button>
        <button
          type="button"
          class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close weather details"
          @click="emit('close')"
        >
          <svg class="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      </div>
    </header>

    <div v-if="status === 'loading'" class="mt-5 animate-pulse space-y-3" aria-busy="true" aria-label="Loading weather">
      <div class="h-12 w-2/3 rounded-lg bg-slate-200" />
      <div class="h-16 rounded-lg bg-slate-100" />
      <div class="h-32 rounded-lg bg-slate-100" />
    </div>

    <div v-else-if="status === 'error'" class="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700" role="alert">
      <p>Couldn't load the weather for this place.</p>
      <button type="button" class="mt-2 font-medium underline" @click="emit('retry')">
        Try again
      </button>
    </div>

    <template v-else-if="forecast && current && condition">
      <div class="mt-4 flex items-center gap-4">
        <span class="text-5xl leading-none" aria-hidden="true">{{ condition.icon }}</span>
        <div>
          <p class="text-4xl font-semibold tabular-nums text-slate-900">
            {{ formatTemperature(current.temperature_2m) }}<span class="text-xl text-slate-400">C</span>
          </p>
          <p class="text-sm text-slate-600">
            {{ condition.label }} · Feels like {{ formatTemperature(current.apparent_temperature) }}
          </p>
        </div>
      </div>

      <dl class="mt-4 grid grid-cols-3 gap-2 text-center">
        <div class="rounded-lg bg-slate-50 px-2 py-2">
          <dt class="text-xs text-slate-500">Humidity</dt>
          <dd class="font-semibold tabular-nums">{{ current.relative_humidity_2m }}%</dd>
        </div>
        <div class="rounded-lg bg-slate-50 px-2 py-2">
          <dt class="text-xs text-slate-500">Wind</dt>
          <dd class="font-semibold tabular-nums">
            {{ Math.round(current.wind_speed_10m) }}
            <span class="text-xs font-normal text-slate-500">km/h {{ compassDirection(current.wind_direction_10m) }}</span>
          </dd>
        </div>
        <div class="rounded-lg bg-slate-50 px-2 py-2">
          <dt class="text-xs text-slate-500">Precip.</dt>
          <dd class="font-semibold tabular-nums">
            {{ current.precipitation }} <span class="text-xs font-normal text-slate-500">mm</span>
          </dd>
        </div>
      </dl>

      <h3 class="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        7-day forecast
      </h3>
      <ol class="mt-2 divide-y divide-slate-100 text-sm">
        <li v-for="day in days" :key="day.date" class="flex items-center gap-2 py-1.5">
          <span class="w-12 font-medium text-slate-700">{{ day.label }}</span>
          <span class="w-6 text-center" aria-hidden="true">{{ day.icon }}</span>
          <span class="w-12 text-xs text-sky-700 tabular-nums">
            <template v-if="day.rainChance">💧{{ day.rainChance }}%</template>
          </span>
          <span class="ml-auto tabular-nums">
            <span class="font-semibold text-slate-900">{{ formatTemperature(day.max) }}</span>
            <span class="text-slate-400"> / {{ formatTemperature(day.min) }}</span>
          </span>
        </li>
      </ol>

      <footer class="mt-4 flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs text-slate-500">
        <span>Local time {{ formatLocalTime(current.time) }} ({{ forecast.data.timezone_abbreviation }})</span>
        <span>
          Updated {{ formatClockTime(forecast.fetchedAt) }}
          <template v-if="forecast.fromCache">· cached</template>
        </span>
      </footer>
    </template>
  </article>
</template>
