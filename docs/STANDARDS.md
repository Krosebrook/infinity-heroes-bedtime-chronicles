<!--
SPDX-License-Identifier: Apache-2.0
-->

# Coding & Documentation Standards

**Project:** Infinity Heroes: Bedtime Chronicles  
**Audience:** All contributors  
**Status:** Living document — update when conventions change

---

## 1. TypeScript Standards

| Rule | Requirement | Rationale |
|------|-------------|-----------|
| Strict mode | `"strict": true` in `tsconfig.json` | Catches null-safety and type-narrowing errors at compile time |
| No implicit `any` | Always provide explicit types | Prevents type unsafety that leads to runtime errors |
| No explicit `any` | Prefer `unknown` + type guards | `any` disables type checking entirely |
| Return types | Add return types to all exported functions | Makes API surface explicit and enables editor intelligence |
| Interfaces vs. types | Use `interface` for objects; `type` for unions/intersections/primitives | Consistent and follows TypeScript team guidance |
| Path aliases | Use `@/` for project-root imports | Avoids fragile relative paths like `../../lib/Logger` |
| Avoid `!` non-null assertion | Use type guards or optional chaining instead | `!` hides null/undefined bugs |
| Prefer `const` | Use `const` for all values that are not reassigned | Signals immutability clearly |

```typescript
// ✅ Good
import { Logger } from '@/lib/Logger';

export interface StoryPart {
  text: string;
  choices: Choice[];
}

export const fetchStory = async (params: StoryParams): Promise<StoryFull> => { ... };

// ❌ Avoid
import Logger from '../../lib/Logger';
const fetchStory = async (params: any) => { ... };
```

---

## 2. React Component Standards

| Rule | Requirement | Rationale |
|------|-------------|-----------|
| Component style | `const MyComponent: React.FC<Props> = (props) => { ... }` | Consistent across the codebase |
| Named exports | Always use named exports; no default exports for components | Improves refactoring safety and import clarity |
| Props interface | Define a local `interface MyComponentProps` above the component | Keeps the component self-documented |
| Optional props | Mark optional props with `?` and provide defaults | Prevents unhandled `undefined` bugs |
| Hooks order | Declare all hooks at the top of the function body, before any early returns | Required by the Rules of Hooks |
| Memoisation | Use `useCallback`/`useMemo` only when there is a measurable performance reason | Premature optimisation adds complexity |
| Keys in lists | Always provide stable, unique `key` props in `.map()` | Prevents React reconciliation bugs |
| Error boundaries | Wrap async-loading sections in `<ErrorBoundary>` | Prevents one component crash from killing the whole app |

```typescript
// ✅ Good
interface StoryCardProps {
  story: StoryFull;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  onSelect,
  isLoading = false,
}) => { ... };
```

---

## 3. File & Folder Naming

| Item | Convention | Example |
|------|-----------|---------|
| React components | `PascalCase.tsx` | `ReadingView.tsx` |
| Hooks | `camelCase.ts`, prefixed `use` | `useStoryEngine.ts` |
| Utilities / managers | `PascalCase.ts` | `StorageManager.ts`, `NarrationManager.ts` |
| Type definition files | `camelCase.ts` | `types.ts` |
| API endpoints | `kebab-case.ts` inside `api/` | `generate-story.ts` |
| Documentation | `SCREAMING_SNAKE_CASE.md` | `ARCHITECTURE.md`, `ONBOARDING.md` |
| Test files | Co-located, suffix `.test.ts(x)` | `useStoryEngine.test.ts` |

---

## 4. Logging Standards

| Context | Tool | Rule |
|---------|------|------|
| Client-side code (`*.tsx`, `*.ts` outside `api/`) | `Logger` from `@/lib/Logger` | **Never** use `console.*` in client code |
| Serverless API functions (`api/*.ts`) | `console.log` / `console.error` | Acceptable; Vercel captures these in function logs |
| Sensitive data | Never log API keys, user input, or PII | Violates COPPA and security policy |

```typescript
// ✅ Good (client code)
import { logger } from '@/lib/Logger';
logger.info('Story generation started', { mode, heroName });

// ❌ Bad (client code)
console.log('Story generation started', { mode, heroName });

// ✅ OK (API function)
console.log('[generate-story] Received request');
```

---

## 5. License Headers

Every source file (`.ts`, `.tsx`) must begin with:

```typescript
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
```

The CI pipeline enforces this. New files without the header will fail the `security` job.

---

