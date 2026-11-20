<script setup lang="ts">
import type { SavedPlace } from '~/types/weather'

defineProps<{
  places: SavedPlace[]
  activeId?: string
}>()

const emit = defineEmits<{
  select: [place: SavedPlace]
  remove: [id: string]
  showAll: []
  clear: []
}>()
</script>

<template>
  <section class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
    <header class="flex items-center justify-between gap-2">
      <h2 class="text-base font-semibold text-slate-900">
        Saved Places
      </h2>
      <div v-if="places.length" class="flex items-center gap-3">
        <button
          v-if="places.length > 1"
          type="button"
          class="text-sm font-medium text-sky-700 hover:underline"
          @click="emit('showAll')"
        >
          Show all locations
        </button>
        <button
          type="button"
          class="text-sm font-medium text-red-600 hover:underline"
          @click="emit('clear')"
        >
          Clear
        </button>
      </div>
    </header>

    <p v-if="!places.length" class="mt-3 text-sm text-slate-500">
      Nothing saved yet. Open a place and press <strong class="text-slate-700">+ Save</strong> to keep it here and
      on the map for this session.
    </p>

    <ul v-else class="mt-3 -mx-2 divide-y divide-slate-100">
      <li v-for="place in places" :key="place.id" class="flex items-center gap-1">
        <button
          type="button"
          class="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-2.5 text-left transition hover:bg-slate-50"
          :class="{ 'bg-sky-50 hover:bg-sky-50': place.id === activeId }"
          @click="emit('select', place)"
        >
          <span class="w-7 text-center text-xl" aria-hidden="true">
            {{ place.snapshot ? describeWeather(place.snapshot.weatherCode, place.snapshot.isDay).icon : '📍' }}
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate font-medium text-slate-900">{{ place.name }}</span>
            <span class="block truncate text-xs text-slate-500">
              {{ place.region ?? formatCoordinates(place.latitude, place.longitude) }}
            </span>
          </span>
          <span
            v-if="place.snapshot"
            class="font-semibold tabular-nums text-slate-900"
            :title="`As of ${formatClockTime(place.snapshot.fetchedAt)}`"
          >
            {{ formatTemperature(place.snapshot.temperature) }}
          </span>
        </button>
        <button
          type="button"
          class="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
          :aria-label="`Remove ${place.name} from saved places`"
          @click="emit('remove', place.id)"
        >
          <svg class="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      </li>
    </ul>
  </section>
</template>
