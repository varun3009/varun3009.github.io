<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { motionEnabled } from './motion'

const props = defineProps({
  groups: { type: Array, required: true },
  activeGroup: { type: String, default: 'All' },
})

const stage = ref()
const stageWidth = ref(Math.max(260, window.innerWidth - 64))
const positioned = ref(false)
const visible = ref(false)
const held = ref(null)
const selected = ref(null)
const tabStop = ref(null)
const elements = new Map()
const active = computed(() => props.groups.find(group => group.name === props.activeGroup))

function orderedSkills(group) {
  return [...new Set([...(group.featured ?? []), ...group.items])].filter(skill => group.items.includes(skill))
}

const bubbles = computed(() => {
  const create = (skill, group) => ({
    id: group.name + '/' + skill,
    skill,
    group: group.name,
    color: group.color,
    longestWord: Math.max(...skill.split(' ').map(word => word.length)),
  })
  if (active.value) return orderedSkills(active.value).map(skill => create(skill, active.value))

  const limit = stageWidth.value < 458 ? 18 : stageWidth.value < 760 ? 24 : 30
  const groups = props.groups.map(group => ({ group, skills: orderedSkills(group) }))
  const rounds = Math.max(0, ...groups.map(({ skills }) => skills.length))
  return Array.from({ length: rounds }, (_, index) => groups.flatMap(({ group, skills }) =>
    skills[index] ? [create(skills[index], group)] : [],
  )).flat().slice(0, limit)
})

const stageHeight = computed(() => {
  const narrow = stageWidth.value < 458
  if (active.value) return narrow ? 310 + Math.max(0, bubbles.value.length - 9) * 13 : 292
  return narrow ? 432 : 418
})
const selectedBubble = computed(() => bubbles.value.find(bubble => selected.value === bubble.id))
const keyboardAnchor = computed(() => bubbles.value.find(bubble => bubble.id === tabStop.value)?.id ?? bubbles.value[0]?.id)
let positions = []
let width = 0
let height = 0
let frame = 0
let previousTime = 0
let elapsed = 0
let resizeObserver
let intersectionObserver
let drag
let pointer
let focused
let ignoreClick

function bindBubble(id, element) {
  if (element) elements.set(id, element)
  else elements.delete(id)
}

function paint(node) {
  elements.get(node.id)?.style.setProperty('transform', `translate3d(${node.x - node.radius}px, ${node.y - node.radius}px, 0)`)
}

function skillSize(label) {
  let hash = 0
  for (const letter of label) hash = (hash * 31 + letter.codePointAt(0)) >>> 0
  const proportion = stageWidth.value < 458 ? 0.79 : stageWidth.value < 600 ? 0.88 : stageWidth.value < 760 ? 0.94 : 1
  return (67 + hash % 28 + Math.max(0, label.length - 7) * 1.5) * proportion
}

function packBubbles() {
  const widthRatio = Math.sqrt(Math.max(0.72, Math.min(2.75, width / height)))
  const step = width < 458 ? 4.2 : 5.35
  const reach = Math.hypot(width / (2 * widthRatio), height * widthRatio / 2)
  const count = Math.ceil((reach / step) ** 2)
  const candidates = Array.from({ length: count }, (_, index) => {
    const angle = index * 2.399963
    const distance = step * Math.sqrt(index)
    return [
      width / 2 + Math.cos(angle) * distance * widthRatio,
      height / 2 + Math.sin(angle) * distance / widthRatio,
    ]
  }).filter(([x, y]) => x >= 7 && y >= 7 && x <= width - 7 && y <= height - 7)
  const ordered = bubbles.value.map((bubble, index) => ({
    ...bubble, radius: skillSize(bubble.skill) / 2, index,
  })).sort((a, b) => b.radius - a.radius)

  for (const scale of [1, 0.94, 0.88, 0.82]) {
    const packed = []
    for (const bubble of ordered) {
      const radius = bubble.radius * scale
      const edge = radius + 7
      const point = candidates.find(([x, y]) => x >= edge && y >= edge && x <= width - edge && y <= height - edge
        && packed.every(other => (x - other.homeX) ** 2 + (y - other.homeY) ** 2 >= (radius + other.radius + 7) ** 2))
      if (!point) break
      packed.push({ ...bubble, radius, homeX: point[0], homeY: point[1] })
    }
    if (packed.length === ordered.length) return packed
  }
  return []
}

