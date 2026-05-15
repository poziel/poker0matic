# Commands And Verification

Use these npm scripts for local work:

```bash
npm run dev          # Start dev server on port 3000
npm run build        # Type-check + Vite production build -> dist/
npm run preview      # Serve dist/ locally
npm run type-check   # Vue TSC type validation only
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run mcp          # Apply Ruler-generated agent files
npm run mcp:dry      # Preview Ruler-generated agent file changes
npm run mcp:revert   # Revert Ruler-generated agent file changes
```

No test framework is configured. Use `npm run type-check`, `npm run lint`, and
`npm run build` as the main verification commands.

Deployment is automatic via GitHub Actions on push to `main`, building and
publishing to GitHub Pages at `/poker0matic/`.

## Generated Files

- Treat `.ruler/` as the editable source of truth for agent instructions.
- Treat root `AGENTS.md` and other agent-specific instruction outputs as generated files.
- Regenerate agent outputs with `npm run mcp` after editing `.ruler` sources.
- Use `npm run mcp:dry` before applying when you need to inspect generated output scope.
