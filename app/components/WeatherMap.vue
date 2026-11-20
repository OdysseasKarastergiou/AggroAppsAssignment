<script setup lang="ts">
import L from 'leaflet'
import type { SavedPlace, Selection } from '~/types/weather'

const props = defineProps<{
  selection: Selection | null
  savedPlaces: SavedPlace[]
}>()

const emit = defineEmits<{
  pick: [latitude: number, longitude: number]
  selectSaved: [place: SavedPlace]
}>()

const FOCUS_ZOOM = 9

const container = useTemplateRef('container')

let map: L.Map | undefined
let selectionMarker: L.Marker | undefined
const savedLayer = L.layerGroup()

const selectionIcon = L.divIcon({
  className: '',
  html: '<span class="map-marker"><span class="selection-pin"></span></span>',
  iconSize: [0, 0],
})

function savedIcon(place: SavedPlace): L.DivIcon {
  const snapshot = place.snapshot
  const content = snapshot
    ? `<span aria-hidden="true">${describeWeather(snapshot.weatherCode, snapshot.isDay).icon}</span>${formatTemperature(snapshot.temperature)}`
    : escapeHtml(place.name)
  return L.divIcon({
    className: '',
    html: `<span class="map-marker saved-marker">${content}</span>`,
    iconSize: [0, 0],
  })
}

function renderSavedPlaces(): void {
  savedLayer.clearLayers()
  for (const place of props.savedPlaces) {
    L.marker([place.latitude, place.longitude], { icon: savedIcon(place), title: place.name })
      .bindTooltip(escapeHtml(place.name), { direction: 'top', offset: [0, -14] })
      .on('click', () => emit('selectSaved', place))
      .addTo(savedLayer)
  }
}

function renderSelection(): void {
  if (!map) return

  const selection = props.selection
  if (!selection) {
    selectionMarker?.remove()
    selectionMarker = undefined
    return
  }

  const position = L.latLng(selection.place.latitude, selection.place.longitude)
  if (selectionMarker) selectionMarker.setLatLng(position)
  else selectionMarker = L.marker(position, { icon: selectionIcon, interactive: false, keyboard: false }).addTo(map)

  if (selection.source !== 'map') {
    map.flyTo(position, Math.max(map.getZoom(), FOCUS_ZOOM), { duration: 1.2 })
  }
}

function showAllSaved(): void {
  if (!map || !props.savedPlaces.length) return
  const bounds = L.latLngBounds(props.savedPlaces.map(place => [place.latitude, place.longitude]))
  map.flyToBounds(bounds, { padding: [60, 60], maxZoom: FOCUS_ZOOM, duration: 1.2 })
}

onMounted(() => {
  if (!container.value) return

  map = L.map(container.value, {
    center: [20, 10],
    zoom: 2,
    minZoom: 2,
    worldCopyJump: true,
  })

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map)

  savedLayer.addTo(map)

  map.on('click', (event: L.LeafletMouseEvent) => {
    const { lat, lng } = event.latlng.wrap()
    emit('pick', lat, lng)
  })

  renderSavedPlaces()
  renderSelection()
})

onBeforeUnmount(() => {
  map?.remove()
  map = undefined
})

watch(() => props.selection, renderSelection)
watch(() => props.savedPlaces, renderSavedPlaces)

defineExpose({ showAllSaved })
</script>

<template>
  <div
    ref="container"
    class="h-[60vh] min-h-[420px] w-full overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-200 lg:h-[calc(100vh-11rem)]"
    role="application"
    aria-label="World map. Click anywhere to see the weather there."
  />
</template>
