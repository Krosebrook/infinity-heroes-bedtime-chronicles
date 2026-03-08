<!--
SPDX-License-Identifier: Apache-2.0
-->

# Operational Runbook

**Project:** Infinity Heroes: Bedtime Chronicles  
**Environment:** Vercel (Production) + Google Gemini API  
**Audience:** On-call engineers, DevOps, maintainers

---

## 1. Service Overview

| Component | Technology | Owner |
|-----------|-----------|-------|
| Frontend SPA | React 19 / Vite / Vercel CDN | Vercel |
| Serverless API | Vercel Functions (`api/*.ts`) | Vercel |
| AI backend | Google Gemini (`gemini-3-pro-preview`, `gemini-2.5-flash-*`) | Google |
| Client storage | Browser IndexedDB | Browser |
| PWA service worker | Workbox (auto-update) | Vercel CDN |

There is **no database server** and **no authentication service** — all user data is stored client-side in IndexedDB.

---

## 2. Key URLs & Dashboards

| Resource | URL |
|----------|-----|
| Production app | `https://<your-vercel-domain>.vercel.app` |
| Vercel dashboard | https://vercel.com/dashboard |
| Vercel function logs | Vercel Dashboard → Project → Functions → Logs |
| Gemini API console | https://aistudio.google.com/ |
| GitHub repository | https://github.com/Krosebrook/infinity-heroes-bedtime-chronicles |
| CI workflow status | GitHub → Actions tab |

---

## 3. Incident Response

### Severity Levels

| Level | Description | Response Time |
|-------|-------------|--------------|
| P1 — Critical | App completely down, data loss, security breach | 1 hour |
| P2 — High | Core feature broken (story generation fails) | 4 hours |
| P3 — Medium | Degraded performance, minor feature broken | 24 hours |
| P4 — Low | Cosmetic issues, docs gaps | Next sprint |

### On-Call Steps

1. **Detect** — Monitor Vercel dashboard for function errors and deployment failures.
2. **Assess** — Check if the issue is in the frontend, serverless functions, or Gemini API.
3. **Communicate** — Post an incident update in the team channel within 30 minutes.
4. **Mitigate** — Apply a rollback or hotfix (see procedures below).
5. **Resolve** — Confirm fix is live and verified.
6. **Post-mortem** — Update this runbook within 24 hours of resolution.

---

## 4. Deployment

### Normal Deployment (Continuous Delivery)

Every merged PR to `main` triggers an automatic Vercel deployment:

```
Merge PR to main
  → GitHub CI passes (typecheck + build + security scan)
  → Vercel build triggered automatically
  → New deployment promoted to production (zero-downtime)
```

### Manual Deployment

```bash
# Install Vercel CLI if not present
npm i -g vercel

# Deploy to preview (staging)
vercel

# Deploy to production explicitly
vercel --prod
```

### Environment Variables

All secrets are set in **Vercel Project Settings → Environment Variables**. Never commit them to git.

| Variable | Scope | Description |
|----------|-------|-------------|
| `GEMINI_API_KEY` | Production, Preview, Development | Google Gemini API key |

