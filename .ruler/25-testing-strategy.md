# Testing Strategy

Automated tests are now part of the expected delivery for new issues. For each
feature, fix, or refactor, add or update the smallest useful set of tests that
protects the behavior being changed.

## Expectations For New Work

- Prefer adding at least one regression test for every issue when there is
  observable behavior to protect.
- Use unit tests for isolated application logic, utility methods, data
  normalization, timers, reactions, configuration encoding, and other pure or
  mostly pure behavior.
- Use end-to-end tests for user-facing browser workflows, route behavior,
  rendering states, modal flows, room interactions, voting, history, timers,
  reactions, and anything that depends on real UI interaction.
- Use both unit and end-to-end tests when an issue changes business logic and
  the user workflow that exposes it.
- Keep tests focused on durable behavior, not incidental implementation
  details. Tests should make it harder to accidentally remove or break an
  expected capability in future work.

## Test Commands

- `npm run test` runs unit tests and end-to-end tests.
- `npm run test:unit` runs Vitest unit tests.
- `npm run test:e2e` runs Playwright browser tests.
- `npm run test:e2e:ui` opens the Playwright UI runner for interactive browser
  debugging.

Run the most relevant targeted test while iterating, then run the broader
validation set before finishing meaningful changes.

## End-To-End Test Design

- Put Playwright tests under `tests/e2e/`.
- Keep feature-oriented tests readable with `Feature:` and `Scenario:` naming.
- Use shared helpers under `tests/e2e/support/` for repeated setup, such as
  completing the initial name prompt, configuring Firebase, and creating fresh
  rooms for room workflow tests.
- Create a fresh room for room workflow tests unless the test specifically needs
  to verify persistence across an existing room.
- Prefer testing full browser workflows over manually mutating application state
  from tests.
- The Playwright dev server enables the E2E-only Firebase database mock through
  `VITE_POKER0MATIC_FIREBASE_MOCK=1`. Do not enable that mock in production
  builds or normal application code.

## Stable UI Selectors

Use `data-test-id` attributes for UI elements that end-to-end tests need to
click, fill, inspect, or wait on. Avoid fragile selectors based on CSS classes,
DOM depth, or translated copy when the element is part of a durable workflow.

- Add `data-test-id` to buttons, fields, menus, modals, cards, tabs, toggles,
  and repeated list items that tests manipulate or assert against.
- Use predictable names such as `room-reveal-votes`, `vote-card`,
  `profile-save`, or `firebase-save-config`.
- For repeated items, combine a stable `data-test-id` with a data attribute that
  identifies the item, such as `data-card-value` or `data-player-name`.
- Keep `data-test-id` attributes user-invisible and behavior-neutral.
