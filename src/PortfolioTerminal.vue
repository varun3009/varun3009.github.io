<script setup>
import { ref } from 'vue'
import { CornerDownLeft, Terminal } from 'lucide-vue-next'
import { person } from './portfolio'

const destinations = { experience: '#experience', projects: '#projects', coding: '#coding', skills: '#skills', contact: '#contact', resume: person.resume }
const commands = ['help', 'about', ...Object.keys(destinations), 'clear']
const input = ref('')
const lines = ref([])
const history = []
let historyIndex = 0

function submit() {
  const command = input.value.trim().toLowerCase()
  if (!command) return
  history.push(command)
  historyIndex = history.length
  input.value = ''
  if (command === 'clear') {
    lines.value = []
    return
  }
  let message = 'Unknown command. Type help for available commands.'
  if (command === 'help') message = commands.join(' · ')
  if (command === 'about') message = 'Varun Teja Goud · Backend and full-stack engineer · M.S. CSE at University at Buffalo.'
  const href = Object.hasOwn(destinations, command) ? destinations[command] : undefined
  if (href) message = command === 'resume' ? 'Download résumé' : 'Jump to ' + command
  lines.value = [...lines.value.slice(-3), { command, message, href }]
}

function recall(direction) {
  historyIndex = Math.max(0, Math.min(historyIndex + direction, history.length))
  input.value = history[historyIndex] ?? ''
}

function complete(event) {
  const prefix = input.value.trim().toLowerCase()
  const matches = commands.filter(command => command.startsWith(prefix))
  if (matches.length === 1 && matches[0] !== prefix) {
    event.preventDefault()
    input.value = matches[0]
  }
}
</script>

<template>
  <div class="panel terminal">
    <div class="window-bar"><div class="window-label"><Terminal :size="17" /> varun@portfolio</div></div>
    <div class="terminal-body mono">
      <p>Type <button type="button" class="text-command" @click="input = 'help'; submit()">help</button> for commands.</p>
      <div role="log" aria-live="polite">
        <div v-for="(line, i) in lines" :key="i + line.command" class="terminal-line">
          <span><b>❯</b> {{ line.command }}</span>
          <a v-if="line.href" :href="line.href" :download="line.command === 'resume' || undefined">{{ line.message }} ↗</a>
          <span v-else>{{ line.message }}</span>
        </div>
      </div>
      <form class="terminal-input" @submit.prevent="submit">
        <b aria-hidden="true">❯</b>
        <input v-model="input" aria-label="Terminal command" placeholder="Enter a command" autocomplete="off" spellcheck="false"
          @keydown.up.prevent="recall(-1)" @keydown.down.prevent="recall(1)" @keydown.tab="complete">
        <button type="submit" class="icon-button" aria-label="Run command"><CornerDownLeft :size="17" /></button>
      </form>
    </div>
  </div>
</template>
