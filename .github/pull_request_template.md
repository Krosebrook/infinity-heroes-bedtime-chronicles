<!--
SPDX-License-Identifier: Apache-2.0
-->

## Summary

<!-- 1–3 sentences describing what this PR does and why. -->

## Type of Change

<!-- Mark all that apply with an "x" — e.g. [x] -->

- [ ] `feat` — New feature (non-breaking, adds functionality)
- [ ] `fix` — Bug fix (non-breaking, fixes an issue)
- [ ] `docs` — Documentation only
- [ ] `chore` — Build, dependencies, or tooling (no production code change)
- [ ] `security` — Security patch
- [ ] `test` — Adding or fixing tests
- [ ] `refactor` — Code refactor (no feature or bug change)
- [ ] `perf` — Performance improvement
- [ ] `BREAKING CHANGE` — Causes existing functionality to break (requires MAJOR version bump)

## Related Issues

<!-- Link any issues this PR closes or relates to -->
Closes #<!-- issue number -->

---

## Code Quality Checklist

- [ ] `npx tsc --noEmit` passes (zero TypeScript errors)
- [ ] `npm run lint` passes (zero ESLint errors/warnings)
- [ ] `npm run build` succeeds
- [ ] No `console.*` calls added to client-side code (use `logger` from `@/lib/Logger`)
- [ ] No `any` types introduced without documented justification
- [ ] All new `.ts` / `.tsx` files include the Apache-2.0 license header

## Security Checklist

- [ ] No hardcoded API keys, secrets, or credentials
- [ ] No `eval()`, `new Function()`, or `dangerouslySetInnerHTML` without sanitisation
- [ ] API key remains server-side only (not in client bundle)
- [ ] User input validated before passing to AI prompts
- [ ] HTTP error responses do not leak stack traces or secrets
- [ ] CSP in `vercel.json` not weakened by this change

## Child Safety & COPPA Checklist

- [ ] No analytics, tracking, or user behaviour monitoring added
- [ ] No personally identifiable information (PII) collected or transmitted
- [ ] No external navigation links added (links that take children out of the app)
- [ ] No third-party cookies or social media integrations
- [ ] No advertising code
- [ ] AI-generated content remains age-appropriate for children aged 7–9

## Documentation Checklist

- [ ] `CHANGELOG.md` → `[Unreleased]` section updated (for user-visible changes)
- [ ] Relevant docs in `docs/` updated (for architecture or API changes)
- [ ] New env vars or config options added to `docs/CONFIGURATION.md`
- [ ] New architecture decisions recorded in `docs/adr/`

---

## Testing

<!-- Describe how you tested these changes. -->

**Manual testing performed:**
- [ ] Tested in Chrome
- [ ] Tested in Safari
- [ ] Tested on mobile (iOS or Android)
- [ ] Tested offline / PWA mode
- [ ] Tested with all three story modes (Classic, Mad Libs, Sleep)

**Automated testing:**  
<!-- If tests were added, describe them. If no tests exist yet, note that. -->

---

## Screenshots (if applicable)

<!-- Add screenshots for UI changes. -->

---

## Additional Notes

<!-- Anything else reviewers should know? -->
