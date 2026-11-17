<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { motionEnabled } from './motion'

const props = defineProps({
  theme: { type: String, default: 'dark' },
})

const canvas = ref()
let context
let hero
let resizeObserver
let viewObserver
let inView = false
let width = 0
let height = 0
let stars = []
let frame = 0
let lastTime = 0
let elapsed = 0
let pointerX = 0
let pointerY = 0
let pointerActive = false
let pointerInfluence = 0

const palettes = {
  dark: { line: '159, 165, 248', point: '#bbb8f6', highlight: '#79dcff', cursor: '132, 176, 255' },
  light: { line: '95, 77, 151', point: '#6553a3', highlight: '#306d9a', cursor: '86, 73, 146' },
}

function seedStars() {
  const count = Math.round(Math.min(110, Math.max(38, width * height / 9900)))
  let seed = 8246
  function random() {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  stars = Array.from({ length: count }, () => ({
    centerX: random() * width,
    centerY: random() * height,
    phase: random() * Math.PI * 2,
    speed: 0.28 + random() * 0.44,
    drift: 10 + random() * 22,
    radius: random() > 0.87 ? 1.8 : 1.15,
    highlight: random() > 0.74,
    x: 0,
    y: 0,
  }))
}

function paint() {
  if (!context || width === 0 || height === 0) return
  const colors = palettes[props.theme] ?? palettes.dark
  context.clearRect(0, 0, width, height)
  const linkRange = Math.min(132, Math.max(87, width * 0.12))
  const linkRangeSquared = linkRange * linkRange
  const pointerRadius = 190
  const time = elapsed / 1000

  for (const star of stars) {
    star.x = star.centerX + Math.sin(time * star.speed + star.phase) * star.drift
    star.y = star.centerY + Math.cos(time * star.speed * 0.8 + star.phase) * star.drift
    if (pointerInfluence > 0.01) {
      const dx = pointerX - star.x
      const dy = pointerY - star.y
      const strength = Math.max(0, 1 - Math.hypot(dx, dy) / pointerRadius)
      star.x += dx * strength * 0.2 * pointerInfluence
      star.y += dy * strength * 0.2 * pointerInfluence
    }
  }

  context.lineWidth = 0.85
  for (let i = 0; i < stars.length; i += 1) {
    const a = stars[i]
    for (let j = i + 1; j < stars.length; j += 1) {
      const b = stars[j]
      const dx = a.x - b.x
      const dy = a.y - b.y
      const distanceSquared = dx * dx + dy * dy
      if (distanceSquared >= linkRangeSquared) continue
      const opacity = (1 - distanceSquared / linkRangeSquared) * 0.29
      context.strokeStyle = `rgba(${colors.line}, ${opacity})`
      context.beginPath()
      context.moveTo(a.x, a.y)
      context.lineTo(b.x, b.y)
      context.stroke()
    }
  }

  for (const star of stars) {
    if (pointerInfluence > 0.01) {
      context.globalAlpha = 1
      const distance = Math.hypot(pointerX - star.x, pointerY - star.y)
      if (distance < pointerRadius) {
        const opacity = (1 - distance / pointerRadius) * 0.5 * pointerInfluence
        context.strokeStyle = `rgba(${colors.cursor}, ${opacity})`
        context.beginPath()
        context.moveTo(pointerX, pointerY)
        context.lineTo(star.x, star.y)
        context.stroke()
      }
    }
    context.globalAlpha = 0.6 + Math.sin(time * 1.55 + star.phase) * 0.23
    context.fillStyle = star.highlight ? colors.highlight : colors.point
    context.beginPath()
    context.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
    context.fill()
  }
  context.globalAlpha = 1
}

function animate(now) {
  if (now - lastTime >= 28) {
    elapsed += Math.min(66, now - lastTime)
    lastTime = now
    pointerInfluence += ((pointerActive ? 1 : 0) - pointerInfluence) * 0.13
    paint()
  }
  frame = requestAnimationFrame(animate)
}

function updateAnimation() {
  if (inView && !document.hidden && motionEnabled.value) {
    if (!frame) {
      lastTime = performance.now()
      frame = requestAnimationFrame(animate)
    }
    return
  }
  cancelAnimationFrame(frame)
  frame = 0
  pointerActive = false
  pointerInfluence = 0
  if (!motionEnabled.value) elapsed = 0
  paint()
}

function resize() {
  const bounds = canvas.value.getBoundingClientRect()
  if (!bounds.width || !bounds.height || (bounds.width === width && bounds.height === height)) return
  width = bounds.width
  height = bounds.height
  const density = Math.min(window.devicePixelRatio || 1, 1.6, Math.sqrt(3200000 / (width * height)))
  canvas.value.width = Math.round(width * density)
  canvas.value.height = Math.round(height * density)
  context.setTransform(density, 0, 0, density, 0, 0)
  seedStars()
  paint()
}

function movePointer(event) {
  if (!frame || event.pointerType !== 'mouse') return
  const bounds = canvas.value.getBoundingClientRect()
  pointerX = event.clientX - bounds.left
  pointerY = event.clientY - bounds.top
  pointerActive = true
}

function leavePointer() {
  pointerActive = false
}

watch(() => props.theme, paint)
watch(motionEnabled, () => { if (context) updateAnimation() })

onMounted(() => {
  context = canvas.value.getContext('2d')
  if (!context) return
  hero = canvas.value.closest('.hero')
  resize()
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas.value)
  viewObserver = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting
    updateAnimation()
  })
  viewObserver.observe(canvas.value)
  document.addEventListener('visibilitychange', updateAnimation)
  hero.addEventListener('pointermove', movePointer, { passive: true })
  hero.addEventListener('pointerleave', leavePointer)
})

onUnmounted(() => {
  cancelAnimationFrame(frame)
  resizeObserver?.disconnect()
  viewObserver?.disconnect()
  document.removeEventListener('visibilitychange', updateAnimation)
  hero?.removeEventListener('pointermove', movePointer)
  hero?.removeEventListener('pointerleave', leavePointer)
})
</script>

<template>
  <div class="hero-atmosphere" aria-hidden="true">
    <div class="hero-grid"></div>
    <canvas ref="canvas" class="hero-constellation"></canvas>
  </div>
</template>
