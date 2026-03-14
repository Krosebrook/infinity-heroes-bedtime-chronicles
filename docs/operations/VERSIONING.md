<!--
SPDX-License-Identifier: Apache-2.0
-->

# Release & Versioning Policy

**Project:** Infinity Heroes: Bedtime Chronicles  
**Versioning scheme:** [Semantic Versioning 2.0.0](https://semver.org/)  
**Changelog format:** [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/)

---

## 1. Version Number Format

```
MAJOR.MINOR.PATCH
```

| Part | When to increment | Example trigger |
|------|-------------------|----------------|
| **MAJOR** | Breaking change in public API, IndexedDB schema migration requiring user data clear, or removal of a core feature | Removing Classic mode; bumping IndexedDB to a version that cannot auto-migrate |
| **MINOR** | Backward-compatible new feature | Adding a new story mode; adding a new narrator voice |
| **PATCH** | Backward-compatible bug fix or security patch | Fixing narration playback on iOS Safari; patching a dependency vulnerability |

### Pre-release Labels

| Label | Usage |
|-------|-------|
| `1.1.0-alpha.1` | Internal only; not production-ready |
| `1.1.0-beta.1` | Shared with testers; may have known issues |
| `1.1.0-rc.1` | Release candidate; code-frozen, final QA |

---

## 2. Current Version

The canonical version lives in **`package.json`** (`"version"` field). The `CHANGELOG.md` must always have a corresponding entry.

```bash
# Read current version
node -e "console.log(require('./package.json').version)"
```

---

## 3. Release Workflow

### Step-by-Step

```
1. Feature complete on a branch → PR opened → CI green → code reviewed → PR merged to main
2. Decide the next version number (semver rules above)
3. Update CHANGELOG.md:
   a. Add a new ## [X.Y.Z] - YYYY-MM-DD section at the top
   b. Move items from ## [Unreleased] into the new version section
   c. Add a new empty ## [Unreleased] section above it
4. Bump version in package.json
5. Commit: git commit -m "chore: release vX.Y.Z"
6. Tag:    git tag -a vX.Y.Z -m "Release vX.Y.Z"
7. Push:   git push origin main && git push origin vX.Y.Z
8. Vercel automatically deploys from the main push
9. Create a GitHub Release from the tag (paste CHANGELOG entry as body)
```

### Automated Version Bump (optional helper)

```bash
# Patch release (1.0.0 → 1.0.1)
npm version patch -m "chore: release v%s"

# Minor release (1.0.1 → 1.1.0)
npm version minor -m "chore: release v%s"

# Major release (1.1.0 → 2.0.0)
npm version major -m "chore: release v%s"
```

`npm version` updates `package.json`, creates a git commit, and tags it automatically. Push the commit and tag separately:

```bash
git push origin main
git push origin --tags
```

---

## 4. CHANGELOG Conventions

Follow [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Each release section uses these subsections:

| Subsection | What goes here |
|-----------|---------------|
| **Added** | New features |
| **Changed** | Changes to existing functionality |
| **Deprecated** | Features soon to be removed |
| **Removed** | Features removed in this release |
| **Fixed** | Bug fixes |
| **Security** | Security patches or vulnerability fixes |

**Rules:**
- Every PR that changes user-visible behaviour must add an entry to `## [Unreleased]`.
- Security fixes are always listed first within their release section.
- Keep entries concise — one sentence per item.
- Reference related GitHub issues or PRs: `(#123)`.

---

## 5. Branch Strategy

```
main ─────────────────────────────────────── production (always deployable)
       └── feat/new-sleep-voice ──── PR ──►  merged with squash commit
       └── fix/ios-audio-bug   ──── PR ──►  merged with squash commit
       └── chore/deps-update   ──── PR ──►  merged with squash commit
```

| Branch | Purpose | Protected? |
|--------|---------|-----------|
| `main` | Production-ready code at all times | ✅ Yes |
| `feat/*` | New features | ❌ No |
| `fix/*` | Bug fixes | ❌ No |
| `docs/*` | Documentation-only changes | ❌ No |
| `chore/*` | Tooling, dependency, housekeeping | ❌ No |
| `hotfix/*` | Emergency production fixes (merge directly to main, tag immediately) | ❌ No |

### Merge Strategy

- All PRs use **squash merges** to keep `main` history clean.
- The squash commit message must follow [Conventional Commits](https://www.conventionalcommits.org/):
  ```
  feat: add ocean soundscape for Sleep mode
  fix: prevent double-play bug on narration resume
  docs: add RUNBOOK operational guide
  chore: bump framer-motion to 11.18.3
  security: rotate Gemini API key pattern detection
  ```

---

## 6. Hotfix Process

For critical bugs or security issues in production that cannot wait for the normal release cycle:

```
1. Create branch: git checkout -b hotfix/description main
2. Apply minimal fix
3. Update CHANGELOG.md (add PATCH version entry)
4. Bump version: npm version patch
5. Open PR directly against main
6. Get at least one approval (waive if P1 security incident)
7. Merge and tag
8. Deploy (Vercel auto-deploys from main)
```

---

## 7. Supported Versions

| Version | Status | Notes |
|---------|--------|-------|
| `main` (latest) | ✅ Supported | Always receives patches and features |
| `< 1.0.0` | ❌ Not supported | Pre-release; upgrade to latest |

---

## 8. Communication

| Audience | Channel | When |
|----------|---------|------|
| All users | GitHub Releases page | Every tagged release |
| Contributors | CHANGELOG.md in repo | Every PR that changes behaviour |
| Security-sensitive | SECURITY.md + private email | Every security patch |

---

*See also: [`CHANGELOG.md`](../../CHANGELOG.md) for the full release history.*

SPDX-License-Identifier: Apache-2.0
