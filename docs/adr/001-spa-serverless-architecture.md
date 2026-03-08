<!--
SPDX-License-Identifier: Apache-2.0
-->

# ADR-001: Single-Page App with Serverless API Proxy

**Date:** 2026-02  
**Status:** Accepted  
**Deciders:** Project maintainers

---

## Context

Infinity Heroes generates stories, images, and audio using Google Gemini. The Gemini SDK requires an API key for every request. The key must never be exposed in the client-side JavaScript bundle (it would be trivially extractable by any user viewing page source or network traffic).

The app targets children aged 7–9, which creates strong privacy requirements (COPPA compliance): no server-side user accounts, no session tracking, no PII stored anywhere except the user's own browser.

## Decision

Build the application as a **React Single-Page Application (SPA)** served from a CDN, with all Gemini API calls proxied through **Vercel Serverless Functions** (`api/generate-*.ts`). The API key is stored exclusively as a Vercel environment variable and never sent to the browser.

```
Browser SPA  →  POST /api/generate-story  →  Vercel Function  →  Gemini API
                (no key in payload)           (key injected      (key used
                                               server-side)       here only)
```

## Alternatives Considered

| Alternative | Reason not chosen |
|-------------|------------------|
| Direct client-side Gemini SDK calls | API key would be exposed in the JavaScript bundle — critical security vulnerability |
| Full server-side rendering (Next.js / Remix) | Adds infrastructure complexity; the app has no server-side user sessions to benefit from SSR |
| Backend-for-Frontend (BFF) with Express | Requires a persistent server (cost, ops overhead); Vercel Functions provide the same proxy with zero ops |
| Edge functions (Vercel Edge) | Gemini Node.js SDK is not compatible with the Edge runtime's restricted APIs at time of decision |

## Consequences

### Positive
- API key never reaches the browser — CRITICAL security requirement met.
- Zero server to manage — Vercel handles scaling, cold starts, and TLS automatically.
- CDN-served SPA delivers fast first paint globally.
- Simple mental model: client knows nothing about Gemini; it only talks to `/api/*`.

### Negative / Trade-offs
- Cold starts on Vercel Functions can add 200–800 ms latency to the first request.
- All four AI features (story, avatar, scene, narration) require separate HTTP round-trips from the client to Vercel, which increases cumulative latency.
- Local development requires the Vercel CLI (`vercel dev`) to emulate the serverless runtime; `npm run dev` alone cannot serve API calls.

## References

- [`api/generate-story.ts`](../../api/generate-story.ts)
- [`AIClient.ts`](../../AIClient.ts)
- [Vercel Functions documentation](https://vercel.com/docs/functions)
- [`SECURITY.md`](../../SECURITY.md) — API key protection section

SPDX-License-Identifier: Apache-2.0
