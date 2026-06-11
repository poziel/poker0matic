<template>
  <div class="landing-page">
    <div class="landing-topbar">
      <router-link class="landing-brand" to="/">
        <span class="landing-brand-mark">
          <img alt="Refinimo logo" src="/images/logo.png">
        </span>

        <span class="landing-brand-name">Refinimo</span>
      </router-link>

      <div class="landing-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="landing-nav-tab"
          :class="{ 'landing-nav-tab-active': currentTab === tab.id }"
          :data-test-id="`landing-tab-${tab.id}`"
          type="button"
          @click="currentTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <v-menu location="bottom end">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            :aria-label="`Theme: ${currentThemeDefinition.label} ${appStore.themeModePreference}`"
            class="landing-theme-trigger"
            icon="mdi-palette-outline"
            variant="text"
          />
        </template>

        <div class="landing-theme-menu">
          <div aria-label="Theme mode" class="landing-theme-mode-row" role="group">
            <button
              v-for="option in themeModeOptions"
              :key="option.value"
              :aria-pressed="appStore.themeModePreference === option.value"
              class="landing-theme-mode-option"
              :class="{ 'landing-theme-mode-option-active': appStore.themeModePreference === option.value }"
              type="button"
              @click="appStore.setThemeModePreference(option.value)"
            >
              <v-icon :icon="option.icon" size="15" />
              <span>{{ option.shortLabel }}</span>
            </button>
          </div>

          <div class="landing-theme-options">
            <button
              v-for="theme in themeOptions"
              :key="theme.family"
              :aria-pressed="appStore.currentThemeFamily === theme.family"
              class="landing-theme-option"
              :class="{ 'landing-theme-option-active': appStore.currentThemeFamily === theme.family }"
              type="button"
              @click="setLandingTheme(theme.family)"
            >
              <span class="landing-theme-swatch" :style="landingSwatchStyle(theme)">
                <span class="landing-theme-dot" :style="landingDotStyle(theme)" />
              </span>

              <span>{{ theme.label }}</span>
              <v-icon v-if="appStore.currentThemeFamily === theme.family" icon="mdi-check" size="16" />
            </button>
          </div>
        </div>
      </v-menu>

      <v-btn
        class="ui-btn ui-btn-primary landing-topbar-cta"
        data-test-id="landing-primary-action"
        prepend-icon="mdi-arrow-right"
        to="/app"
        variant="flat"
      >
        {{ primaryActionLabel }}
      </v-btn>
    </div>

    <template v-if="currentTab === 'pitch'">
      <section class="landing-hero">
        <div class="landing-copy">
          <div class="landing-badge">
            <span class="landing-badge-dot" />
            Planning poker for scrum teams
          </div>

          <h1 class="landing-title">Run estimation sessions without turning your backlog into a spreadsheet circus.</h1>

          <p class="landing-lead">
            Refinimo is a collaborative planning poker app for agile teams. Create a room, invite your team,
            vote on stories in real time, then reveal estimates together to drive better sprint planning
            conversations.
          </p>

          <ul aria-label="Product highlights" class="landing-highlights">
            <li>Anonymous voting, simultaneous reveal, and reset for every round.</li>
            <li>Custom room controls like flexible decks, round history, and task details.</li>
            <li>Free to use, ad-free, and powered by your own Firebase project.</li>
          </ul>

          <p class="landing-free-note">
            Free project. No ads, no paywall, and nothing to purchase before your team can start estimating.
          </p>
        </div>

        <div class="landing-panel">
          <div class="landing-mini-shell">
            <div class="landing-panel-head">
              <span class="landing-chip">What teams do here</span>
              <span class="landing-chip landing-chip-muted">Real-time</span>
            </div>

            <div class="landing-vote-grid">
              <PlanningCard
                v-for="vote in voteOptions"
                :key="vote"
                class="landing-vote-card"
                flipped
                :value="vote"
              />
            </div>

            <div class="landing-panel-copy">
              <div class="landing-panel-stat">
                <strong>1.</strong>
                Share a room with the team.
              </div>

              <div class="landing-panel-stat">
                <strong>2.</strong>
                Everyone picks a card privately.
              </div>

              <div class="landing-panel-stat">
                <strong>3.</strong>
                Reveal the spread and discuss outliers.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="landing-section">
        <div class="landing-section-head">
          <div class="kicker">What it is</div>
          <h2>Planning poker gives the team a structured way to estimate work.</h2>
        </div>

        <div class="landing-grid landing-grid-three">
          <article class="landing-card">
            <h3>What Refinimo is</h3>

            <p>
              A browser-based planning poker workspace where developers, designers, product managers, and other
              stakeholders can estimate backlog items together.
            </p>
          </article>

          <article class="landing-card">
            <h3>What the project does</h3>

            <p>
              It manages live rooms, player presence, card selection, vote reveals, round resets, room history,
              and sharable room access in one lightweight app.
            </p>
          </article>

          <article class="landing-card">
            <h3>How people interact with it</h3>

            <p>
              One person creates a room, teammates join from a shared link or room code, everyone votes privately,
              then the group reveals and discusses the estimates.
            </p>
          </article>
        </div>
      </section>

      <section class="landing-section landing-section-alt">
        <div class="landing-section-head">
          <div class="kicker">Why teams use it</div>
          <h2>Scrum planning works better when the conversation is visible and the votes are independent.</h2>
        </div>

        <div class="landing-grid landing-grid-two">
          <article class="landing-card landing-card-emphasis">
            <h3>Why estimation voting matters</h3>

            <p>
              Scrum teams use planning poker to reduce anchoring bias, surface uncertainty early, and create a
              shared understanding of complexity before committing work into a sprint.
            </p>
          </article>

          <article class="landing-card">
            <h3>What happens after the landing page</h3>

            <p>
              The app flow lets you connect Firebase, create a room, join an existing room, or jump back into a
              recent planning session.
            </p>
          </article>
        </div>
      </section>

      <section class="landing-section">
        <div class="landing-section-head">
          <div class="kicker">Why people pick it</div>
          <h2>Built for teams that want control, practical room tools, and zero commercial friction.</h2>
        </div>

        <div class="landing-grid landing-grid-three">
          <article class="landing-card">
            <h3>You control the backend</h3>

            <p>
              Refinimo uses your own Firebase project, so your team keeps ownership of room data instead of
              depending on a shared hosted backend you do not control.
            </p>
          </article>

          <article class="landing-card">
            <h3>More room flexibility</h3>

            <p>
              Configure decks, enable round history, attach task information, and adapt the room to how your team
              actually estimates instead of settling for a single rigid flow.
            </p>
          </article>

          <article class="landing-card landing-card-emphasis">
            <h3>Free and ad-free</h3>

            <p>
              There is no paywall, no usage tier, and no advertising layer trying to get between the team and the
              estimation session.
            </p>
          </article>
        </div>
      </section>

      <section class="landing-section">
        <div class="landing-section-head">
          <div class="kicker">How it works</div>
          <h2>From first visit to first vote in three steps.</h2>
        </div>

        <div class="landing-flow">
          <article class="landing-step">
            <span class="landing-step-index">01</span>
            <h3>Open the app flow</h3>

            <p>Enter the application, connect a Firebase project when needed, and keep that setup in your browser.</p>
          </article>

          <article class="landing-step">
            <span class="landing-step-index">02</span>
            <h3>Create or join a room</h3>

            <p>Start a new estimation session for your team or join an existing room with a code or shared link.</p>
          </article>

          <article class="landing-step">
            <span class="landing-step-index">03</span>
            <h3>Vote, reveal, discuss</h3>

            <p>Each participant picks a card privately, then everyone reveals together to compare assumptions.</p>
          </article>
        </div>
      </section>
    </template>

    <template v-else-if="currentTab === 'firebase'">
      <section class="landing-section landing-section-with-top-gap">
        <div class="landing-section-head">
          <div class="kicker">How Firebase works</div>
          <h2>Refinimo stays free by letting each team bring its own Firebase project.</h2>
        </div>

        <div class="landing-grid landing-grid-two">
          <article class="landing-card landing-card-emphasis">
            <h3>Why Firebase is needed</h3>

            <p>
              Refinimo has no custom backend. Rooms, votes, players, and history live in Firebase Realtime
              Database, so the app needs a Firebase project before your team can start playing.
            </p>
          </article>

          <article class="landing-card">
            <h3>What you actually provide</h3>

            <p>
              Create a Firebase project with any name you want, enable Realtime Database, register a web app,
              then paste the generated config values into the Refinimo configuration page or modal.
            </p>
          </article>
        </div>

        <div class="landing-flow">
          <article v-for="step in firebaseSteps" :key="step.id" class="landing-step">
            <span class="landing-step-index">{{ step.id }}</span>
            <h3>{{ step.title }}</h3>

            <p>{{ step.body }}</p>
          </article>
        </div>

        <div class="landing-section-head landing-section-head-compact">
          <div class="kicker">Where data is stored</div>
          <h2>Two storage layers work together: one local to the browser, one shared for the room.</h2>
        </div>

        <div class="landing-grid landing-grid-two">
          <article class="landing-card">
            <h3>What stays in your browser</h3>

            <p>
              Refinimo uses browser localStorage for your generated user identity, display name, avatar
              choices, recent rooms, saved Firebase configuration, and personal UI preferences. That local data
              stays on the device and is reused when you come back.
            </p>
          </article>

          <article class="landing-card">
            <h3>What stays in Firebase</h3>

            <p>
              Shared room state lives in Firebase Realtime Database: room settings, participants, votes, round
              history, task details, and presence. That is what lets multiple people see the same estimation
              session in real time.
            </p>
          </article>
        </div>

        <section class="landing-rules-section">
          <div class="landing-rules-head">
            <h3>Realtime Database rules</h3>

            <button class="landing-rules-toggle" data-test-id="landing-toggle-rules" type="button" @click="rulesExpanded = !rulesExpanded">
              <span>{{ rulesExpanded ? 'Hide rules' : 'Show rules' }}</span>
              <v-icon :icon="rulesExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="16" />
            </button>
          </div>

          <p class="landing-rules-copy">
            These example rules are updated for the current Refinimo room schema and are a better starting
            point than the default temporary snippet.
          </p>

          <div v-if="rulesExpanded" class="landing-code-shell">
            <v-btn
              class="ui-btn ui-btn-ghost landing-copy-icon"
              data-test-id="landing-copy-rules"
              :icon="rulesCopied ? 'mdi-check' : 'mdi-content-copy'"
              size="small"
              variant="flat"
              @click="copyFirebaseRules"
            />

            <pre class="landing-code-block"><code>{{ firebaseRules }}</code></pre>
          </div>
        </section>

        <div class="landing-actions">
          <v-btn
            class="ui-btn ui-btn-primary landing-cta"
            prepend-icon="mdi-cog-outline"
            to="/app/config"
            variant="flat"
          >
            Open configuration
          </v-btn>
        </div>
      </section>
    </template>

    <template v-else>
      <section class="landing-section landing-section-with-top-gap">
        <div class="landing-section-head">
          <div class="kicker">About the project</div>
          <h2>Built with a lot of good tools, generous platforms, and one solid starter foundation.</h2>
        </div>

        <article class="landing-card landing-card-featured">
          <div class="landing-feature-badge">
            <v-icon icon="mdi-star-four-points" size="16" />
            Special thanks
          </div>

          <h3>Special thanks to sky0matic</h3>

          <p>
            This project started as a fork of <strong>sky0matic's Poker0Matic</strong>. As the implementation
            moved too far away from sky0matic's original direction for the project, it became its own project
            instead. Special thanks to sky0matic for providing the initial foundation that made this version
            possible.
          </p>

          <a
            class="landing-inline-link"
            href="https://github.com/sky0matic/poker0matic"
            rel="noopener noreferrer"
            target="_blank"
          >
            Visit sky0matic/poker0matic
          </a>
        </article>

        <div class="landing-grid landing-grid-two">
          <article v-for="credit in aboutCredits" :key="credit.title" class="landing-card">
            <h3>{{ credit.title }}</h3>

            <p>{{ credit.body }}</p>

            <a class="landing-inline-link" :href="credit.href" rel="noopener noreferrer" target="_blank">
              Visit {{ credit.label }}
            </a>
          </article>
        </div>
      </section>
    </template>

    <footer class="landing-footer">
      <div class="landing-footer-copy">
        <span class="landing-footer-brand">Refinimo</span>
        <span class="landing-footer-text">Collaborative planning poker for scrum teams using their own Firebase backend.</span>
      </div>

      <div class="landing-footer-links">
        <button class="landing-footer-link" type="button" @click="currentTab = 'pitch'">Overview</button>
        <button class="landing-footer-link" type="button" @click="currentTab = 'firebase'">How it works</button>
        <button class="landing-footer-link" type="button" @click="currentTab = 'about'">About</button>
        <router-link class="landing-footer-link landing-footer-link-accent" to="/app">Open app</router-link>
      </div>
    </footer>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onUnmounted, ref } from 'vue'
  import PlanningCard from '@/components/PlanningCard.vue'
  import { useAppStore } from '@/stores/app'
  import { useConfigStore } from '@/stores/config'
  import {
    THEME_FAMILIES,
    THEME_FAMILY_LOOKUP,
    THEME_LOOKUP,
    type ThemeFamily,
    type ThemeModePreference,
  } from '@/utils/themes'
  import firebaseRulesRaw from '../../firebase.database.rules.json?raw'

  type LandingTabId = 'pitch' | 'firebase' | 'about'

  const appStore = useAppStore()
  const configStore = useConfigStore()
  configStore.initializeConfig()

  const currentTab = ref<LandingTabId>('pitch')
  const rulesExpanded = ref(false)
  const rulesCopied = ref(false)
  const voteOptions = ['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕']
  const tabs: Array<{ id: LandingTabId, label: string }> = [
    { id: 'pitch', label: 'Overview' },
    { id: 'firebase', label: 'How it works' },
    { id: 'about', label: 'About' },
  ]
  const themeModeOptions: Array<{ value: ThemeModePreference, shortLabel: string, icon: string }> = [
    { value: 'system', shortLabel: 'Auto', icon: 'mdi-theme-light-dark' },
    { value: 'dark', shortLabel: 'Dark', icon: 'mdi-weather-night' },
    { value: 'light', shortLabel: 'Light', icon: 'mdi-white-balance-sunny' },
  ]
  const themeOptions = computed(() => THEME_FAMILIES.map(family => THEME_FAMILY_LOOKUP[family]))
  const firebaseSteps = [
    {
      id: '01',
      title: 'Create your Firebase project',
      body: 'Open Firebase Console, click "Create a project", give it any name you want, and finish the basic project setup. You can skip optional services that Refinimo does not need.',
    },
    {
      id: '02',
      title: 'Enable Realtime Database',
      body: 'Inside the Firebase project, open Build > Realtime Database, create the database, choose the closest region for your team, and finish the database setup.',
    },
    {
      id: '03',
      title: 'Replace the default rules',
      body: 'Open the Realtime Database Rules tab, replace the default temporary rules with the Refinimo rules shown below, then publish them so the current room schema is accepted.',
    },
    {
      id: '04',
      title: 'Register a web app and copy the config',
      body: 'In Project settings, add a Web app and copy the generated Firebase values such as apiKey, authDomain, databaseURL, projectId, and appId from the config snippet.',
    },
    {
      id: '05',
      title: 'Paste the config into Refinimo',
      body: 'Open Refinimo configuration, paste each Firebase value into the matching field, save, and the app will keep that setup in browser localStorage for future visits on that device.',
    },
  ]
  const firebaseRules = firebaseRulesRaw.trim()
  const aboutCredits = [
    {
      title: 'DiceBear',
      body: 'Used for generated avatar styles and lightweight player identities.',
      href: 'https://www.dicebear.com/',
      label: 'DiceBear',
    },
    {
      title: 'Gravatar',
      body: 'Used as an optional profile image source for globally recognized avatars.',
      href: 'https://gravatar.com/',
      label: 'Gravatar',
    },
    {
      title: 'Anggara Putra',
      body: 'Credited for the Magnific playing-card suit artwork used across the card and icon set.',
      href: 'https://www.magnific.com/author/anggara-putra',
      label: 'Magnific',
    },
    {
      title: 'NSFWJS and TensorFlow.js',
      body: 'Used for client-side checks on custom avatar image URLs before they are saved.',
      href: 'https://github.com/infinitered/nsfwjs',
      label: 'NSFWJS',
    },
    {
      title: 'Vue Advanced Cropper',
      body: 'Used for custom avatar image cropping in the profile editor.',
      href: 'https://github.com/advanced-cropper/vue-advanced-cropper',
      label: 'Cropper',
    },
    {
      title: 'Vuetify and Material Design Icons',
      body: 'The interface is built on Vuetify, with Material Design Icons supporting the visual system and controls.',
      href: 'https://vuetifyjs.com/',
      label: 'Vuetify',
    },
    {
      title: 'Firebase Realtime Database',
      body: 'Provides the live synchronization layer for rooms, votes, player presence, and shared session state.',
      href: 'https://firebase.google.com/products/realtime-database',
      label: 'Firebase',
    },
  ]

  const primaryActionLabel = computed(() => configStore.configFound ? 'Open app' : 'Start planning')
  const currentThemeDefinition = computed(() => THEME_LOOKUP[appStore.currentTheme])
  let copiedResetTimer: number | null = null

  function setLandingTheme (theme: ThemeFamily) {
    appStore.setTheme(theme)
  }

  function landingSwatchStyle (theme: typeof themeOptions.value[number]) {
    if (appStore.themeModePreference === 'system') {
      return {
        background: `linear-gradient(135deg, ${theme.dark?.preview.bg} 0 50%, ${theme.light?.preview.bg} 50% 100%)`,
      }
    }

    return { background: theme[appStore.themeModePreference]?.preview.bg }
  }

  function landingDotStyle (theme: typeof themeOptions.value[number]) {
    if (appStore.themeModePreference === 'system') {
      return {
        background: `linear-gradient(135deg, ${theme.dark?.preview.accent} 0 50%, ${theme.light?.preview.accent} 50% 100%)`,
      }
    }

    return { background: theme[appStore.themeModePreference]?.preview.accent }
  }

  async function copyFirebaseRules () {
    try {
      await navigator.clipboard.writeText(firebaseRules)
      rulesCopied.value = true
      appStore.showToast('Firebase rules copied.', 'success')

      if (copiedResetTimer !== null) {
        window.clearTimeout(copiedResetTimer)
      }

      copiedResetTimer = window.setTimeout(() => {
        rulesCopied.value = false
        copiedResetTimer = null
      }, 2000)
    } catch {
      appStore.showToast('Could not copy the Firebase rules.', 'error')
    }
  }

  onUnmounted(() => {
    if (copiedResetTimer !== null) {
      window.clearTimeout(copiedResetTimer)
    }
  })