function placeBubbles(enter = false) {
  const actualWidth = stage.value?.clientWidth ?? 0
  const actualHeight = stage.value?.clientHeight ?? 0
  if (!actualWidth || !actualHeight) return
  const previous = new Map(positions.map(node => [node.id, node]))
  width = actualWidth
  height = actualHeight
  endDrag()
  focused = null
  pointer = null

  const packed = packBubbles()
  positions = packed.map(home => {
    const prior = previous.get(home.id)
    const canAnimate = enter && visible.value && motionEnabled.value
    const node = {
      ...home,
      x: canAnimate ? (prior?.x ?? home.homeX + 16 * Math.cos(home.index * 2.4)) : home.homeX,
      y: canAnimate ? (prior?.y ?? home.homeY + 18) : home.homeY,
      vx: 0, vy: canAnimate && !prior ? -52 : 0, phase: home.index * 2.4, freeUntil: 0,
    }
    keepInside(node)
    elements.get(node.id)?.style.setProperty('--bubble-size', `${2 * node.radius}px`)
    paint(node)
    return node
  })
  if (!positions.length) {
    for (const element of elements.values()) {
      element.style.removeProperty('transform')
      element.style.removeProperty('--bubble-size')
    }
  }
  positioned.value = positions.length > 0
  syncAnimation()
}

function keepInside(node) {
  const edge = node.radius + 4
  const maxX = width - edge
  const maxY = height - edge
  if (node.x < edge || node.x > maxX) node.vx *= -0.58
  if (node.y < edge || node.y > maxY) node.vy *= -0.58
  node.x = Math.max(edge, Math.min(maxX, node.x))
  node.y = Math.max(edge, Math.min(maxY, node.y))
}

function isHeld(node) {
  return drag?.node === node || (focused === node.id && node.freeUntil <= elapsed)
}

function collide() {
  for (let i = 0; i < positions.length; i++) {
    const a = positions[i]
    const weightA = isHeld(a) ? 0 : 1 / a.radius
    for (let j = i + 1; j < positions.length; j++) {
      const b = positions[j]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const target = a.radius + b.radius + 4
      const squared = dx * dx + dy * dy
      if (squared >= target * target) continue

      const weightB = isHeld(b) ? 0 : 1 / b.radius
      const mass = weightA + weightB
      if (!mass) continue
      const distance = Math.sqrt(squared)
      const normalX = distance > 0.001 ? dx / distance : 1
      const normalY = distance > 0.001 ? dy / distance : 0
      const correction = (target - distance) / mass * 0.8
      a.x -= normalX * correction * weightA
      a.y -= normalY * correction * weightA
      b.x += normalX * correction * weightB
      b.y += normalY * correction * weightB

      const approach = (b.vx - a.vx) * normalX + (b.vy - a.vy) * normalY
      if (approach >= 0) continue
      const impulse = -1.27 * approach / mass
      a.vx -= impulse * normalX * weightA
      a.vy -= impulse * normalY * weightA
      b.vx += impulse * normalX * weightB
      b.vy += impulse * normalY * weightB
    }
  }
}