## 6. Child Safety & COPPA Requirements

All code must comply with COPPA. The following are **hard requirements**, not suggestions:

| Requirement | Detail |
|-------------|--------|
| No analytics or tracking | No Google Analytics, Mixpanel, Hotjar, or equivalent |
| No PII collection | Hero name lives in React state only; never sent to a server beyond the Gemini prompt |
| No third-party cookies | No cookie consent banners; no `document.cookie` writes for tracking |
| No social media | No Facebook, Twitter/X, Instagram, TikTok integrations |
| No ads | No advertising networks |
| No external navigation links | No `<a href>` pointing outside the app |
| Age-appropriate AI content | System prompt must include child-safety guardrails |

See [`CHILD_SAFETY_COMPLIANCE.md`](../CHILD_SAFETY_COMPLIANCE.md) for full compliance documentation.

---

## 7. Security Standards

| Rule | Detail |
|------|--------|
| No `eval()` or `new Function()` | Prohibited by CSP and by ESLint rule |
| No `dangerouslySetInnerHTML` | Unless content is sanitised and approved in a PR review |
| Sanitise AI output | Strip any URLs or HTML from Gemini-generated text before rendering |
| API keys in env vars only | Never hardcode; never ship in client bundle |
| Method validation in API functions | Every `api/*.ts` must check `req.method === 'POST'` |
| Error messages | Do not leak stack traces or secrets in HTTP error responses |

---

## 8. Git Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <short summary>

[optional body]

[optional footer: closes #123]
```

| Type | When to use |
|------|-------------|
| `feat` | New user-visible feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `chore` | Build, dependencies, tooling |
| `security` | Security patch |
| `test` | Adding or fixing tests |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |

**Examples:**
```
feat: add Zephyr narrator voice to voice selector
fix(narration): prevent double-play on iOS Safari resume
docs: add RUNBOOK operational guide
chore: bump framer-motion 11.18.2 → 11.18.3
security: patch XSS in AI output rendering
```

---

## 9. Pull Request Checklist

Every PR must satisfy these before merging:

### Code Quality
- [ ] `npx tsc --noEmit` exits with code 0
- [ ] `npm run lint` exits with code 0 and 0 warnings
- [ ] `npm run build` succeeds
- [ ] No `console.*` added to client-side code (use `logger`)
- [ ] No `any` types introduced without justification
- [ ] License header present on all new files

### Security
- [ ] No hardcoded secrets or API keys
- [ ] No `eval()` / `new Function()` / `dangerouslySetInnerHTML`
- [ ] API key not exposed in client bundle
- [ ] Input validated before passing to AI
- [ ] Error responses do not leak sensitive data

### Child Safety (COPPA)
- [ ] No analytics or tracking code added
- [ ] No PII collected or transmitted
- [ ] No external navigation links
- [ ] No social media integrations
- [ ] Generated content remains age-appropriate (7–9 years)

### Documentation
- [ ] `CHANGELOG.md` `[Unreleased]` section updated (if user-visible change)
- [ ] Relevant docs in `docs/` updated (if architecture or API changed)
- [ ] New env vars added to `docs/CONFIGURATION.md`

---

## 10. Documentation Standards

| Requirement | Detail |
|-------------|--------|
| Format | Markdown (`.md`) |
| License footer | Every doc must end with `SPDX-License-Identifier: Apache-2.0` |
| Headings | Use `##` for top-level sections inside a doc (the `#` is the doc title) |
| Tables | Use for comparisons, option lists, and reference material |
| Code blocks | Use fenced code blocks with language identifier (` ```typescript `, ` ```bash `, etc.) |
| Prose length | Keep paragraphs short (3–5 sentences max); use bullet lists for steps |
| Links | Use relative Markdown links within the repository (`[RUNBOOK](docs/RUNBOOK.md)`) |
| Staleness | Update docs in the same PR as the related code change |

---

## 11. Dependency Management

| Rule | Detail |
|------|--------|
| Minimise dependencies | Prefer built-in browser APIs or TypeScript stdlib before adding a package |
| Audit before adding | Run `npm audit` and check the advisory database before installing any new package |
| Pin dev deps | Dev dependencies may use `^` range; always review and test after major bumps |
| Lock file | Always commit `package-lock.json`; never use `--no-package-lock` |
| Remove unused | Delete unused dependencies from `package.json` promptly |

---

*This document is the single source of truth for project conventions. When in doubt, refer here first.*

SPDX-License-Identifier: Apache-2.0
