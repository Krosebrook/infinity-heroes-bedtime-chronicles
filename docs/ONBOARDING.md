<!--
SPDX-License-Identifier: Apache-2.0
-->

# Developer Onboarding Checklist

Welcome to **Infinity Heroes: Bedtime Chronicles**! This guide walks a new contributor through everything needed to go from zero to a working development environment, understand the codebase, and submit your first pull request.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- [ ] **Node.js ≥ 18** — check with `node --version` (`.nvmrc` pins `20`)
- [ ] **npm** (bundled with Node.js) — check with `npm --version`
- [ ] **Git** — check with `git --version`
- [ ] **A code editor** (VS Code recommended; the repo includes no editor-specific config, so any editor works)
- [ ] **A Google Gemini API key** — obtain one at [Google AI Studio](https://aistudio.google.com/apikey) (parent/guardian account required for child-safety context)

---

## Step 1 — Clone & Install

```bash
# 1. Clone the repository
git clone https://github.com/Krosebrook/infinity-heroes-bedtime-chronicles.git
cd infinity-heroes-bedtime-chronicles

# 2. Use the correct Node.js version (if you have nvm)
nvm use

# 3. Install all dependencies (uses package-lock.json for reproducibility)
npm ci
```

- [ ] Repository cloned successfully
- [ ] `npm ci` completes with no errors

---

## Step 2 — Configure Environment Variables

```bash
# Copy the example env file (or create it manually)
cp .env.example .env   # if the example file exists
# or manually:
echo "GEMINI_API_KEY=your_key_here" > .env
```

> **Security note:** `.env` is in `.gitignore`. Never commit API keys to source control. The key is used exclusively by Vercel serverless functions at runtime and is never sent to the browser.

- [ ] `.env` file created with a valid `GEMINI_API_KEY`

---

## Step 3 — Start the Development Server

```bash
# Option A: Vite only (UI hot-reload; API calls will fail without a running serverless runtime)
npm run dev
# → http://localhost:3000

# Option B: Full stack (UI + serverless API functions — recommended)
npx vercel dev
# → Vercel CLI emulates the serverless runtime locally
```

- [ ] Dev server starts without errors
- [ ] Browser opens `http://localhost:3000` and the hero setup screen appears

---

## Step 4 — Type-Check & Build

```bash
# Verify TypeScript compiles cleanly (no emit)
npx tsc --noEmit

# Verify production build succeeds
npm run build
# Output should show ~363 KB JS bundle (115 KB gzipped)
```

- [ ] `npx tsc --noEmit` exits with code 0
- [ ] `npm run build` exits with code 0 and writes to `dist/`

---

## Step 5 — Lint the Codebase

```bash
# Run ESLint
npm run lint

# Auto-fix fixable issues
npm run lint:fix
```

- [ ] `npm run lint` reports 0 errors on a clean checkout

---

## Step 6 — Read the Key Documents

Work through these docs in order — each builds on the previous:

- [ ] [`README.md`](../README.md) — Project overview, tech stack, quick-start
- [ ] [`ARCHITECTURE.md`](../ARCHITECTURE.md) — System design and module responsibilities
- [ ] [`docs/DEVELOPMENT.md`](DEVELOPMENT.md) — Local dev workflow, patterns, and tips
- [ ] [`CODE_QUALITY.md`](../CODE_QUALITY.md) — TypeScript conventions, React patterns, naming rules
- [ ] [`docs/STANDARDS.md`](STANDARDS.md) — Consolidated coding standards checklist
- [ ] [`SECURITY.md`](../SECURITY.md) — Security policy and COPPA compliance overview
- [ ] [`CHILD_SAFETY_COMPLIANCE.md`](../CHILD_SAFETY_COMPLIANCE.md) — Age-appropriate content requirements
- [ ] [`CONTRIBUTING.md`](../CONTRIBUTING.md) — Branching, PRs, code-review process
- [ ] [`docs/API.md`](API.md) — Serverless endpoint contracts
- [ ] [`TESTING.md`](../TESTING.md) — Testing strategy (no framework yet; read to understand future intent)

---

## Step 7 — Understand the Codebase

### High-level flow

```
User fills hero form (Setup.tsx)
  → useStoryEngine hook (hooks/useStoryEngine.ts)
    → AIClient.ts calls /api/generate-story
      → Vercel function calls Google Gemini
    → Story JSON returned & persisted in IndexedDB (lib/StorageManager.ts)
  → ReadingView rendered (components/ReadingView.tsx)
    → NarrationManager plays TTS (NarrationManager.ts)
    → SoundManager plays ambient audio (SoundManager.ts)
    → SyncedText highlights words in time (components/SyncedText.tsx)
  → CompletionView shown (components/CompletionView.tsx)
```

### Where to find things

| Question | File(s) |
|----------|---------|
| How is the AI called? | `AIClient.ts`, `api/generate-*.ts` |
| How is state managed? | `hooks/useStoryEngine.ts` |
| How is data persisted? | `lib/StorageManager.ts` |
| How does narration work? | `NarrationManager.ts`, `hooks/useNarrationSync.ts` |
| How is ambient sound made? | `SoundManager.ts` |
| Where are all TypeScript types? | `types.ts` |
| How is the PWA configured? | `vite.config.ts` |
| Where are security headers set? | `vercel.json` |
| Where is logging? | `lib/Logger.ts` |

---

## Step 8 — Run a Smoke Test

1. Open `http://localhost:3000` in a browser.
2. Enter any hero name and select **Classic** mode.
3. Click **Generate Story** and wait for the AI to respond.
4. Verify the story renders with an illustration and narration button.
5. Click **Play** and confirm audio begins.

- [ ] Story generation completes without console errors
- [ ] Illustration loads (may take ~10 s)
- [ ] Narration plays correctly

---

## Step 9 — Your First Contribution

### Branch naming

```
feat/<short-description>     # New features
fix/<short-description>      # Bug fixes
docs/<short-description>     # Documentation only
chore/<short-description>    # Tooling / housekeeping
```

### Checklist before opening a PR

- [ ] Code compiles: `npx tsc --noEmit`
- [ ] Lint passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] All source files have `SPDX-License-Identifier: Apache-2.0` header
- [ ] No hardcoded secrets or API keys
- [ ] COPPA guidelines maintained (no analytics, PII, external links)
- [ ] PR description uses the [pull request template](../.github/pull_request_template.md)

