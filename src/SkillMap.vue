<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { Cpu } from 'lucide-vue-next'
import { motionEnabled } from './motion'

const skills = [
  { name: '.NET', color: '#a692ff', x: 27, y: 20, text: 'Production REST APIs, scheduling jobs, and cloud SDKs.' },
  { name: 'Python', color: '#51d5f2', x: 72, y: 15, text: 'Image workers, model training, and agent workflows.' },
  { name: 'AWS / Azure', color: '#fac879', x: 86, y: 34, text: 'One SDK unifying Amazon S3 and Azure Blob.' },
  { name: 'LangGraph', color: '#efa2e0', x: 84, y: 65, text: 'Six agents for a stateful SQL assistant.' },
  { name: 'PyTorch', color: '#f39a93', x: 65, y: 83, text: 'Distributed training on four NVIDIA A5000 GPUs.' },
  { name: 'Vue.js', color: '#68e2bc', x: 35, y: 84, text: 'Access-control workflows at DeltaX and this portfolio.' },
  { name: 'RabbitMQ', color: '#f6b477', x: 12, y: 66, text: 'Two queues decouple work requests and completion events.' },
  { name: 'SQL', color: '#64dec6', x: 13, y: 40, text: 'Data models, Shopify ingestion, and query workflows.' },
]

const map = ref()
const portrait = ref()
const hovered = ref(null)
const focused = ref(null)
const selected = ref(null)
const detail = computed(() => skills[hovered.value ?? focused.value ?? selected.value])
const connections = [[0, 3], [0, 6], [1, 4], [1, 7], [3, 5], [2, 6]]
const routes = [...skills.map((_, index) => [-1, index]), ...connections]
const buttons = []
const wires = []
const packets = []
const center = { x: 50, y: 50 }
const nodes = skills.map(({ x, y }) => ({ x, y, dx: 0, dy: 0, vx: 0, vy: 0, edge: 0 }))
const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
const packetCount = 12
let width = 1
let height = 1
let frame = 0
let lastTime = 0
let elapsed = 0
let orbitTime = 0
let inView = true
let drag
let skipClick
let resizeObserver
let intersectionObserver

function schedule() {
  if (!frame && inView && !document.hidden) frame = requestAnimationFrame(draw)
}

function stop() {
  cancelAnimationFrame(frame)
  frame = 0
  lastTime = 0
}

function measure() {
  const bounds = map.value.getBoundingClientRect()
  width = bounds.width || 1
  height = bounds.height || 1
  buttons.forEach((button, index) => {
    nodes[index].edge = Math.min(40, (button.offsetWidth / 2 + 2) * 100 / width)
  })
  schedule()
}

