<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import {
  ArrowDown, ArrowDownToLine, ArrowRight, ArrowUp, ArrowUpRight, Braces,
  Check, Code2, Copy, ExternalLink, Github, GraduationCap, Linkedin, Mail,
  MapPin, Menu, Moon, Pause, Play, Search, Sun, Trophy, X,
} from 'lucide-vue-next'
import HeroBackdrop from './HeroBackdrop.vue'
import SkillMap from './SkillMap.vue'
import PipelineLab from './PipelineLab.vue'
import PortfolioTerminal from './PortfolioTerminal.vue'
import ProjectStudy from './ProjectStudy.vue'
import SkillPlayground from './SkillPlayground.vue'
import { motionEnabled, systemReducedMotion, toggleMotion } from './motion'
import { engineeringNotes, experience, metrics, person, projects, roleFits, secondaryProjects, sections, skillGroups } from './portfolio'
import './hero-motion.css'

const socials = [
  { name: 'GitHub', handle: 'varun3009', url: person.github, icon: Github },
  { name: 'LinkedIn', handle: 'varuntec', url: person.linkedin, icon: Linkedin },
  { name: 'LeetCode', handle: 'varun_tec', url: person.leetcode, icon: Code2 },
  { name: 'Codeforces', handle: 'Varun_tec', url: person.codeforces, icon: Trophy },
]
const navIds = ['about', 'experience', 'projects', 'coding', 'research', 'skills', 'contact']
const navSections = sections.filter(([id]) => id !== 'top')
const activeSection = ref('top')
const progress = ref(0)
const mobileMenu = ref(false)
const theme = ref(document.documentElement.dataset.theme)
const roleIndex = ref(0)
const roleTabs = ref([])
const projectFilter = ref('All')
const skillFilter = ref('All')
const skillFilters = ref()
const selectedFits = ref(['api', 'async'])
const commandDialog = ref()
const currentHash = ref(window.location.hash)
const activeProject = computed(() => projects.find(project => currentHash.value === '#/work/' + project.id))
const searchInput = ref()
const query = ref('')
const optionIndex = ref(0)
const optionsList = ref()
const copyStatus = ref('')
const mainPage = ref()
const disciplineStrip = ref()
const disciplines = ['Backend systems', 'Applied AI', 'Distributed workflows', 'Cloud infrastructure']
let sectionObserver
let scrollFrame = 0
let copyTimer

const currentRole = computed(() => experience[roleIndex.value])
const projectFilters = ['All', ...new Set(projects.map(project => project.category))]
const visibleProjects = computed(() => projects.filter(project => projectFilter.value === 'All' || project.category === projectFilter.value))
const skillOptions = [
  { name: 'All', count: skillGroups.reduce((total, group) => total + group.items.length, 0) },
  ...skillGroups.map(({ name, color, items }) => ({ name, color, count: items.length })),
]
const visibleSkills = computed(() => skillGroups.filter(group => skillFilter.value === 'All' || group.name === skillFilter.value))
const matchedFits = computed(() => roleFits.filter(fit => selectedFits.value.includes(fit.id)))
const emailLink = computed(() => 'mailto:' + person.email + '?subject=' + encodeURIComponent('Portfolio inquiry'))
const fitEmail = computed(() => 'mailto:' + person.email + '?subject=' + encodeURIComponent('Role fit: ' + matchedFits.value.map(fit => fit.name).join(', ')))

const commands = [
  ...sections.map(([id, name]) => ({ name, id, keywords: id, kind: 'Section' })),
  ...projects.map(project => ({ name: project.title, project, keywords: project.stack.join(' '), kind: 'Case study' })),
  { name: 'Download résumé', href: person.resume, keywords: 'cv resume pdf', kind: 'PDF', download: true },
  ...socials.map(social => ({ name: social.name, href: social.url, keywords: social.handle, kind: 'Profile' })),
]
const searchResults = computed(() => {
  const terms = query.value.toLowerCase().trim().split(/\s+/)
  return commands.filter(command => terms.every(term => (command.name + ' ' + command.keywords).toLowerCase().includes(term)))
})

function updateScroll() {
  scrollFrame = 0
  const height = document.documentElement.scrollHeight - window.innerHeight
  progress.value = height > 0 ? Math.min(100, Math.max(0, window.scrollY * 100 / height)) : 0
  activeSection.value = [...sections].reverse().find(([id]) => document.getElementById(id)?.getBoundingClientRect().top <= Math.max(125, window.innerHeight * 0.33))?.[0] ?? 'top'
}

