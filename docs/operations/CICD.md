<!--
SPDX-License-Identifier: Apache-2.0
-->

# CI/CD Pipeline Documentation

**Project:** Infinity Heroes: Bedtime Chronicles  
**Platform:** GitHub Actions + Vercel  
**Audience:** Developers, DevOps

---

## Overview

The project uses a two-stage automated pipeline:

1. **GitHub Actions CI** — runs on every push and pull request to `main`; performs type-checking, production builds, and security scans.
2. **Vercel CD** — automatically deploys every merge to `main` as a production release; every PR gets a unique preview deployment.

```
Developer pushes code
        │
        ▼
┌──────────────────────────────────┐
│         GitHub Actions CI         │
│                                   │
│  Job 1: build                     │
│   ├─ npm ci                       │
│   ├─ npx tsc --noEmit  (typecheck)│
│   └─ npm run build     (Vite)     │
│                                   │
│  Job 2: security                  │
│   ├─ npm audit         (deps)     │
│   ├─ secret scan       (grep)     │
│   └─ license headers   (grep)     │
└──────────────┬───────────────────┘
               │ All jobs pass
               ▼
┌──────────────────────────────────┐
│         Vercel CD                 │
│                                   │
│  PR branch → Preview URL          │
│  main merge → Production deploy   │
└──────────────────────────────────┘
```

---

## Workflow File: `.github/workflows/ci.yml`

### Job: `build`

| Step | Command | Purpose |
|------|---------|---------|
| Checkout | `actions/checkout@v4` | Fetch source code |
| Setup Node | `actions/setup-node@v4` (v20, npm cache) | Install runtime |
| Install deps | `npm ci` | Reproducible install from `package-lock.json` |
| Type-check | `npx tsc --noEmit` | Catch TypeScript errors without emitting files |
| Build | `npm run build` | Verify Vite production build succeeds |

**Failure behaviour:** Any step failure marks the CI run as failed and blocks merging (if branch protection is enabled).

### Job: `security`

| Step | Command | Purpose |
|------|---------|---------|
| Checkout | `actions/checkout@v4` | Fetch source code |
| Setup Node | `actions/setup-node@v4` | Install runtime |
| Install deps | `npm ci` | Reproducible install |
| npm audit | `npm audit --audit-level=high` | Fail on high/critical dependency vulnerabilities |
| Secret scan | grep for `AIza[0-9A-Za-z_-]{35}` in `*.ts`/`*.tsx` | Prevent accidental API key commits |
| License headers | `find … | xargs grep -L "SPDX-License-Identifier"` | Enforce Apache-2.0 header on all source files |

> `npm audit` runs with `continue-on-error: true` — it reports findings but does not block the build. To enforce a hard block, remove that flag.

---

## Vercel Deployment

### How It Works

Vercel is connected directly to the GitHub repository. On every push:

- **Feature branches / PRs** → Vercel builds and deploys to a unique preview URL (e.g., `https://project-abc123.vercel.app`).
- **`main` branch** → Vercel promotes the new build to the production domain.

### Configuration: `vercel.json`

```json
// vercel.json highlights
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options",           "value": "DENY" },
        { "key": "X-Content-Type-Options",    "value": "nosniff" },
        { "key": "Referrer-Policy",           "value": "strict-origin-when-cross-origin" },
        { "key": "Content-Security-Policy",   "value": "script-src 'self'; connect-src 'self' https://generativelanguage.googleapis.com" }
      ]
    }
  ]
}
```

All security headers are applied at the CDN layer — no server-side code required.

### Required Environment Variables (Vercel)

| Variable | Environments | Set In |
|----------|-------------|--------|
| `GEMINI_API_KEY` | Production, Preview, Development | Vercel Dashboard → Settings → Environment Variables |

---

## Adding a New CI Job

1. Open `.github/workflows/ci.yml`.
2. Add a new top-level `jobs` entry following the pattern of existing jobs.
3. Use `needs: [build]` if the new job should only run after the build job passes.

Example — adding a lint job once ESLint is wired into the PR gate:

```yaml
  lint:
    runs-on: ubuntu-latest
    needs: [build]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
```

Example — adding a test job once Vitest is installed:

```yaml
  test:
    runs-on: ubuntu-latest
    needs: [build]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test -- --run
```

---

## Extending the Security Job

### Adding Dependabot

Create `.github/dependabot.yml` to get automated dependency update PRs:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    labels:
      - "dependencies"
      - "automated"
```

### Adding CodeQL Static Analysis

```yaml
  codeql:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript-typescript
      - uses: github/codeql-action/autobuild@v3
      - uses: github/codeql-action/analyze@v3
```

---

## Branch Protection Rules (Recommended)

Configure these in **GitHub → Settings → Branches → Add rule** for `main`:

| Rule | Value |
|------|-------|
| Require status checks to pass | ✅ `build`, `security` |
| Require branches to be up to date | ✅ |
| Require pull request reviews | ✅ 1 approver |
| Restrict force pushes | ✅ |
| Restrict deletions | ✅ |

---

## Troubleshooting CI Failures

| Failure | Likely Cause | Fix |
|---------|-------------|-----|
| `tsc --noEmit` fails | TypeScript error introduced | Fix type errors in the affected file |
| `npm run build` fails | Vite config error or missing import | Check build output for the specific error |
| `npm audit` reports high severity | Dependency vulnerability | Run `npm audit fix`; if breaking, manually pin a safe version |
| Secret scan triggers | API key committed | Remove key from code; rotate it immediately (see RUNBOOK) |
| License header check fails | New file added without header | Add `// SPDX-License-Identifier: Apache-2.0` to top of file |
| Vercel build fails but CI passes | Vercel-specific config issue | Check Vercel deployment logs in the Vercel dashboard |

---

## Planned Improvements

- [ ] Add `npm run lint` to CI once it is stable (no pre-existing warnings)
- [ ] Add `npm run test -- --run` once Vitest is installed
- [ ] Add Lighthouse CI check for performance budget enforcement
- [ ] Add Dependabot configuration for automated dependency updates
- [ ] Enable GitHub secret scanning alerts at the repository level
- [ ] Explore CodeQL for deeper static analysis

---

*See also: [`docs/operations/RUNBOOK.md`](RUNBOOK.md) for deployment and incident response procedures.*

SPDX-License-Identifier: Apache-2.0