function draw(time) {
  frame = 0
  const animate = motionEnabled.value
  const dt = animate && lastTime ? Math.min((time - lastTime) / 1000, .04) : 0
  lastTime = animate ? time : 0
  elapsed += dt
  if (hovered.value === null || drag?.moved) orbitTime += dt

  const blend = 1 - Math.exp(-9 * dt)
  pointer.x = animate ? pointer.x + (pointer.tx - pointer.x) * blend : 0
  pointer.y = animate ? pointer.y + (pointer.ty - pointer.y) * blend : 0
  center.x = 50 + pointer.x * 1.6
  center.y = 50 + pointer.y * 1.6
  portrait.value.style.translate = `${(center.x - 50) * width / 100}px ${(center.y - 50) * height / 100}px`

  const turn = animate ? Math.sin(orbitTime * .62) * (width < 420 ? .14 : .30) : 0
  const cosine = Math.cos(turn)
  const sine = Math.sin(turn)
  nodes.forEach((node, index) => {
    const skill = skills[index]
    const x = skill.x - 50
    const y = skill.y - 50
    const breathe = animate ? 1 + .045 * Math.sin(orbitTime * .87 + index * 1.3) : 1
    const homeX = center.x + (x * cosine - y * sine) * breathe + pointer.x
    const homeY = center.y + (x * sine + y * cosine) * breathe + pointer.y

    if (drag?.index === index && drag.moved) {
      node.dx = drag.targetX - homeX
      node.dy = drag.targetY - homeY
    } else if (animate) {
      node.vx -= (46 * node.dx + 9 * node.vx) * dt
      node.vy -= (46 * node.dy + 9 * node.vy) * dt
      node.dx += node.vx * dt
      node.dy += node.vy * dt
    } else {
      node.dx = node.dy = 0
      node.vx = node.vy = 0
    }

    node.x = Math.max(node.edge, Math.min(100 - node.edge, homeX + node.dx))
    node.y = Math.max(8, Math.min(92, homeY + node.dy))
    buttons[index].style.translate = `${(node.x - skill.x) * width / 100}px ${(node.y - skill.y) * height / 100}px`
  })

  routes.forEach(([start, end], index) => {
    const from = start === -1 ? center : nodes[start]
    const to = nodes[end]
    const wire = wires[index]
    wire.setAttribute('x1', from.x)
    wire.setAttribute('y1', from.y)
    wire.setAttribute('x2', to.x)
    wire.setAttribute('y2', to.y)
  })

  if (animate) {
    packets.forEach((packet, index) => {
      const [start, end] = routes[(index * 5) % routes.length]
      const from = start === -1 ? center : nodes[start]
      const to = nodes[end]
      const progress = (elapsed * (.33 + index % 4 * .075) + index * .26) % 1
      const travel = index % 3 === 0 ? 1 - progress : progress
      packet.setAttribute('cx', from.x + (to.x - from.x) * travel)
      packet.setAttribute('cy', from.y + (to.y - from.y) * travel)
      packet.setAttribute('opacity', .78 * Math.sin(progress * Math.PI))
    })
    schedule()
  }
}

function start(event, index) {
  if (drag || !event.isPrimary || event.button !== 0) return
  const bounds = map.value.getBoundingClientRect()
  skipClick = null
  drag = {
    index,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    offsetX: event.clientX - bounds.left - nodes[index].x * bounds.width / 100,
    offsetY: event.clientY - bounds.top - nodes[index].y * bounds.height / 100,
    moved: false,
  }
  event.currentTarget.setPointerCapture(event.pointerId)
}

function move(event) {
  const bounds = map.value.getBoundingClientRect()
  if (drag && drag.pointerId === event.pointerId) {
    if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 6) return
    drag.moved = true
    selected.value = drag.index
    drag.targetX = (event.clientX - bounds.left - drag.offsetX) * 100 / width
    drag.targetY = (event.clientY - bounds.top - drag.offsetY) * 100 / height
    schedule()
  } else if (event.pointerType === 'mouse' && motionEnabled.value) {
    pointer.tx = (event.clientX - bounds.left) * 2 / width - 1
    pointer.ty = (event.clientY - bounds.top) * 2 / height - 1
  }
}

function finish(event) {
  if (!drag || event.pointerId !== drag.pointerId) return
  const { index, moved } = drag
  drag = null
  if (moved) {
    skipClick = index
    nodes[index].vx = nodes[index].vy = 0
  }
  schedule()
}

function leave() {
  hovered.value = null
  pointer.tx = pointer.ty = 0
}

function enter(event, index) {
  if (event.pointerType === 'mouse') hovered.value = index
}

function activate(event, index) {
  if (event.detail && skipClick === index) {
    skipClick = null
    return
  }
  selected.value = selected.value === index ? null : index
}

function onVisibilityChange() {
  if (document.hidden) stop()
  else schedule()
}

watch(motionEnabled, () => {
  stop()
  schedule()
})