function scheduleUpdate() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll)
}

function switchTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = theme.value
  document.querySelector('meta[name=theme-color]').content = theme.value === 'dark' ? '#0a0a10' : '#f6f6fc'
  try { localStorage.setItem('portfolio-theme', theme.value) } catch {}
}

function moveRole(event, index) {
  const shifts = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }
  if (!(event.key in shifts) && !['Home', 'End'].includes(event.key)) return
  event.preventDefault()
  const last = experience.length - 1
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? last : (index + shifts[event.key] + experience.length) % experience.length
  roleIndex.value = next
  roleTabs.value[next]?.focus()
}

function openSearch() {
  if (commandDialog.value.open) {
    commandDialog.value.close()
    return
  }
  mobileMenu.value = false
  query.value = ''
  optionIndex.value = 0
  commandDialog.value.showModal()
  nextTick(() => searchInput.value.focus())
}

function keyboardShortcut(event) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    openSearch()
  }
  if (event.key === 'Escape') mobileMenu.value = false
}

function moveOption(direction) {
  const count = searchResults.value.length
  if (!count) return
  optionIndex.value = (optionIndex.value + direction + count) % count
  nextTick(() => optionsList.value?.children[optionIndex.value]?.scrollIntoView({ block: 'nearest' }))
}

function openProject(project) {
  window.location.hash = '/work/' + project.id
}

function jump(id) {
  window.location.hash = id
  if (currentHash.value === '#' + id) document.getElementById(id)?.scrollIntoView()
}

async function syncRoute(initial = false) {
  const previousProject = activeProject.value
  currentHash.value = window.location.hash
  const project = activeProject.value
  document.title = project ? project.title + ' · Varun Teja Goud' : 'Varun Teja Goud · Software Engineer'
  await nextTick()
  if (project) {
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.getElementById('main')?.focus({ preventScroll: true })
  } else if (previousProject || initial === true) {
    const target = document.getElementById(currentHash.value.slice(1) || 'top')
    target?.scrollIntoView({ behavior: 'instant' })
    if (previousProject) target?.focus({ preventScroll: true })
  }
  updateScroll()
}

function executeCommand(command) {
  if (!command) return
  commandDialog.value.close()
  if (command.project) openProject(command.project)
  if (command.id) jump(command.id)
  if (command.download) {
    const link = document.createElement('a')
    link.href = command.href
    link.download = ''
    link.click()
  } else if (command.href) {
    window.open(command.href, '_blank', 'noopener,noreferrer')
  }
}

function selectRole(id) {
  const index = experience.findIndex(role => role.id === id)
  if (index !== -1) roleIndex.value = index
}

function followFit(fit) {
  selectRole(fit.role)
  if (fit.target === 'projects') projectFilter.value = 'AI & ML'
}

async function exploreSkillGroup(name) {
  skillFilter.value = name
  await nextTick()
  const toolbar = skillFilters.value
  toolbar?.querySelector('button[aria-pressed="true"]')?.focus({ preventScroll: true })
  toolbar?.scrollIntoView({ block: 'start' })
}

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(person.email)
    copyStatus.value = 'Copied'
  } catch {
    copyStatus.value = 'Select the email address to copy it.'
  }
  clearTimeout(copyTimer)
  copyTimer = setTimeout(() => { copyStatus.value = '' }, 2600)
}

function observeSectionMotion() {
  sectionObserver = new IntersectionObserver(entries => {
    for (const { target, isIntersecting } of entries) {
      if (target === disciplineStrip.value) {
        target.classList.toggle('is-in-view', isIntersecting)
      } else if (isIntersecting) {
        target.classList.add('has-entered')
        sectionObserver.unobserve(target)
      }
    }
  }, { rootMargin: '0px 0px -8% 0px' })
  mainPage.value.querySelectorAll(':scope > .content-section').forEach(section => sectionObserver.observe(section))
  sectionObserver.observe(disciplineStrip.value)
}

onMounted(() => {
  syncRoute(true)
  if ('IntersectionObserver' in window) observeSectionMotion()
  window.addEventListener('scroll', scheduleUpdate, { passive: true })
  window.addEventListener('resize', scheduleUpdate)
  window.addEventListener('hashchange', syncRoute)
  document.addEventListener('keydown', keyboardShortcut)
})

