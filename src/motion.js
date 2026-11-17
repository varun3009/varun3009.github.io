import { computed, readonly, ref, watch } from 'vue'

const preferenceKey = 'portfolio-motion-paused'
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
const reducedMotion = ref(motionQuery.matches)
const manuallyPaused = ref(false)

try {
  manuallyPaused.value = localStorage.getItem(preferenceKey) === 'true'
} catch {}

export const systemReducedMotion = readonly(reducedMotion)
export const motionEnabled = computed(() => !reducedMotion.value && !manuallyPaused.value)

export function toggleMotion() {
  manuallyPaused.value = !manuallyPaused.value
  try {
    localStorage.setItem(preferenceKey, String(manuallyPaused.value))
  } catch {}
}

function syncSystemMotion(event) {
  reducedMotion.value = event.matches
}

motionQuery.addEventListener('change', syncSystemMotion)
const stopWatching = watch(motionEnabled, enabled => {
  document.documentElement.dataset.motion = enabled ? 'running' : 'paused'
}, { immediate: true, flush: 'sync' })

import.meta.hot?.dispose(() => {
  motionQuery.removeEventListener('change', syncSystemMotion)
  stopWatching()
})
