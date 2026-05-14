<template>
  <div class="landing-page">
    <div class="landing-topbar">
      <router-link class="landing-brand" to="/">
        <span class="landing-brand-mark">
          <img alt="Poker0matic logo" src="/images/logo.png">
        </span>

        <span class="landing-brand-name">poker<span>0</span>matic</span>
      </router-link>

      <div class="landing-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="landing-nav-tab"
          :class="{ 'landing-nav-tab-active': currentTab === tab.id }"
          type="button"
          @click="currentTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <v-btn
        class="p0-btn p0-btn-primary landing-topbar-cta"
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
            Poker0matic is a collaborative planning poker app for agile teams. Create a room, invite your team,
            vote on stories in real time, then reveal estimates together to drive better sprint planning
            conversations.
          </p>

          <ul aria-label="Product highlights" class="landing-highlights">
            <li>Anonymous voting, simultaneous reveal, and reset for every round.</li>
            <li>Room links are easy to share and reconnect to across devices.</li>
            <li>Your team keeps control of data by using its own Firebase project.</li>
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
              <span v-for="vote in voteOptions" :key="vote" class="landing-vote-card">{{ vote }}</span>
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
            <h3>What Poker0matic is</h3>

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
          <h2>Poker0matic stays free by letting each team bring its own Firebase project.</h2>
        </div>

        <div class="landing-grid landing-grid-two">
          <article class="landing-card landing-card-emphasis">
            <h3>Why Firebase is needed</h3>

            <p>
              Poker0matic has no custom backend. Rooms, votes, players, and history live in Firebase Realtime
              Database, so the app needs a Firebase project before your team can start playing.
            </p>
          </article>

          <article class="landing-card">
            <h3>What you actually provide</h3>

            <p>
              Create a Firebase project with any name you want, enable Realtime Database, register a web app,
              then paste the generated config values into the Poker0matic configuration page or modal.
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

        <div class="landing-grid landing-grid-two">
          <article class="landing-card">
            <h3>What happens after setup</h3>

            <p>
              Once the config is saved, it stays in your browser. User settings such as your profile name,
              avatar choices, recent rooms, saved Firebase config, and UI preferences are stored locally in
              your browser's localStorage.
            </p>
          </article>

          <article class="landing-card">
            <h3>Important note</h3>

            <p>
              Firebase test rules expire, so teams should replace them with proper rules for longer-term use.
              Poker0matic keeps the backend simple, but the database still belongs to the team using it.
            </p>
          </article>
        </div>

        <article class="landing-card landing-card-code">
          <div class="landing-card-code-head">
            <div>
              <h3>Realtime Database rules</h3>

              <p>
                These example rules are updated for the current Poker0matic room schema and are a better starting
                point than the default temporary snippet.
              </p>
            </div>
          </div>

          <pre class="landing-code-block"><code>{{ firebaseRules }}</code></pre>
        </article>

        <div class="landing-actions">
          <v-btn
            class="p0-btn p0-btn-primary landing-cta"
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

        <div class="landing-grid landing-grid-two">
          <article class="landing-card landing-card-emphasis">
            <h3>Why this page exists</h3>

            <p>
              Poker0matic is a free project with no ads and no paid unlocks. The goal is to keep planning poker
              fast, lightweight, and easy to run for teams that want control over their own backend.
            </p>
          </article>
        </div>

        <article class="landing-card landing-card-featured">
          <h3>Base project thanks</h3>

          <p>
            Poker0matic is directly inspired by <strong>sky0matic's Poker0matic</strong>. That project helped
            establish the original idea and deserves explicit credit as the upstream foundation this version grew
            from.
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
        <span class="landing-footer-brand">Poker0matic</span>
        <span class="landing-footer-text">Collaborative planning poker for scrum teams using their own Firebase backend.</span>
      </div>

      <div class="landing-footer-links">
        <button class="landing-footer-link" type="button" @click="currentTab = 'pitch'">Overview</button>
        <button class="landing-footer-link" type="button" @click="currentTab = 'firebase'">Firebase</button>
        <button class="landing-footer-link" type="button" @click="currentTab = 'about'">About</button>
        <router-link class="landing-footer-link landing-footer-link-accent" to="/app">Open app</router-link>
      </div>
    </footer>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import { useConfigStore } from '@/stores/config'

  type LandingTabId = 'pitch' | 'firebase' | 'about'

  const configStore = useConfigStore()
  configStore.initializeConfig()

  const currentTab = ref<LandingTabId>('pitch')
  const voteOptions = ['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕']
  const tabs: Array<{ id: LandingTabId, label: string }> = [
    { id: 'pitch', label: 'Overview' },
    { id: 'firebase', label: 'How it works' },
    { id: 'about', label: 'About' },
  ]
  const firebaseSteps = [
    {
      id: '01',
      title: 'Create a Firebase project',
      body: 'Open Firebase Console, create a project with any name you want, and skip extra services you do not need.',
    },
    {
      id: '02',
      title: 'Enable Realtime Database',
      body: 'Turn on Firebase Realtime Database, choose a region, and start with the database settings required to get rooms working.',
    },
    {
      id: '03',
      title: 'Register a web app',
      body: 'Firebase gives you a config snippet with keys like apiKey, authDomain, databaseURL, projectId, and appId.',
    },
    {
      id: '04',
      title: 'Paste the values into Poker0matic',
      body: 'Open the configuration page or modal in Poker0matic, paste the values into the matching fields, and save.',
    },
  ]
  const firebaseRules = `{
  "rules": {
    "rooms": {
      ".read": false,
      ".write": false,
      "$room_id": {
        ".read": "true",
        ".write": "true",

        "name": { ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 60" },
        "createdAt": { ".validate": "newData.isNumber()" },
        "createdBy": { ".validate": "newData.isString()" },
        "createdByUserId": { ".validate": "newData.val() === null || newData.isString()" },
        "leaderUserId": { ".validate": "newData.val() === null || newData.isString()" },
        "committedVote": { ".validate": "newData.val() === null || newData.isString()" },
        "roundNumber": { ".validate": "newData.isNumber() && newData.val() >= 1" },
        "lastActivity": { ".validate": "newData.isNumber()" },

        "currentTask": {
          ".validate": "newData.val() === null || (newData.hasChildren(['title']) && newData.child('title').isString() && newData.child('title').val().length > 0 && newData.child('title').val().length <= 120 && (!newData.child('url').exists() || newData.child('url').val() === null || (newData.child('url').isString() && newData.child('url').val().length <= 500)) && (!newData.child('description').exists() || newData.child('description').val() === null || newData.child('description').isString()))"
        },

        "roundEditLock": {
          ".validate": "newData.val() === null || (newData.hasChildren(['userId', 'userName', 'acquiredAt']) && newData.child('userId').isString() && newData.child('userName').isString() && newData.child('userName').val().length > 0 && newData.child('userName').val().length <= 20 && newData.child('acquiredAt').isNumber())"
        },

        "settings": {
          "showVotes": { ".validate": "newData.isBoolean()" },
          "v": { ".validate": "newData.isNumber()" },
          "deck": { ".validate": "newData.isString() && (newData.val() === 'fibonacci' || newData.val() === 'linear' || newData.val() === 'tshirt' || newData.val() === 'custom')" },
          "customDeck": { ".validate": "newData.val() === null || newData.isString()" },
          "specialQuestion": { ".validate": "newData.isBoolean()" },
          "specialCoffee": { ".validate": "newData.isBoolean()" },
          "historyEnabled": { ".validate": "newData.isBoolean()" },
          "leaderModeEnabled": { ".validate": "newData.isBoolean()" },
          "taskInformationEnabled": { ".validate": "newData.isBoolean()" }
        },

        "users": {
          "$user_id": {
            ".validate": "newData.hasChildren(['name', 'joinedAt'])",
            "name": { ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 20" },
            "joinedAt": { ".validate": "newData.isNumber()" },
            "vote": { ".validate": "newData.val() === null || newData.isString() || newData.isNumber()" },
            "avatarStyle": { ".validate": "newData.val() === null || newData.isString()" },
            "avatarSeed": { ".validate": "newData.val() === null || newData.isString()" },
            "avatarBg": { ".validate": "newData.val() === null || newData.isString()" }
          }
        },

        "history": {
          "$history_id": {
            ".validate": "newData.hasChildren(['id', 'finalVote', 'round', 'participantCount', 'consensus'])",
            "id": { ".validate": "newData.isString()" },
            "title": { ".validate": "newData.val() === null || newData.isString()" },
            "url": { ".validate": "newData.val() === null || newData.isString()" },
            "description": { ".validate": "newData.val() === null || newData.isString()" },
            "finalVote": { ".validate": "newData.val() === null || newData.isString()" },
            "avg": { ".validate": "newData.val() === null || newData.isString()" },
            "closest": { ".validate": "newData.val() === null || newData.isString()" },
            "round": { ".validate": "newData.isNumber() && newData.val() >= 1" },
            "durationMs": { ".validate": "newData.val() === null || newData.isNumber()" },
            "completedAt": { ".validate": "newData.val() === null || newData.isNumber()" },
            "participantCount": { ".validate": "newData.isNumber() && newData.val() >= 0" },
            "consensus": { ".validate": "newData.isString() && (newData.val() === 'yes' || newData.val() === 'split')" },
            "votes": {
              "$vote_user_id": { ".validate": "newData.isString()" }
            },
            "voteSnapshots": {
              "$vote_user_id": {
                ".validate": "newData.hasChildren(['name', 'vote']) && newData.child('name').isString() && (newData.child('vote').isString() || newData.child('vote').isNumber())"
              }
            }
          }
        }
      }
    }
  }
}`
  const aboutCredits = [
    {
      title: 'DiceBear',
      body: 'Used for avatar generation so every player can have a lightweight identity without uploading profile images.',
      href: 'https://www.dicebear.com/',
      label: 'DiceBear',
    },
    {
      title: 'Magnific',
      body: 'Used in the icon generation workflow while shaping the project branding and public visuals.',
      href: 'https://docs.magnific.com/api-reference/icon-generation/overview',
      label: 'Magnific',
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
</script>

<style scoped>
  .landing-page {
    margin: 0 auto;
    max-width: 1240px;
    padding: 40px 24px 96px;
    position: relative;
    z-index: 1;
  }

  .landing-topbar {
    align-items: center;
    backdrop-filter: blur(16px);
    background: rgba(10, 12, 16, .58);
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
      linear-gradient(180deg, color-mix(in oklab, var(--bg-2), white 2%), var(--bg-1)),
      var(--bg-1);
    border: 1px solid var(--border);
    border-radius: 28px;
    box-shadow: 0 30px 80px rgba(0, 0, 0, .34);
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
    align-items: center;
    aspect-ratio: 3 / 4;
    background: linear-gradient(180deg, var(--card-face), var(--card-face-2));
    border: 1px solid rgba(0, 0, 0, .08);
    border-radius: 18px;
    color: var(--card-ink);
    display: flex;
    font-family: var(--font-mono);
    font-size: 1.2rem;
    font-weight: 700;
    justify-content: center;
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
    background: color-mix(in oklab, var(--bg-1), white 2%);
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
    box-shadow: 0 20px 60px rgba(0, 0, 0, .18);
    padding: 28px;
  }

  .landing-card-featured p strong {
    color: var(--text-1);
  }

  .landing-card-code {
    gap: 18px;
    padding: 24px;
  }

  .landing-card-code-head {
    align-items: flex-start;
    display: flex;
    justify-content: space-between;
  }

  .landing-code-block {
    background: rgba(4, 7, 10, .72);
    border: 1px solid color-mix(in oklab, var(--border), black 12%);
    border-radius: 18px;
    color: #d6edf2;
    font-family: var(--font-mono);
    font-size: .82rem;
    line-height: 1.6;
    margin: 0;
    overflow-x: auto;
    padding: 18px;
    white-space: pre;
  }

  .landing-flow {
    display: grid;
    gap: 18px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .landing-step {
    background: var(--bg-1);
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

    .landing-vote-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
</style>