onUnmounted(() => {
  sectionObserver?.disconnect()
  window.removeEventListener('scroll', scheduleUpdate)
  window.removeEventListener('resize', scheduleUpdate)
  window.removeEventListener('hashchange', syncRoute)
  document.removeEventListener('keydown', keyboardShortcut)
  cancelAnimationFrame(scrollFrame)
  clearTimeout(copyTimer)
})
</script>

<template>
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="scroll-progress" :style="{ width: progress + '%' }" aria-hidden="true"></div>
  <header class="site-header" :class="{ scrolled: activeProject || activeSection !== 'top' || progress > 1 }">
    <nav class="nav-shell" aria-label="Primary">
      <a class="wordmark" href="#top" aria-label="Varun Teja Goud, home" @click="mobileMenu = false"><img src="/mark.svg" alt="" width="32" height="32"> <span>Varun Teja</span></a>
      <ul id="primary-links" class="nav-links" :class="{ expanded: mobileMenu }">
        <li v-for="[id, label] in navSections" :key="id" :class="{ 'mobile-nav-item': !navIds.includes(id) }"><a :href="'#' + id" :aria-current="!activeProject && activeSection === id ? 'location' : undefined" @click="mobileMenu = false">{{ id === 'coding' ? 'Coding' : label }}</a></li>
      </ul>
      <div class="header-actions">
        <button class="search-trigger" type="button" aria-label="Search portfolio" @click="openSearch"><Search :size="16" /><span>Search</span><kbd>Ctrl K</kbd></button>
        <button v-if="!systemReducedMotion" class="icon-button motion-toggle" type="button" :aria-label="motionEnabled ? 'Pause animations' : 'Resume animations'" :title="motionEnabled ? 'Pause animations' : 'Resume animations'" @click="toggleMotion"><Pause v-if="motionEnabled" :size="16" /><Play v-else :size="16" /></button>
        <button class="icon-button" type="button" :aria-label="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'" @click="switchTheme"><Sun v-if="theme === 'dark'" :size="18" /><Moon v-else :size="18" /></button>
        <button class="icon-button menu-toggle" type="button" aria-label="Toggle navigation" aria-controls="primary-links" :aria-expanded="mobileMenu" @click="mobileMenu = !mobileMenu"><X v-if="mobileMenu" :size="20" /><Menu v-else :size="20" /></button>
      </div>
    </nav>
  </header>

  <nav v-if="!activeProject" class="section-index" aria-label="Section index">
    <a v-for="[id, label] in sections" :key="id" :href="'#' + id" :aria-current="activeSection === id ? 'location' : undefined" :aria-label="label"><span>{{ label }}</span><i aria-hidden="true"></i></a>
  </nav>

  <ProjectStudy v-if="activeProject" :key="activeProject.id" :project="activeProject" />
  <main v-show="!activeProject" :id="activeProject ? undefined : 'main'" ref="mainPage" tabindex="-1">
    <section id="top" class="hero" tabindex="-1" aria-labelledby="hero-title">
      <HeroBackdrop :theme="theme" />
      <div class="hero-inner">
        <div class="hero-copy">
          <div class="hero-meta"><span class="status-pill"><i></i> Software Engineer</span><span class="location"><MapPin :size="14" /> Buffalo, NY</span></div>
          <h1 id="hero-title">Varun Teja<br><span class="gradient-text">Goud.</span></h1>
          <p class="hero-lead">
            <span class="sr-only">I build backend systems, distributed services, and AI applications.</span>
            <span class="hero-pitch-static" aria-hidden="true">I build <strong class="gradient-text">backend systems</strong>, distributed services, and AI applications.</span>
            <span class="hero-pitch-animated" aria-hidden="true">
              I build <span class="hero-rotation">
                <strong class="gradient-text">backend systems.</strong>
                <strong class="gradient-text">distributed services.</strong>
                <strong class="gradient-text">AI applications.</strong>
              </span>
            </span>
          </p>
          <p class="hero-bio">At DeltaX, I automated ingestion of 10K+ Shopify orders a day. At the University at Buffalo, I build computer vision and distributed training pipelines.</p>
          <div class="hero-actions">
            <a class="button primary" href="#projects">View work <ArrowRight :size="17" /></a>
            <a class="button secondary" :href="person.resume" download><ArrowDownToLine :size="17" /> Résumé</a>
            <div class="hero-socials">
              <a v-for="social in socials" :key="social.name" :href="social.url" :aria-label="social.name" :title="social.name" target="_blank" rel="noopener noreferrer"><component :is="social.icon" :size="18" /></a>
            </div>
          </div>
          <a class="hero-availability" href="#contact">Available full-time from February 2027 <ArrowUpRight :size="13" /></a>
        </div>
        <SkillMap />
      </div>
      <div class="hero-bottom">
        <button type="button" @click="openSearch">Press <kbd>Ctrl</kbd> <kbd>K</kbd> to jump anywhere</button>
        <a href="#about">Scroll to explore <ArrowDown :size="14" /></a>
      </div>
    </section>

    <div ref="disciplineStrip" class="discipline-strip" aria-hidden="true">
      <div class="discipline-track">
        <div v-for="copy in 2" :key="copy" class="discipline-group">
          <template v-for="discipline in disciplines" :key="discipline"><span>{{ discipline }}</span><b>✦</b></template>
        </div>
      </div>
    </div>

    <section id="about" class="content-section" tabindex="-1" aria-labelledby="about-title">
      <div class="section-intro"><span class="eyebrow">About</span><h2 id="about-title">From production systems to <span class="gradient-text">applied research.</span></h2></div>
      <div class="about-grid">
        <article class="panel about-summary">
          <h3>Hi, I’m Varun.</h3>
          <p>I’m a backend-first software engineer and M.S. student in Computer Science and Engineering at the University at Buffalo, concentrating in AI and machine learning. I’ve shipped production integrations across commerce, messaging, access control, and cloud storage, and I build the interfaces teams need to operate them.</p>
          <p>My research focuses on tracking road hazards in video and training generative handwriting models across multiple GPUs.</p>
          <a class="inline-link" href="#experience">Explore my experience <ArrowRight :size="15" /></a>
        </article>
        <article class="panel education">
          <GraduationCap :size="24" aria-hidden="true" /><h3>Education</h3>
          <div><strong>University at Buffalo, SUNY</strong><span>M.S. Computer Science and Engineering · AI / ML</span><small>Expected Dec 2026 · GPA 3.93 / 4.00</small></div>
          <div><strong>Osmania University</strong><span>B.E. Computer Science and Engineering</span><small>May 2024 · GPA 8.75 / 10</small></div>
        </article>
      </div>
      <div class="metric-grid">
        <a v-for="metric in metrics" :key="metric.label" class="panel metric" :href="'#' + metric.target" @click="selectRole(metric.role)"><strong class="gradient-text">{{ metric.value }}</strong><span>{{ metric.label }}</span><p>{{ metric.detail }}</p><ArrowUpRight :size="15" /></a>
      </div>
    </section>

    <section id="experience" class="content-section" tabindex="-1" aria-labelledby="experience-title">
      <div class="section-intro"><span class="eyebrow">Experience</span><h2 id="experience-title">My career as a <span class="gradient-text">distributed trace.</span></h2><p>Select a role to see what I built and the decisions behind it.</p></div>
      <div class="panel career">
        <div class="window-bar"><div class="window-label"><span class="window-dots" aria-hidden="true"><i></i><i></i><i></i></span> trace / career.varun</div><span class="mono window-meta">{{ experience.length }} spans</span></div>
        <div class="career-layout">
          <div class="career-tabs" role="tablist" aria-label="Work experience">
            <button v-for="(role, index) in experience" :id="'tab-' + role.id" :key="role.id" ref="roleTabs" type="button" role="tab"
              :aria-controls="'role-panel-' + role.id" :aria-selected="roleIndex === index" :tabindex="roleIndex === index ? 0 : -1"
              @click="roleIndex = index" @keydown="moveRole($event, index)">
              <i aria-hidden="true"></i><span><strong>{{ role.company }}</strong><small>{{ role.role }}</small></span><ArrowRight :size="15" aria-hidden="true" />
            </button>
          </div>
          <div v-for="role in experience" v-show="role.id === currentRole.id" :id="'role-panel-' + role.id" :key="role.id" class="career-detail" role="tabpanel" :aria-labelledby="'tab-' + role.id" tabindex="0">
            <span class="mono small-label">{{ role.dates }} · {{ role.location }} · {{ role.kind }}</span>
            <h3>{{ role.role }}</h3><p>{{ role.summary }}</p>
            <dl class="career-metrics"><div v-for="[value, label] in role.impact" :key="label"><dt>{{ value }}</dt><dd>{{ label }}</dd></div></dl>
            <ul class="detail-list"><li v-for="bullet in role.bullets" :key="bullet">{{ bullet }}</li></ul>
            <ul class="tags" aria-label="Tech stack"><li v-for="tag in role.stack" :key="tag">{{ tag }}</li></ul>
          </div>
        </div>
      </div>
    </section>

    <section id="lab" class="content-section" tabindex="-1" aria-labelledby="lab-title">
      <div class="section-intro"><span class="eyebrow">Interactive lab</span><h2 id="lab-title">Follow a poster through <span class="gradient-text">the queue.</span></h2><p>Replay a simulated MovieVerse upload to see how the API hands image processing off to a background worker.</p></div>
      <PipelineLab />
    </section>

    <section id="projects" class="content-section" tabindex="-1" aria-labelledby="projects-title">
      <div class="section-intro"><span class="eyebrow">Selected work</span><h2 id="projects-title">Things I’ve <span class="gradient-text">built.</span></h2><p>Explore the architecture, tradeoffs, and results behind each build.</p></div>
      <div class="filter-bar" aria-label="Filter projects">
        <button v-for="filter in projectFilters" :key="filter" type="button" :aria-pressed="projectFilter === filter" @click="projectFilter = filter">{{ filter }}</button>
      </div>
      <span class="sr-only" role="status">{{ visibleProjects.length }} projects shown</span>
      <TransitionGroup name="catalog" tag="div" class="project-grid">
        <article v-for="project in visibleProjects" :key="project.id" class="panel project-card">
          <div class="project-visual" :class="project.id" aria-hidden="true">
            <div class="project-grid-pattern"></div><Braces class="visual-icon" :size="25" />
            <div class="project-diagram">
              <template v-for="(node, index) in project.diagram" :key="node"><span>{{ node }}</span><ArrowRight v-if="index < project.diagram.length - 1" :size="12" /></template>
            </div>
          </div>
          <div class="project-content">
            <span class="mono small-label">{{ project.type }}</span><h3>{{ project.title }}</h3>
            <p class="project-subtitle">{{ project.subtitle }}</p><p>{{ project.summary }}</p>
            <ul class="tags" aria-label="Tech stack"><li v-for="tag in project.stack" :key="tag">{{ tag }}</li></ul>
            <div class="project-actions">
              <a class="inline-link" :href="'#/work/' + project.id" :aria-label="'Read ' + project.title + ' case study'">Case study <ArrowUpRight :size="15" /></a>
              <div class="icon-links"><a v-if="project.repo" :href="project.repo" target="_blank" rel="noopener noreferrer" :aria-label="project.title + ' source code'"><Github :size="18" /></a><a v-if="project.demo" :href="project.demo" target="_blank" rel="noopener noreferrer" :aria-label="project.title + ' live demo'"><ExternalLink :size="17" /></a></div>
            </div>
          </div>
        </article>
      </TransitionGroup>
      <details class="panel archive">
        <summary>More projects</summary>
        <ul><li v-for="[title, description] in secondaryProjects" :key="title"><strong>{{ title }}</strong> · {{ description }}</li></ul>
        <a class="inline-link github-more" :href="person.github" target="_blank" rel="noopener noreferrer">Browse GitHub <ArrowUpRight :size="15" /></a>
      </details>
    </section>

    <section id="coding" class="content-section" tabindex="-1" aria-labelledby="coding-title">
      <div class="section-intro"><span class="eyebrow">Competitive programming</span><h2 id="coding-title"><span class="gradient-text">1,000+ problems</span> solved.</h2><p>Data structures, algorithms, and timed contests across LeetCode and Codeforces.</p></div>
      <div class="coding-grid">
        <a class="panel profile-card" :href="person.leetcode" target="_blank" rel="noopener noreferrer">
          <div class="profile-top"><span class="profile-icon leetcode"><Code2 :size="23" /></span><span><strong>LeetCode</strong><small>varun_tec</small></span><ArrowUpRight :size="19" /></div>
          <div class="profile-metrics"><div><strong>676</strong><span>solved</span></div><div><strong>1,672</strong><span>contest rating</span></div><div><strong>103</strong><span>hard problems</span></div></div>
          <div class="difficulty-bar" role="img" aria-label="150 easy, 423 medium, 103 hard"><span style="flex: 150"></span><span style="flex: 423"></span><span style="flex: 103"></span></div>
        </a>
        <a class="panel profile-card" :href="person.codeforces" target="_blank" rel="noopener noreferrer">
          <div class="profile-top"><span class="profile-icon codeforces"><Trophy :size="23" /></span><span><strong>Codeforces</strong><small>Varun_tec</small></span><ArrowUpRight :size="19" /></div>
          <div class="profile-metrics"><div><strong>484</strong><span>solved</span></div><div><strong>1,398</strong><span>peak rating</span></div><div><strong>Pupil</strong><span>rank</span></div></div>
        </a>
      </div>
      <p class="coding-note">Profile stats captured November 2026 · ECET Computer Science and Engineering rank 16</p>
    </section>

    <section id="research" class="content-section" tabindex="-1" aria-labelledby="research-title">
      <div class="section-intro"><span class="eyebrow">University at Buffalo</span><h2 id="research-title">Getting models to <span class="gradient-text">train and work.</span></h2><p>My graduate research spans model architecture, dataset preparation, and distributed GPU training.</p></div>
      <div class="research-grid">
        <article class="panel"><h3>Style-conditioned diffusion</h3><p>Current work explores a ViT style encoder and a conditioned UNet for handwritten text generation. I work with SLURM, checkpoints, and PyTorch DDP to run and debug experiments across GPUs.</p><a class="inline-link" href="#/work/handwriting">Handwriting case study <ArrowRight :size="15" /></a></article>
        <article class="panel"><h3>Earlier VAE and T5 experiments</h3><p>Trained VAE and T5 models with PyTorch DDP on four NVIDIA A5000 GPUs using 400K handwriting samples across 399 styles. Training loss reached 0.10 for VAE and 0.68 for T5.</p><a class="inline-link" href="#experience" @click="selectRole('ub')">Research experience <ArrowRight :size="15" /></a></article>
      </div>
    </section>

    <section id="writing" class="content-section notes" tabindex="-1" aria-labelledby="writing-title">
      <div class="section-intro"><span class="eyebrow">Engineering notes</span><h2 id="writing-title">The decisions <span class="gradient-text">behind the code.</span></h2></div>
      <details v-for="note in engineeringNotes" :key="note.title" class="panel"><summary>{{ note.title }}</summary><p>{{ note.summary }}</p></details>
    </section>

    <section id="skills" class="content-section" tabindex="-1" aria-labelledby="skills-title">
      <div class="section-intro">
        <span class="eyebrow">Toolbox</span>
        <h2 id="skills-title">The <span class="gradient-text">stack</span> I reach for.</h2>
        <p>I build backend services with C# and ASP.NET Core, train models with Python and PyTorch, and ship interfaces with Vue and React.</p>
      </div>
      <SkillPlayground :groups="skillGroups" :active-group="skillFilter">
        <template #toolbar>
          <div ref="skillFilters" class="skill-filters" role="group" aria-label="Filter skill groups">
            <span class="skill-filter-label mono" aria-hidden="true">Cluster</span>
            <button v-for="option in skillOptions" :key="option.name" :data-color="option.color"
              type="button" :aria-pressed="skillFilter === option.name" @click="skillFilter = option.name">
              <i v-if="option.color" aria-hidden="true"></i>
              {{ option.name }} <span aria-hidden="true">{{ option.count }}</span>
            </button>
          </div>
        </template>
      </SkillPlayground>
      <TransitionGroup name="catalog" tag="div" class="stack-grid" :class="{ 'is-filtered': skillFilter !== 'All' }">
        <article v-for="group in visibleSkills" :key="group.name" class="panel stack-card" :data-color="group.color">
          <h3><button type="button" class="stack-card-filter" :aria-label="'Explore ' + group.name + ' skills'" @click="exploreSkillGroup(group.name)">
            <i aria-hidden="true"></i>{{ group.name }}<ArrowUpRight :size="15" aria-hidden="true" />
          </button></h3>
          <p>{{ group.description }}</p>
          <ul class="tags"><li v-for="skill in group.items" :key="skill">{{ skill }}</li></ul>
        </article>
      </TransitionGroup>
    </section>

    <section id="fit" class="content-section" tabindex="-1" aria-labelledby="fit-title">
      <div class="section-intro"><span class="eyebrow">Role fit</span><h2 id="fit-title">What does your team <span class="gradient-text">need?</span></h2><p>Select your priorities to find relevant work and case studies.</p></div>
      <div class="panel fit-panel">
        <fieldset class="fit-options"><legend class="sr-only">Role priorities</legend>
          <label v-for="fit in roleFits" :key="fit.id"><input v-model="selectedFits" type="checkbox" :value="fit.id"><span>{{ fit.name }}</span></label>
        </fieldset>
        <div class="fit-evidence">
          <span class="mono small-label" role="status">{{ matchedFits.length }} {{ matchedFits.length === 1 ? 'priority' : 'priorities' }} selected</span>
          <p v-if="matchedFits.length === 0">Select a priority to see related work.</p>
          <article v-for="fit in matchedFits" :key="fit.id"><h3><Check :size="16" /> {{ fit.name }}</h3><p>{{ fit.evidence }}</p><a class="inline-link" :href="'#' + fit.target" @click="followFit(fit)">{{ fit.label }} <ArrowRight :size="13" /></a></article>
          <a v-if="matchedFits.length" class="button secondary compact" :href="fitEmail"><Mail :size="16" /> Discuss your role</a>
        </div>
      </div>
    </section>

    <section id="terminal" class="content-section" tabindex="-1" aria-labelledby="terminal-title">
      <div class="section-intro"><span class="eyebrow">Playground</span><h2 id="terminal-title">Prefer a <span class="gradient-text">shell?</span></h2></div>
      <PortfolioTerminal />
    </section>

    <section id="contact" class="content-section" tabindex="-1" aria-labelledby="contact-title">
      <div class="section-intro"><span class="eyebrow">Contact</span><h2 id="contact-title">Let’s <span class="gradient-text">talk.</span></h2><p>I’m available for full-time software engineering roles starting February 2027. I’m based in Buffalo, NY and open to relocation.</p></div>
      <div class="panel contact-panel">
        <div class="contact-email"><Mail :size="24" aria-hidden="true" /><a :href="emailLink">{{ person.email }}</a><button class="icon-button" type="button" aria-label="Copy email address" @click="copyEmail"><Check v-if="copyStatus === 'Copied'" :size="17" /><Copy v-else :size="17" /></button><span class="copy-status" role="status">{{ copyStatus }}</span></div>
        <div class="contact-actions"><a class="button primary" :href="emailLink">Email me <ArrowUpRight :size="16" /></a><a class="button secondary" :href="person.linkedin" target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight :size="16" /></a></div>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <a class="wordmark" href="#top"><img src="/mark.svg" alt="" width="29" height="29"> Varun Teja Goud</a>
    <span>Buffalo, NY · Built with Vue</span>
    <a class="inline-link" href="#top">Back to top <ArrowUp :size="15" /></a>
  </footer>

  <dialog ref="commandDialog" class="command-dialog" aria-labelledby="search-title" @click.self="commandDialog.close()">
    <div class="dialog-card">
      <div class="search-row"><Search :size="22" /><label id="search-title" class="sr-only" for="search">Search portfolio</label>
        <input id="search" ref="searchInput" v-model="query" placeholder="Jump to a section, project, or profile…" autocomplete="off"
          role="combobox" aria-autocomplete="list" aria-controls="search-results" :aria-expanded="searchResults.length > 0"
          :aria-activedescendant="searchResults.length ? 'result-' + optionIndex : undefined"
          @input="optionIndex = 0" @keydown.down.prevent="moveOption(1)" @keydown.up.prevent="moveOption(-1)" @keydown.enter.prevent="executeCommand(searchResults[optionIndex])">
        <button class="icon-button" type="button" aria-label="Close search" @click="commandDialog.close()"><X :size="18" /></button>
      </div>
      <div id="search-results" ref="optionsList" class="search-results" role="listbox" aria-label="Search results">
        <div v-for="(item, index) in searchResults" :id="'result-' + index" :key="item.name" class="search-result" role="option" :aria-selected="optionIndex === index" @mousemove="optionIndex = index" @click="executeCommand(item)">
          <span>{{ item.name }}</span><small>{{ item.kind }}</small><ArrowRight :size="15" />
        </div>
      </div>
      <p v-if="!searchResults.length" class="no-results" role="status">No matching sections, projects, or profiles.</p>
      <div class="search-hint"><span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span><span><kbd>Enter</kbd> Open</span><span><kbd>Esc</kbd> Close</span></div>
    </div>
  </dialog>

</template>