</script>

<style scoped>
  .landing-page {
    --landing-glass: color-mix(in oklab, var(--bg-1), transparent 14%);
    --landing-surface: color-mix(in oklab, var(--bg-1), var(--bg-2) 24%);
    --landing-surface-strong: color-mix(in oklab, var(--bg-1), var(--bg-3) 22%);
    --landing-shadow: 0 30px 80px color-mix(in oklab, var(--bg-base), black 48%);
    --landing-shadow-soft: 0 20px 60px color-mix(in oklab, var(--bg-base), black 30%);

    margin: 0 auto;
    max-width: 1240px;
    padding: 40px 24px 96px;
    position: relative;
    z-index: 1;
  }

  .landing-topbar {
    align-items: center;
    backdrop-filter: blur(16px);
    background: var(--landing-glass);
    border: 1px solid var(--border);
    border-radius: 22px;
    display: flex;
    gap: 18px;
    justify-content: space-between;
    padding: 14px 16px;
    position: sticky;
    top: 18px;
    z-index: 4;
  }

  .landing-hero {
    align-items: center;
    display: grid;
    gap: 28px;
    grid-template-columns: minmax(0, 1.15fr) minmax(320px, .85fr);
    min-height: calc(100vh - 180px);
    padding: 28px 0 48px;
  }

  .landing-copy {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .landing-brand {
    align-items: center;
    color: var(--text-1);
    display: inline-flex;
    gap: 12px;
    text-decoration: none;
    width: fit-content;
  }

  .landing-nav {
    display: flex;
    gap: 8px;
    margin-left: auto;
    margin-right: auto;
  }

  .landing-nav-tab {
    appearance: none;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 999px;
    color: var(--text-2);
    cursor: pointer;
    font-family: inherit;
    font-size: .95rem;
    font-weight: 600;
    padding: 10px 14px;
    transition: border-color .18s ease, background .18s ease, color .18s ease;
  }

  .landing-nav-tab:hover {
    color: var(--text-1);
  }

  .landing-nav-tab-active {
    background: var(--bg-2);
    border-color: var(--border);
    color: var(--text-1);
  }

  .landing-topbar-cta {
    flex-shrink: 0;
  }

  .landing-theme-trigger {
    color: var(--text-2);
    flex-shrink: 0;
  }

  .landing-theme-trigger:hover {
    color: var(--text-1);
  }

  .landing-theme-menu {
    background: var(--bg-1);
    border: 1px solid var(--border);
    border-radius: 18px;
    box-shadow: var(--landing-shadow-soft);
    display: grid;
    gap: 14px;
    max-height: calc(100vh - 32px);
    min-width: 280px;
    overflow-y: auto;
    padding: 14px;
  }

  .landing-theme-group {
    display: grid;
    gap: 8px;
  }

  .landing-theme-group-label {
    color: var(--text-3);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .landing-theme-mode-row {
    display: grid;
    gap: 6px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .landing-theme-mode-option {
    align-items: center;
    appearance: none;
    background: var(--bg-2);
    border: 1px solid transparent;
    border-radius: 8px;
    color: var(--text-2);
    cursor: pointer;
    display: flex;
    font: inherit;
    font-size: 12px;
    font-weight: 650;
    gap: 5px;
    justify-content: center;
    min-height: 34px;
    padding: 7px 8px;
    transition: background .18s ease, border-color .18s ease, color .18s ease;
  }

  .landing-theme-mode-option:hover,
  .landing-theme-mode-option-active {
    background: var(--bg-3);
    border-color: var(--border-strong);
    color: var(--text-1);
  }

  .landing-theme-options {
    display: grid;
    gap: 6px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .landing-theme-option {
    align-items: center;
    appearance: none;
    background: var(--bg-2);
    border: 1px solid transparent;
    border-radius: 12px;
    color: var(--text-2);
    cursor: pointer;
    display: grid;
    font: inherit;
    font-size: 12px;
    font-weight: 650;
    gap: 6px;
    justify-items: center;
    min-height: 72px;
    padding: 8px;
    position: relative;
    text-align: center;
  }

  .landing-theme-option:hover,
  .landing-theme-option-active {
    background: var(--bg-3);
    border-color: var(--border-strong);
    color: var(--text-1);
  }

  .landing-theme-option .v-icon {
    color: var(--accent);
    position: absolute;
    right: 7px;
    top: 7px;
  }

  .landing-theme-swatch {
    border: 1px solid var(--border);
    border-radius: 999px;
    display: grid;
    height: 24px;
    overflow: hidden;
    place-items: center;
    width: 24px;
  }

  .landing-theme-dot {
    border-radius: 999px;
    height: 10px;
    width: 10px;
  }

  .landing-brand-mark {
    border-radius: 12px;
    box-shadow: 0 10px 24px rgba(var(--accent-glow), .18);
    display: inline-flex;
    height: 46px;
    overflow: hidden;
    width: 46px;
  }

  .landing-brand-mark img {
    display: block;
    height: 100%;
    width: 100%;
  }

  .landing-brand-name {
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: -.03em;
  }

  .landing-brand-name span {
    color: var(--text-3);
  }

  .landing-badge {
    align-items: center;
    align-self: flex-start;
    background: color-mix(in oklab, var(--accent), transparent 86%);
    border: 1px solid color-mix(in oklab, var(--accent), transparent 60%);
    border-radius: 999px;
    color: var(--accent);
    display: inline-flex;
    font-size: 12.5px;
    font-weight: 700;
    gap: 10px;
    letter-spacing: .08em;
    padding: 8px 14px;
    text-transform: uppercase;
  }

  .landing-badge-dot {
    background: currentColor;
    border-radius: 50%;
    box-shadow: 0 0 18px currentColor;
    display: inline-block;
    height: 8px;
    width: 8px;
  }

  .landing-title {
    font-size: clamp(2.45rem, 4.4vw, 4.3rem);
    letter-spacing: -.05em;
    line-height: .96;
    margin: 0;
    max-width: 12ch;
  }

  .landing-lead {
    color: var(--text-2);
    font-size: 1.08rem;
    line-height: 1.7;
    margin: 0;
    max-width: 64ch;
  }

  .landing-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .landing-cta,
  .landing-cta-secondary,
  .landing-topbar-cta {
    min-height: 46px;
    padding-inline: 18px;
  }

  .landing-highlights {
    color: var(--text-2);
    display: grid;
    gap: 10px;
    margin: 0;
    max-width: 60ch;
    padding-left: 18px;
  }

  .landing-highlights li::marker {
    color: var(--accent);
  }

  .landing-free-note {
    color: var(--text-1);
    font-size: .98rem;
    line-height: 1.6;
    margin: 0;
    max-width: 60ch;
  }

  .landing-panel {
    display: flex;
    justify-content: flex-end;
  }

  .landing-mini-shell {
    background:
      linear-gradient(180deg, var(--landing-surface-strong), var(--landing-surface)),
      var(--bg-1);
    border: 1px solid var(--border);
    border-radius: 28px;
    box-shadow: var(--landing-shadow);
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-height: 480px;
    overflow: hidden;
    padding: 22px;
    position: relative;
    width: min(100%, 430px);
  }

  .landing-mini-shell::before {
    background: radial-gradient(circle at top right, rgba(var(--accent-glow), .22), transparent 42%);
    content: "";
    inset: 0;
    pointer-events: none;
    position: absolute;
  }

  .landing-panel-head,
  .landing-panel-copy {
    position: relative;
    z-index: 1;
  }

  .landing-panel-head {
    display: flex;
    gap: 10px;
    justify-content: space-between;
  }

  .landing-chip {
    background: var(--bg-2);
    border: 1px solid var(--border);
    border-radius: 999px;
    color: var(--text-1);
    font-size: 12px;
    font-weight: 600;
    padding: 7px 10px;
  }

  .landing-chip-muted {
    color: var(--text-3);
  }

  .landing-vote-grid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    position: relative;
    z-index: 1;
  }

  .landing-vote-card {
    --planning-card-w: 64px;
    --planning-card-h: 86px;
    --planning-card-radius: 14px;
    font-size: 20px;
    justify-self: center;
    transform: rotate(var(--tilt, 0deg));
  }

  .landing-vote-card:nth-child(2n) {
    --tilt: -3deg;
  }

  .landing-vote-card:nth-child(3n) {
    --tilt: 4deg;
  }

  .landing-panel-copy {
    display: grid;
    gap: 10px;
    margin-top: auto;
  }

  .landing-panel-stat {
    align-items: center;
    background: color-mix(in oklab, var(--bg-2), transparent 10%);
    border: 1px solid var(--border);
    border-radius: 14px;
    color: var(--text-2);
    display: flex;
    gap: 10px;
    padding: 12px 14px;
  }

  .landing-panel-stat strong {
    color: var(--accent);
    font-family: var(--font-mono);
    font-size: 13px;
  }

  .landing-section {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 22px 0;
  }

  .landing-section-with-top-gap {
    padding-top: 44px;
  }

  .landing-section-alt {
    margin-top: 12px;
  }

  .landing-section-head {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 70ch;
  }

  .landing-section-head h2 {
    font-size: clamp(1.35rem, 2.4vw, 2rem);
    letter-spacing: -.03em;
    line-height: 1.14;
    margin: 0;
  }

  .landing-section-head-compact {
    margin-top: 6px;
  }

  .landing-grid {
    display: grid;
    gap: 18px;
  }

  .landing-grid-two {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .landing-grid-three {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .landing-card {
    background: var(--landing-surface);
    border: 1px solid var(--border);
    border-radius: 22px;
    min-height: 100%;
    padding: 22px;
  }

  .landing-card h3,
  .landing-step h3 {
    font-size: .97rem;
    letter-spacing: -.02em;
    margin: 0 0 10px;
  }

  .landing-card p,
  .landing-step p {
    color: var(--text-2);
    line-height: 1.65;
    margin: 0;
  }

  .landing-inline-link {
    color: var(--accent);
    display: inline-block;
    font-size: .94rem;
    font-weight: 600;
    margin-top: 14px;
    text-decoration: none;
  }

  .landing-inline-link:hover {
    text-decoration: underline;
  }

  .landing-card-emphasis {
    background: linear-gradient(180deg, color-mix(in oklab, var(--accent-soft), var(--bg-1) 30%), var(--bg-1));
  }

  .landing-card-featured {
    background: linear-gradient(180deg, color-mix(in oklab, var(--accent-soft), var(--bg-1) 18%), var(--bg-1));
    border-color: color-mix(in oklab, var(--accent), var(--border) 45%);
    box-shadow: var(--landing-shadow-soft);
    padding: 28px;
  }

  .landing-feature-badge {
    align-items: center;
    color: var(--accent);
    display: inline-flex;
    font-size: .8rem;
    font-weight: 700;
    gap: 8px;
    letter-spacing: .08em;
    margin-bottom: 16px;
    text-transform: uppercase;
  }

  .landing-card-featured p strong {
    color: var(--text-1);
  }

  .landing-rules-section {
    background: var(--landing-surface);
    border: 1px solid var(--border);
    border-radius: 22px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 22px;
  }

  .landing-rules-head {
    align-items: center;
    display: flex;
    gap: 16px;
    justify-content: space-between;
  }

  .landing-rules-head h3 {
    font-size: .97rem;
    letter-spacing: -.02em;
    margin: 0;
  }

  .landing-rules-toggle {
    align-items: center;
    background: transparent;
    border: none;
    color: var(--text-3);
    cursor: pointer;
    display: inline-flex;
    font-family: inherit;
    font-size: .88rem;
    font-weight: 700;
    gap: 6px;
    padding: 0;
  }

  .landing-rules-toggle:hover {
    color: var(--text-1);
  }

  .landing-rules-copy {
    color: var(--text-2);
    line-height: 1.65;
    margin: 0;
  }

  .landing-code-shell {
    position: relative;
  }

  .landing-copy-icon {
    position: absolute;
    right: 12px;
    top: 12px;
    z-index: 1;
  }

  .landing-code-block {
    background: var(--bg-2);
    border: 1px solid var(--border-strong);
    border-radius: 18px;
    color: var(--text-1);
    font-family: var(--font-mono);
    font-size: .82rem;
    line-height: 1.6;
    margin: 0;
    overflow-x: auto;
    padding: 18px;
    padding-top: 56px;
    white-space: pre;
  }

  .landing-flow {
    display: grid;
    gap: 18px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .landing-step {
    background: var(--landing-surface);
    border: 1px solid var(--border);
    border-radius: 22px;
    padding: 22px;
  }

  .landing-step-index {
    color: var(--accent);
    display: inline-block;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 700;
    margin-bottom: 18px;
  }

  .landing-footer {
    align-items: center;
    border-top: 1px solid var(--border);
    display: flex;
    gap: 20px;
    justify-content: space-between;
    margin-top: 40px;
    padding: 24px 0 0;
  }

  .landing-footer-copy {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-width: 52ch;
  }

  .landing-footer-brand {
    color: var(--text-1);
    font-size: .95rem;
    font-weight: 700;
    letter-spacing: -.02em;
  }

  .landing-footer-text {
    color: var(--text-3);
    font-size: .92rem;
    line-height: 1.6;
  }

  .landing-footer-links {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: flex-end;
  }

  .landing-footer-link {
    background: transparent;
    border: none;
    color: var(--text-2);
    cursor: pointer;
    font-family: inherit;
    font-size: .95rem;
    font-weight: 500;
    text-decoration: none;
  }

  .landing-footer-link:hover {
    color: var(--text-1);
  }

  .landing-footer-link-accent {
    color: var(--accent);
  }

  :global([data-theme$="-light"]) .landing-page {
    --landing-glass: color-mix(in oklab, var(--bg-1), transparent 8%);
    --landing-surface: color-mix(in oklab, var(--bg-1), var(--bg-2) 34%);
    --landing-surface-strong: color-mix(in oklab, var(--bg-1), var(--accent-soft) 42%);
    --landing-shadow: 0 24px 70px color-mix(in oklab, var(--border-strong), transparent 48%);
    --landing-shadow-soft: 0 18px 48px color-mix(in oklab, var(--border-strong), transparent 58%);
  }

  @media (max-width: 1080px) {
    .landing-hero,
    .landing-grid-three,
    .landing-flow {
      grid-template-columns: 1fr;
    }

    .landing-panel {
      justify-content: flex-start;
    }

    .landing-mini-shell {
      min-height: 0;
      width: min(100%, 560px);
    }

    .landing-topbar {
      align-items: flex-start;
      flex-direction: column;
    }

    .landing-nav {
      margin: 0;
      width: 100%;
    }

    .landing-theme-trigger {
      position: absolute;
      right: 16px;
      top: 16px;
    }

    .landing-footer {
      align-items: flex-start;
      flex-direction: column;
    }

    .landing-footer-links {
      justify-content: flex-start;
    }
  }

  @media (max-width: 760px) {
    .landing-page {
      padding: 24px 16px 72px;
    }

    .landing-nav {
      flex-wrap: wrap;
    }

    .landing-theme-menu {
      min-width: min(320px, calc(100vw - 32px));
    }

    .landing-hero {
      min-height: auto;
      padding-top: 12px;
    }

    .landing-grid-two {
      grid-template-columns: 1fr;
    }

    .landing-vote-grid {
      grid-template-columns: repeat(5, minmax(0, 1fr));
    }
  }

  @media (max-width: 520px) {
    .landing-title {
      max-width: none;
    }

    .landing-actions {
      flex-direction: column;
    }

    .landing-cta,
    .landing-cta-secondary,
    .landing-topbar-cta {
      width: 100%;
    }

    .landing-theme-options {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .landing-vote-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

  }
</style>
