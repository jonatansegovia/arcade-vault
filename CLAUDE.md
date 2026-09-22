# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project state

This is a freshly scaffolded `create-next-app` project (Next.js 16.3.5, React 19.2.8, App Router, TypeScript, Tailwind CSS v4). `app/page.tsx` still contains the default starter content — no application features exist yet.

Per `README.md`, the intended product is **Arcade Vault**: an online platform for playing games and competing for high scores. Development is meant to follow **Spec Driven Design** using the `/spec` and `/spec-impl` skills from https://github.com/Klerith/fernando-skills, installed via:

```bash
npx skills@latest add Klerith/fernando-skills
```

Check whether these skills are installed before starting feature work; if not, install them first.

## Commands

```bash
npm run dev     # start dev server (localhost:3000)
npm run build   # production build
npm run start   # serve production build
npm run lint    # eslint (flat config, eslint-config-next)
```

No test runner is configured yet.

## Architecture notes

- **This is not the Next.js you know.** Per `AGENTS.md`, this version (16.3.5) has breaking changes vs. training data. Before writing code, consult `node_modules/next/dist/docs/` — sections: `01-app/` (App Router guide), `02-pages/`, `03-architecture/`, `04-community/`. Resolve the path relative to this file's directory, since in monorepos `next` may not be visible from the repo root.
- App Router only (`app/` directory) — no `pages/` directory exists.
- Path alias `@/*` maps to the project root (`tsconfig.json`).
- Styling is Tailwind CSS v4 via `@tailwindcss/postcss` (see `postcss.config.mjs`), not a `tailwind.config.js`-based v3 setup.
- The `AGENTS.md` block at the repo root is auto-generated/re-added by `next dev` (see `node_modules/next/dist/server/lib/generate-agent-files.js`). Commit it as-is rather than stripping it.