function animate(time) {
  frame = 0
  const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.032) : 0
  previousTime = time
  elapsed += delta
  const damping = Math.exp(-2.85 * delta)
  const drift = width < 458 ? 10 : 17

  for (const node of positions) {
    if (isHeld(node)) continue
    const targetX = node.homeX + Math.sin(elapsed * 0.91 + node.phase) * drift
    const targetY = node.homeY + Math.cos(elapsed * 0.79 + node.phase) * drift
    let forceX = (targetX - node.x) * 8.5
    let forceY = (targetY - node.y) * 8.5

    if (pointer && !drag && pointer.id !== node.id) {
      const dx = node.x - pointer.x
      const dy = node.y - pointer.y
      const squared = dx * dx + dy * dy
      const range = node.radius + 74
      if (squared > 0 && squared < range * range) {
        const distance = Math.sqrt(squared)
        const force = (1 - distance / range) * 600
        forceX += force * dx / distance
        forceY += force * dy / distance
      }
    }

    node.vx = (node.vx + forceX * delta) * damping
    node.vy = (node.vy + forceY * delta) * damping
    node.x += node.vx * delta
    node.y += node.vy * delta
    keepInside(node)
  }

  collide()
  collide()
  for (const node of positions) {
    keepInside(node)
    paint(node)
  }
  frame = requestAnimationFrame(animate)
}

function syncAnimation() {
  if (motionEnabled.value && visible.value && !document.hidden && positions.length) {
    if (!frame) frame = requestAnimationFrame(animate)
    return
  }
  cancelAnimationFrame(frame)
  frame = 0
  previousTime = 0
}

function measure() {
  const nextWidth = stage.value?.clientWidth
  if (!nextWidth) return
  if (stageWidth.value !== nextWidth) stageWidth.value = nextWidth
  else if (width !== nextWidth || height !== stage.value.clientHeight) placeBubbles()
}

function startDrag(event, id) {
  if (!motionEnabled.value || event.button !== 0 || !event.isPrimary || drag) return
  const node = positions.find(item => item.id === id)
  if (!node) return
  event.currentTarget.setPointerCapture(event.pointerId)
  ignoreClick = null
  drag = { node, id: event.pointerId, x: event.clientX, y: event.clientY, time: event.timeStamp, vx: 0, vy: 0, moved: false }
  pointer = null
}

function movePointer(event) {
  if (drag) {
    if (event.pointerId !== drag.id) return
    const dx = event.clientX - drag.x
    const dy = event.clientY - drag.y
    if (!drag.moved && Math.hypot(dx, dy) < 5) return
    const delta = Math.max(12, event.timeStamp - drag.time) / 1000
    drag.vx = 0.45 * drag.vx + 0.55 * dx / delta
    drag.vy = 0.45 * drag.vy + 0.55 * dy / delta
    drag.node.vx = drag.vx
    drag.node.vy = drag.vy
    drag.x = event.clientX
    drag.y = event.clientY
    drag.time = event.timeStamp
    drag.moved = true
    held.value = drag.node.id
    drag.node.x += dx
    drag.node.y += dy
    keepInside(drag.node)
    paint(drag.node)
    return
  }
  if (event.pointerType !== 'mouse' || !motionEnabled.value) return
  const bounds = stage.value.getBoundingClientRect()
  pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top, id: event.target.closest('.playground-bubble')?.dataset.bubble }
}

function endDrag(event) {
  if (!drag || (event && event.pointerId !== drag.id)) return
  const { node, moved } = drag
  const fling = event?.type === 'pointerup' && moved && event.timeStamp - drag.time < 95
  node.vx = fling ? Math.max(-920, Math.min(920, drag.vx)) : 0
  node.vy = fling ? Math.max(-920, Math.min(920, drag.vy)) : 0
  node.freeUntil = elapsed + 1.2
  if (moved) ignoreClick = node.id
  drag = null
  held.value = null
}

function selectBubble(event, id) {
  if (event.detail && ignoreClick === id) {
    ignoreClick = null
    return
  }
  selected.value = selected.value === id ? null : id
}

function focusBubble(event, id) {
  tabStop.value = id
  if (!event.target.matches(':focus-visible')) return
  focused = id
  const node = positions.find(item => item.id === id)
  if (node) node.vx = node.vy = 0
}

