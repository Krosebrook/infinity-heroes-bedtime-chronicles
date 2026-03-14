<!--
SPDX-License-Identifier: Apache-2.0
-->

# ADR-003: Vercel as Deployment Platform

**Date:** 2026-02  
**Status:** Accepted  
**Deciders:** Project maintainers

---

## Context

The application consists of a static SPA (Vite build output in `dist/`) and four serverless functions (`api/*.ts`). These need to be hosted together, with the serverless functions having access to a secret environment variable (`GEMINI_API_KEY`) that must not be exposed to the browser.

The project is open-source, maintained by a small team, and requires:
- Zero-ops infrastructure (no server management)
- Automatic deployments from GitHub
- Preview deployments for pull requests
- CDN for global performance
- Support for Node.js-based serverless functions

## Decision

Deploy on **Vercel** using its native Git integration. Vite build output is served from Vercel's CDN; `api/*.ts` files are deployed as Vercel Functions (Node.js runtime).

Configuration lives in `vercel.json` (security headers and route rules).

## Alternatives Considered

| Alternative | Reason not chosen |
|-------------|------------------|
| Netlify | Comparable feature set; Vercel has tighter Vite integration and first-class TypeScript serverless function support without extra config |
| AWS (S3 + Lambda + CloudFront) | Significant ops overhead; requires managing IAM, API Gateway, and CloudFront distributions — disproportionate for this project size |
| GitHub Pages | Static hosting only; no serverless function support |
| Cloudflare Pages + Workers | Workers run in an Edge runtime incompatible with the Gemini Node.js SDK |
| Self-hosted (VPS / Docker) | Requires ongoing server maintenance, security patching, and scaling management |

## Consequences

### Positive
- Zero infrastructure to manage.
- Automatic builds and deployments triggered by GitHub pushes.
- Preview deployments for every PR allow stakeholders to review changes before merging.
- Built-in CDN for global low-latency SPA delivery.
- Environment variable management integrated with the deployment dashboard.
- Generous free tier covers the expected traffic for a children's bedtime app.

### Negative / Trade-offs
- Vendor lock-in: Vercel-specific `vercel.json` headers config and the `@vercel/node` runtime type definitions.
- Serverless function cold starts (typically 200–800 ms) affect first-request latency.
- Free tier has execution time and invocation limits; heavy usage may require a paid plan.
- Migrating away from Vercel would require updating the CI/CD integration, header configuration, and potentially the function type annotations.

## References

- [`vercel.json`](../../../vercel.json)
- [`docs/operations/DEPLOYMENT.md`](../../operations/DEPLOYMENT.md)
- [`docs/operations/CICD.md`](../../operations/CICD.md)
- [Vercel documentation](https://vercel.com/docs)

SPDX-License-Identifier: Apache-2.0
