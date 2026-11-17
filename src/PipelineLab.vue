<script setup>
import { onUnmounted, ref, watch } from 'vue'
import { ArrowRight, Check, Circle, Database, FileImage, Layers3, Play, RotateCcw, Server } from 'lucide-vue-next'
import { motionEnabled } from './motion'

const stages = [
  { title: 'Accept', tech: '.NET API', icon: Server, event: 'API accepts a poster upload and hands off the processing job.' },
  { title: 'Queue', tech: 'RabbitMQ', icon: Layers3, event: 'RabbitMQ delivers the job to a Python worker.' },
  { title: 'Transform', tech: 'Python', icon: FileImage, event: 'Worker resizes the poster to 400 × 200 and applies a watermark.' },
  { title: 'Persist', tech: 'S3 + Redis', icon: Database, event: 'Worker stores the result in S3. A completion event updates the cached result.' },
]
const step = ref(0)
const running = ref(false)
let timer

function advance() {
  step.value += 1
  if (step.value === stages.length) {
    running.value = false
    return
  }
  timer = setTimeout(advance, 610)
}

function run() {
  step.value = 0
  if (!motionEnabled.value) {
    step.value = stages.length
    return
  }
  running.value = true
  advance()
}

watch(motionEnabled, enabled => {
  if (!enabled && running.value) {
    clearTimeout(timer)
    step.value = stages.length
    running.value = false
  }
})

onUnmounted(() => clearTimeout(timer))
</script>

<template>
  <div class="panel pipeline">
    <div class="window-bar">
      <div class="window-label"><span class="window-dots" aria-hidden="true"><i></i><i></i><i></i></span> movieverse.poster_pipeline</div>
      <button class="button primary compact" type="button" @click="run" :disabled="running">
        <RotateCcw v-if="step === stages.length" :size="15" /><Play v-else :size="15" />
        {{ running ? 'Running…' : step === stages.length ? 'Replay pipeline' : 'Run pipeline' }}
      </button>
    </div>
    <ol class="pipeline-stages">
      <li v-for="(stage, idx) in stages" :key="stage.title" :class="{ 'stage-active': running && step === idx + 1 }">
        <span class="stage-icon" :class="{ complete: step > idx }"><component :is="stage.icon" :size="20" /></span>
        <span><strong>{{ stage.title }}</strong><small>{{ stage.tech }}</small></span>
        <ArrowRight v-if="idx < stages.length - 1" class="stage-arrow" :size="15" aria-hidden="true" />
      </li>
    </ol>
    <div class="pipeline-output" aria-live="polite">
      <span class="mono pipeline-status"><Check v-if="step === stages.length" :size="15" /><Circle v-else :size="11" />{{ step === stages.length ? 'Complete' : running ? 'Processing' : 'Ready' }}</span>
      <p :key="step" :class="{ 'stage-event': step }">{{ step ? stages[step - 1].event : 'Run a simulated poster upload to follow the API, queue, worker, and storage handoff.' }}</p>
    </div>
  </div>
</template>