const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
function useKeyboard(event, id) {
  const direction = directions[event.key]
  if (!direction) return
  const [dx, dy] = direction
  const node = positions.find(item => item.id === id)
  if (event.shiftKey) {
    if (!motionEnabled.value || !node) return
    event.preventDefault()
    node.vx = dx * 145
    node.vy = dy * 145
    node.freeUntil = elapsed + 0.62
    return
  }

  event.preventDefault()
  let next
  if (node) {
    let best = Infinity
    for (const other of positions) {
      const x = other.x - node.x
      const y = other.y - node.y
      const forward = x * dx + y * dy
      if (forward <= 6) continue
      const distance = forward + Math.abs(x * dy - y * dx) * 2
      if (distance < best) {
        best = distance
        next = other.id
      }
    }
  }
  if (!next) {
    const index = bubbles.value.findIndex(bubble => bubble.id === id)
    const count = bubbles.value.length
    next = bubbles.value[(index + dx + dy + count) % count]?.id
  }
  elements.get(next)?.querySelector('button')?.focus()
}

watch([bubbles, stageWidth], () => {
  if (!selectedBubble.value) selected.value = null
  placeBubbles(true)
}, { flush: 'post' })

watch(motionEnabled, enabled => {
  if (!enabled) {
    endDrag()
    placeBubbles()
  }
  syncAnimation()
}, { flush: 'post' })

onMounted(() => {
  measure()
  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(stage.value)
  } else {
    window.addEventListener('resize', measure)
  }
  if ('IntersectionObserver' in window) {
    intersectionObserver = new IntersectionObserver(([entry]) => {
      visible.value = entry.isIntersecting
      if (!visible.value) {
        pointer = null
        endDrag()
      }
      syncAnimation()
    })
    intersectionObserver.observe(stage.value)
  } else {
    visible.value = true
    syncAnimation()
  }
  document.addEventListener('visibilitychange', syncAnimation)
})

onUnmounted(() => {
  cancelAnimationFrame(frame)
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  window.removeEventListener('resize', measure)
  document.removeEventListener('visibilitychange', syncAnimation)
})
</script>

<template>
  <figure class="panel skill-playground">
    <figcaption class="playground-caption">
      <slot name="toolbar" :visible-count="bubbles.length">
        <span>Skill clusters</span>
      </slot>
      <span v-if="motionEnabled" class="playground-hint">Drag to fling<span class="playground-mouse-hint"> · hover to scatter</span></span>
    </figcaption>
    <ul
      ref="stage"
      class="playground-stage"
      :class="{ 'is-positioned': positioned, 'has-motion': motionEnabled, 'is-playing': motionEnabled && visible }"
      :style="{ '--stage-height': stageHeight + 'px' }"
      :aria-label="active ? active.name + ' skills' : 'Featured skills'"
      @pointermove="movePointer"
      @pointerleave="pointer = null"
      @pointerup="endDrag"
      @pointercancel="endDrag"
      @lostpointercapture="endDrag"
    >
      <li
        v-for="(bubble, index) in bubbles"
        :key="bubble.id"
        :ref="element => bindBubble(bubble.id, element)"
        class="playground-bubble"
        :class="{ 'is-selected': selected === bubble.id, 'is-held': held === bubble.id }"
        :style="{ '--bubble-delay': Math.min(index, 15) * 15 + 'ms', '--label-length': bubble.longestWord }"
        :data-bubble="bubble.id"
        :data-color="bubble.color"
      >
        <button
          type="button"
          :aria-label="bubble.skill + ', ' + bubble.group"
          :aria-pressed="selected === bubble.id"
          :tabindex="bubble.id === keyboardAnchor ? 0 : -1"
          @pointerdown="startDrag($event, bubble.id)"
          @click="selectBubble($event, bubble.id)"
          @focus="focusBubble($event, bubble.id)"
          @blur="focused = null"
          @keydown="useKeyboard($event, bubble.id)"
        ><span>{{ bubble.skill }}</span></button>
      </li>
    </ul>
    <div class="playground-selection" aria-live="polite" aria-atomic="true">
      <template v-if="selectedBubble"><strong>{{ selectedBubble.skill }}</strong><span>{{ selectedBubble.group }}</span></template>
      <span v-else>Select a bubble to see its skill group.</span>
    </div>
  </figure>
</template>

<style scoped>
.skill-playground {
  margin: 0 0 16px;
  overflow: clip;
  background: radial-gradient(ellipse at 50% 56%, var(--raised), var(--panel) 73%);
}

