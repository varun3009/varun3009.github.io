<script setup>
import { ref } from 'vue'
import { ArrowLeft, ArrowRight, ArrowUpRight, Github } from 'lucide-vue-next'
import PipelineLab from './PipelineLab.vue'

defineProps({ project: { type: Object, required: true } })
const step = ref(0)
</script>

<template>
  <main id="main" class="content-section study-page" tabindex="-1">
    <a class="inline-link" href="#projects"><ArrowLeft :size="16" /> All projects</a>
    <header class="study-title">
      <span class="eyebrow">{{ project.type }}</span>
      <h1 class="gradient-text">{{ project.title }}</h1>
      <p>{{ project.subtitle }}</p>
      <div class="case-actions" v-if="project.demo || project.repo">
        <a v-if="project.demo" class="button primary compact" :href="project.demo" target="_blank" rel="noopener noreferrer">Open live demo <ArrowUpRight :size="16" /></a>
        <a v-if="project.repo" class="button secondary compact" :href="project.repo" target="_blank" rel="noopener noreferrer"><Github :size="16" /> Source code</a>
      </div>
    </header>
    <section class="panel study-body" aria-labelledby="architecture-title">
      <h3 id="architecture-title">Explore the architecture</h3>
      <div class="architecture-flow" aria-label="Architecture stages">
        <template v-for="(node, index) in project.diagram" :key="node">
          <button type="button" :aria-pressed="step === index" @click="step = index">{{ node }}</button>
          <ArrowRight v-if="index < project.diagram.length - 1" :size="15" aria-hidden="true" />
        </template>
      </div>
      <p aria-live="polite">{{ project.nodes[step] }}</p>
    </section>
    <dl class="case-detail">
      <div><dt>Problem</dt><dd>{{ project.problem }}</dd></div>
      <div><dt>My contribution</dt><dd>{{ project.approach }}</dd></div>
      <div><dt>Engineering tradeoff</dt><dd>{{ project.challenge }}</dd></div>
      <div><dt>Result and scope</dt><dd>{{ project.outcome }}</dd></div>
    </dl>
    <ul class="tags" aria-label="Tech stack"><li v-for="tag in project.stack" :key="tag">{{ tag }}</li></ul>
    <section v-if="project.id === 'movieverse'" class="study-demo" aria-label="Interactive poster pipeline replay">
      <PipelineLab />
    </section>
  </main>
</template>
