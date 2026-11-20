<script setup lang="ts">
import type { GeocodingResult, Place } from '~/types/weather'

const emit = defineEmits<{ select: [place: Place] }>()

const DEBOUNCE_MS = 300

const { searchPlaces } = useGeocoding()

const inputRef = useTemplateRef('input')
const inputId = useId()
const listboxId = useId()

const query = ref('')
const suggestions = ref<GeocodingResult[]>([])
const activeIndex = ref(-1)
const isOpen = ref(false)
const status = ref<'idle' | 'loading' | 'error'>('idle')

let debounceTimer: ReturnType<typeof setTimeout> | undefined
let controller: AbortController | undefined

onBeforeUnmount(() => {
  clearTimeout(debounceTimer)
  controller?.abort()
})

function optionId(index: number): string {
  return `${listboxId}-option-${index}`
}

function regionOf(result: GeocodingResult): string {
  return [result.admin1, result.country].filter(Boolean).join(', ')
}

function onInput(): void {
  clearTimeout(debounceTimer)
  controller?.abort()

  const text = query.value.trim()
  if (text.length < MIN_QUERY_LENGTH) {
    suggestions.value = []
    status.value = 'idle'
    close()
    return
  }

  isOpen.value = true
  status.value = 'loading'
  debounceTimer = setTimeout(() => runSearch(text), DEBOUNCE_MS)
}

async function runSearch(text: string): Promise<void> {
  controller = new AbortController()
  const { signal } = controller
  try {
    const results = await searchPlaces(text, signal)
    if (signal.aborted) return
    suggestions.value = results
    activeIndex.value = results.length ? 0 : -1
    status.value = 'idle'
  }
  catch {
    if (signal.aborted) return
    suggestions.value = []
    status.value = 'error'
  }
}

function choose(result: GeocodingResult): void {
  query.value = result.name
  close()
  emit('select', placeFromGeocoding(result))
}

function close(): void {
  isOpen.value = false
  activeIndex.value = -1
}

function onFocus(): void {
  if (suggestions.value.length && query.value.trim().length >= MIN_QUERY_LENGTH) {
    isOpen.value = true
    activeIndex.value = 0
  }
}

function clear(): void {
  clearTimeout(debounceTimer)
  controller?.abort()
  query.value = ''
  suggestions.value = []
  status.value = 'idle'
  close()
  inputRef.value?.focus()
}

function moveActive(step: number): void {
  const count = suggestions.value.length
  if (!count) return
  isOpen.value = true
  activeIndex.value = (activeIndex.value + step + count) % count
}

function onKeydown(event: KeyboardEvent): void {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      moveActive(1)
      break
    case 'ArrowUp':
      event.preventDefault()
      moveActive(-1)
      break
    case 'Enter': {
      // Free-text searches aren't allowed: Enter only confirms a highlighted suggestion.
      event.preventDefault()
      const result = isOpen.value ? suggestions.value[activeIndex.value] : undefined
      if (result) choose(result)
      break
    }
    case 'Escape':
      close()
      break
  }
}
</script>

<template>
  <div class="relative">
    <label :for="inputId" class="sr-only">Search for a place</label>
    <div
      class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-sm transition focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-200"
    >
      <svg class="size-5 shrink-0 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fill-rule="evenodd"
          d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.45 4.39l3.08 3.08a.75.75 0 1 1-1.06 1.06l-3.08-3.08A7 7 0 0 1 2 9Z"
          clip-rule="evenodd"
        />
      </svg>
      <input
        :id="inputId"
        ref="input"
        v-model="query"
        type="text"
        role="combobox"
        autocomplete="off"
        spellcheck="false"
        aria-autocomplete="list"
        :aria-expanded="isOpen"
        :aria-controls="listboxId"
        :aria-activedescendant="isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined"
        placeholder="Search for a city, e.g. Thessaloniki"
        class="w-full bg-transparent py-3 text-slate-900 outline-none placeholder:text-slate-400"
        @input="onInput"
        @keydown="onKeydown"
        @focus="onFocus"
        @blur="close"
      >
      <button
        v-if="query"
        type="button"
        class="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        aria-label="Clear search"
        @mousedown.prevent
        @click="clear"
      >
        <svg class="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
        </svg>
      </button>
    </div>

    <ul
      v-if="isOpen"
      :id="listboxId"
      role="listbox"
      class="absolute inset-x-0 top-full z-[1100] mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
    >
      <li v-if="status === 'loading' && !suggestions.length" class="px-4 py-3 text-sm text-slate-500">
        Searching…
      </li>
      <li v-else-if="status === 'error'" class="px-4 py-3 text-sm text-red-600">
        Place search is unavailable right now. Please try again in a moment.
      </li>
      <li v-else-if="!suggestions.length" class="px-4 py-3 text-sm text-slate-500">
        No places match “{{ query.trim() }}”.
      </li>
      <template v-else>
        <li
          v-for="(result, index) in suggestions"
          :id="optionId(index)"
          :key="result.id"
          role="option"
          :aria-selected="index === activeIndex"
          class="flex cursor-pointer items-baseline gap-2 px-4 py-2.5"
          :class="index === activeIndex ? 'bg-sky-50' : 'hover:bg-slate-50'"
          @mousedown.prevent
          @mouseenter="activeIndex = index"
          @click="choose(result)"
        >
          <span class="font-medium text-slate-900">{{ result.name }}</span>
          <span class="truncate text-sm text-slate-500">{{ regionOf(result) }}</span>
        </li>
      </template>
    </ul>
  </div>
</template>