.playground-caption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 16px;
  border-bottom: 1px solid var(--line);
  background: var(--raised);
  color: var(--muted);
  font: .7rem var(--mono);
}

.playground-hint { flex: 0 0 auto; }

.playground-stage {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: center;
  gap: 8px;
  min-height: var(--stage-height);
  overflow: clip;
  list-style: none;
  isolation: isolate;
}

.playground-stage.is-positioned { height: var(--stage-height); }

.playground-stage::before {
  position: absolute;
  z-index: -1;
  inset: 0;
  content: '';
  background-image: radial-gradient(circle, var(--quiet) 0.65px, transparent 1px);
  background-size: 20px 20px;
  opacity: .23;
  mask-image: radial-gradient(ellipse at center, black, transparent 78%);
}

.playground-bubble {
  --hue: #b297ff;
  --fill: 35%;
  --edge: 55%;
  --glow: 24%;
  width: var(--bubble-size, 60px);
  height: var(--bubble-size, 60px);
  flex: 0 0 auto;
}

.playground-stage.is-positioned .playground-bubble { position: absolute; top: 0; left: 0; }
.playground-stage.is-playing .playground-bubble { will-change: transform; }

.playground-bubble button {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  padding: 3px;
  border: 1px solid color-mix(in srgb, var(--hue) var(--edge), transparent);
  border-radius: 50%;
  background: radial-gradient(circle at 37% 24%, color-mix(in srgb, var(--hue) var(--fill), var(--panel)), var(--panel) 92%);
  box-shadow: 0 0 21px color-mix(in srgb, var(--hue) var(--glow), transparent),
    inset 0 0 14px color-mix(in srgb, var(--hue) var(--glow), transparent);
  color: var(--text);
  text-align: center;
  font: 650 clamp(.65rem, 1.2vw, .82rem)/1.15 'Inter Variable', Inter, sans-serif;
  letter-spacing: -.025em;
  user-select: none;
  touch-action: pan-y;
  cursor: pointer;
  transition: border-color .22s, box-shadow .22s, scale .26s cubic-bezier(.2,.8,.3,1.35);
}

.playground-bubble button span {
  max-width: 100%;
  font-size: max(.55rem, min(1em, calc((var(--bubble-size, 60px) - 8px) / (var(--label-length) * .61))));
  text-wrap: balance;
}
.is-playing .playground-bubble button {
  cursor: grab;
  animation: bubble-emerge .48s cubic-bezier(.2,.75,.35,1.1) var(--bubble-delay) both;
}
.is-playing .playground-bubble button:hover { scale: 1.07; }
.is-playing .playground-bubble.is-held button { cursor: grabbing; scale: 1.12; }
.is-playing .playground-bubble button:focus-visible { animation: none; }

@keyframes bubble-emerge {
  from { opacity: .2; transform: scale(.79); }
  to { opacity: 1; transform: scale(1); }
}
.playground-bubble[data-color='blue'] { --hue: #92a2ff; }
.playground-bubble[data-color='cyan'] { --hue: #67c9ef; }
.playground-bubble[data-color='green'] { --hue: #62d9b1; }
.playground-bubble[data-color='pink'] { --hue: #e88aca; }
.playground-bubble[data-color='amber'] { --hue: #f1b36c; }

.playground-bubble:is(.is-selected, .is-held, :focus-within, :hover) {
  --fill: 48%;
  --edge: 90%;
  --glow: 34%;
  z-index: 2;
}

.playground-bubble button:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: 2px;
}

.playground-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 37px;
  padding: 6px 13px;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font: .68rem var(--mono);
}

.playground-selection strong { color: var(--text); }
.playground-selection strong + span::before { content: '·'; padding-right: 8px; }

@media (max-width: 700px) {
  .playground-caption { align-items: flex-start; flex-direction: column; }
}

@media (max-width: 460px) {
  .playground-caption { padding: 11px; gap: 7px; }
}

@media (hover: none) {
  .playground-mouse-hint { display: none; }
}
</style>