To rotate the API key:
1. Generate a new key at [Google AI Studio](https://aistudio.google.com/apikey).
2. Add the new key in Vercel under **Environment Variables**.
3. Trigger a redeployment (push an empty commit or click **Redeploy** in Vercel UI).
4. Verify story generation works in production.
5. Revoke the old key in Google AI Studio.

---

## 5. Rollback Procedure

### Rollback to Previous Deployment (Vercel)

1. Open the Vercel dashboard for this project.
2. Navigate to **Deployments**.
3. Find the last known-good deployment.
4. Click **⋯ → Promote to Production**.
5. Verify the rollback by loading the production URL and generating a test story.

### Rollback via Git

```bash
# Find the commit to revert to
git log --oneline -10

# Create a revert commit (preferred — preserves history)
git revert <bad-commit-sha>
git push origin main

# Or, if a direct reset is absolutely necessary (coordinate with team first)
git reset --hard <good-commit-sha>
git push --force-with-lease origin main
```

---

## 6. Common Operational Issues

### 6.1 Story Generation Returns Error or Times Out

**Symptoms:** `Error generating story` toast, network 500/503 response from `/api/generate-story`.

**Checks:**
1. Verify `GEMINI_API_KEY` is set in Vercel environment variables.
2. Check Vercel function logs for the specific error.
3. Check [Google Gemini API status](https://developers.generativeai.google/available_regions).
4. Verify API quota has not been exhausted (Google AI Studio → Usage).

**Resolution:**
- Quota exhausted → upgrade plan or wait for quota reset.
- Invalid key → rotate the API key (see Section 4).
- Model unavailable → update the model name in `api/generate-story.ts` to a stable fallback.

### 6.2 Images Fail to Generate (Avatars or Scenes)

**Symptoms:** Broken image icons, `generateAvatar` / `generateSceneIllustration` returns null.

**Checks:**
1. Inspect browser DevTools → Network → `/api/generate-avatar` and `/api/generate-scene` responses.
2. Check if `gemini-2.5-flash-image` model is available in your API key's region.

**Resolution:**
- Model unavailable → try `gemini-2.0-flash-preview-image-generation` as a fallback in `api/generate-avatar.ts` and `api/generate-scene.ts`.
- Quota → see 6.1.

### 6.3 Narration Not Playing

**Symptoms:** Play button appears but audio is silent; `NarrationManager` errors in console.

**Checks:**
1. Verify browser supports Web Audio API (Firefox, Chrome, Safari all do).
2. Check if the browser requires a user gesture before starting AudioContext (common on mobile Safari).
3. Inspect DevTools → Network → `/api/generate-narration` for errors.
4. Confirm PCM data is being returned (Content-Type: `audio/pcm` or raw binary).

**Resolution:**
- Ensure the **Play** button triggers AudioContext.resume() (this is already in `NarrationManager.ts`).
- If TTS model is unavailable, gracefully degrade to silent reading mode.

### 6.4 PWA Does Not Update After Deployment

**Symptoms:** Users still see the old version after a deployment.

**Checks:**
1. The Workbox service worker uses an **auto-update** strategy — it will prompt the user to reload on next visit.
2. Check `vite.config.ts` for `registerType: 'autoUpdate'`.

**Resolution:**
- Hard reload (`Ctrl+Shift+R`) clears the service worker cache for debugging.
- To force all users to update immediately, bump the PWA `revision` field or clear the Workbox precache manifest. In practice, the auto-update strategy handles this within one page lifecycle.

### 6.5 Build Fails in CI

**Symptoms:** GitHub Actions CI shows a failed build job.

**Checks:**
1. Click the failed workflow run in GitHub → Actions.
2. Expand the failing step to read the error.
3. Common causes: TypeScript errors, missing environment variable in CI, `npm audit` finding a high-severity vulnerability.

**Resolution:**
- TypeScript error: fix the type error in the affected file.
- `npm audit` failure: run `npm audit fix` or pin a safe version.
- Missing env in CI: add the variable to GitHub repository secrets and reference it in the workflow.

### 6.6 IndexedDB Migration Failure

**Symptoms:** `StorageManager` error on load; saved stories not visible in Memory Jar.

**Checks:**
1. Open DevTools → Application → IndexedDB → `infinityHeroesDB`.
2. Check the current schema version (should be `4`).
3. Look for JavaScript errors related to `onupgradeneeded`.

**Resolution:**
- If a schema migration is incomplete, increment the version in `lib/StorageManager.ts` and add a migration branch in `onupgradeneeded`.
- As a last resort (dev environments only), clear the database from DevTools → Application → Clear Storage.

---

## 7. Performance Baselines

Track these after each major release to detect regressions:

| Metric | Baseline | Alert Threshold |
|--------|---------|-----------------|
| JS bundle (gzipped) | 115 KB | > 200 KB |
| CSS bundle (gzipped) | 14 KB | > 30 KB |
| First Contentful Paint | < 1.5 s | > 3 s |
| Time to Interactive | < 2.5 s | > 5 s |
| Lighthouse PWA score | ≥ 90 | < 80 |
| Story generation latency (p95) | < 15 s | > 30 s |

Run a Lighthouse audit before major releases:
```bash
# After building and starting preview
npm run build && npm run preview
# Then open Chrome DevTools → Lighthouse → Generate report
```

---

## 8. Security Operations

### API Key Rotation (Scheduled — Quarterly)

1. Generate a new key in Google AI Studio.
2. Update Vercel environment variable.
3. Redeploy.
4. Confirm functionality.
5. Revoke old key.

### Dependency Vulnerability Response

```bash
# Check for vulnerabilities
npm audit

# Auto-fix non-breaking updates
npm audit fix

# Review and manually update breaking changes
npm audit fix --force  # use with caution
```

For any `critical` or `high` severity finding, create a P2 incident and resolve within 24 hours.

### Incident Log

| Date | Severity | Description | Resolution | Post-mortem |
|------|----------|-------------|------------|-------------|
| *(none yet)* | — | — | — | — |

---

## 9. Post-Mortem Template

When an incident is resolved, add a row to the **Incident Log** above and fill in a post-mortem in a GitHub issue using the following template:

```
## Post-Mortem: <Incident Title>

**Date:** YYYY-MM-DD  
**Duration:** X hours Y minutes  
**Severity:** P1/P2/P3  

### Summary
One-paragraph description of what happened and the impact.

### Timeline
- HH:MM — [event]
- HH:MM — [detection]
- HH:MM — [mitigation applied]
- HH:MM — [resolution confirmed]

### Root Cause
What caused the incident?

### Contributing Factors
What made the incident worse or harder to detect?

### Resolution
What was done to fix it?

### Action Items
| Action | Owner | Due Date |
|--------|-------|----------|
| ... | ... | ... |
```

---

*Last updated: March 2026. Update this document within 24 hours of any resolved incident.*

SPDX-License-Identifier: Apache-2.0