See [`CONTRIBUTING.md`](../CONTRIBUTING.md) for the full contributing workflow.

---

## Step 10 — Explore the Documentation Hub

All project documentation lives in two locations:

| Location | Contents |
|----------|---------|
| Root level (`/*.md`) | Policy & process docs: SECURITY, CONTRIBUTING, TESTING, CHANGELOG, etc. |
| `docs/` folder | Technical reference: ARCHITECTURE, API, DEPLOYMENT, COMPONENTS, CICD, RUNBOOK, etc. |

A full inventory with completeness ratings is in [`docs/DOC_INVENTORY.md`](DOC_INVENTORY.md).

---

## Contacts & Channels

| Topic | Contact |
|-------|---------|
| Security vulnerability | See [`SECURITY.md`](../SECURITY.md) — email only, do NOT use public issues |
| Bug reports | [GitHub Issues](https://github.com/Krosebrook/infinity-heroes-bedtime-chronicles/issues) using the bug report template |
| Feature ideas | [GitHub Issues](https://github.com/Krosebrook/infinity-heroes-bedtime-chronicles/issues) using the feature request template |
| General questions | GitHub Discussions (if enabled) or issue comments |

---

*Estimated time to complete this checklist: **2–4 hours** for a developer already familiar with React/TypeScript.*

SPDX-License-Identifier: Apache-2.0