onMounted(() => {
  measure()
  resizeObserver = new ResizeObserver(measure)
  resizeObserver.observe(map.value)
  intersectionObserver = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting
    if (inView) schedule()
    else stop()
  })
  intersectionObserver.observe(map.value)
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onUnmounted(() => {
  stop()
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<template>
  <div class="map-widget" role="group" aria-label="Interactive skill map" aria-describedby="map-instructions">
    <span id="map-instructions" class="sr-only">Select a skill or move focus to it to learn where I used it.</span>
    <div ref="map" class="skill-map" @pointermove="move" @pointerleave="leave" @pointerup="finish" @pointercancel="finish" @lostpointercapture="finish">
      <svg class="orbit-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <ellipse cx="50" cy="50" rx="25" ry="25" />
        <ellipse cx="50" cy="50" rx="41" ry="40" />
        <line
          v-for="([start, end], index) in routes" :key="index" :ref="element => wires[index] = element"
          :x1="start === -1 ? 50 : skills[start].x" :y1="start === -1 ? 50 : skills[start].y" :x2="skills[end].x" :y2="skills[end].y"
          :class="{ 'cross-link': start !== -1, highlighted: detail === skills[end] }" :style="{ '--spoke-color': skills[end].color }"
        />
        <g v-if="motionEnabled" class="orbit-packets">
          <circle v-for="index in packetCount" :key="index" :ref="element => packets[index - 1] = element" r=".48" opacity="0" />
        </g>
      </svg>
      <div ref="portrait" class="map-center" :class="{ 'motion-ready': motionEnabled }">
        <div class="portrait-ring"><img src="/profile-photo.webp" width="400" height="400" alt="Varun Teja Goud" fetchpriority="high"></div>
        <span class="service-label"><Cpu :size="11" aria-hidden="true" /> varun.service</span>
      </div>
      <button
        v-for="(skill, index) in skills" :key="skill.name" :ref="element => buttons[index] = element"
        type="button" class="skill-node"
        :style="{ left: skill.x + '%', top: skill.y + '%', '--node-color': skill.color }"
        :aria-pressed="selected === index" :aria-description="skill.text"
        @pointerenter="enter($event, index)"
        @pointerleave="hovered = null" @focus="focused = index" @blur="focused = null"
        @pointerdown="start($event, index)" @click="activate($event, index)"
      ><span class="node-dot"></span>{{ skill.name }}</button>
    </div>
    <p class="map-legend" aria-hidden="true"><span v-if="detail"><strong>{{ detail.name }}</strong> · {{ detail.text }}</span><span v-else>Select or drag a skill to explore my stack.</span></p>
  </div>
</template>

<style scoped>
.orbit-lines {
  display: block;
  pointer-events: none;
}

.orbit-lines line {
  transition: stroke .22s ease, opacity .22s ease;
}

.orbit-lines line.cross-link {
  opacity: .35;
  stroke-width: .11;
}

.orbit-lines line.highlighted {
  stroke: var(--spoke-color);
  opacity: .7;
}

.orbit-packets {
  fill: var(--cyan);
}

.map-center {
  isolation: isolate;
  pointer-events: none;
}

.map-center::before {
  position: absolute;
  z-index: -1;
  inset: -4px;
  border: 1px solid var(--accent);
  border-radius: 50%;
  opacity: 0;
  content: '';
}

.motion-ready::before {
  animation: signal-ring 4s ease-out infinite;
}

.skill-node {
  touch-action: none;
}

.skill-node:is(:hover, :focus-visible, [aria-pressed='true']) {
  z-index: 1;
}

.map-legend strong {
  color: var(--text);
  font-weight: 500;
}

@keyframes signal-ring {
  0% { opacity: .55; transform: scale(1); }
  58%, 100% { opacity: 0; transform: scale(1.4); }
}

@media (prefers-reduced-motion: reduce) {
  .motion-ready::before { animation: none; }
  .orbit-lines line { transition: none; }
}

:global(:root[data-motion='paused']) .orbit-lines line {
  transition: none;
}
</style>
