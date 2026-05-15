# Project Overview

Poker0matic is a real-time collaborative planning poker SPA. Users join a
shared room, cast story-point votes, reveal results together, and keep room
state synchronized through Firebase Realtime Database.

## Stack

- Vue 3 with Composition API and `<script setup>`
- TypeScript for application code
- Vuetify 4 for UI components and styling patterns
- Pinia for local app and configuration state
- Vue Router 5 for navigation and route guards
- Vue I18n for localized copy
- Firebase Realtime Database for room state, votes, users, and history
- Vite for local development and production builds

## Working Rules

- Follow the existing Vue, Vuetify, Pinia, Vue Router, and Vue I18n patterns.
- Use npm for project commands.
- Keep application code in TypeScript.
- Do not commit generated `dist/` output unless explicitly asked.
- Do not add Firebase credentials to source files.
- Firebase configuration is entered by the user, stored in localStorage, and can be shared through encoded URL parameters.
