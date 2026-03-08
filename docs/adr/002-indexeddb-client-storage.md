<!--
SPDX-License-Identifier: Apache-2.0
-->

# ADR-002: IndexedDB for Client-Side Persistence

**Date:** 2026-02  
**Status:** Accepted  
**Deciders:** Project maintainers

---

## Context

The app needs to persist:
1. Generated story JSON (text, choices, vocabulary, illustrations as Base64)
2. PCM audio buffers from the TTS narration engine (binary, potentially several MB per story)
3. User preferences (narrator voice, story length, soundscape)

All data must be available offline (PWA requirement) and must never be sent to a server (COPPA compliance).

The application targets children whose parents may not want any cloud synchronisation.

## Decision

Use the browser's native **IndexedDB API** (via raw `window.indexedDB` calls in `lib/StorageManager.ts`) with no external wrapper library.

The database (`infinityHeroesDB`) has two object stores:
- `stories` — structured JSON story data and Base64 scene imagery.
- `audio` — raw PCM audio buffers keyed by story ID and part index.

The current schema version is `4`, with a versioned migration path via `onupgradeneeded`.

## Alternatives Considered

| Alternative | Reason not chosen |
|-------------|------------------|
| `localStorage` | 5 MB storage limit; synchronous API blocks the main thread; cannot store binary data efficiently |
| `sessionStorage` | Cleared on tab close — stories would not persist across sessions |
| Third-party IndexedDB wrapper (Dexie.js, idb) | Adds a dependency and bundle weight; the usage pattern is simple enough to implement directly |
| Cloud database (Firestore, Supabase) | Requires a server, user accounts, and data transmission — violates COPPA; adds cost and ops burden |
| Cache API (Service Worker) | Designed for HTTP response caching; awkward for structured JSON and binary audio data |

## Consequences

### Positive
- Unlimited storage (subject to browser quota, typically 50–80 % of available disk).
- Asynchronous API — does not block the main thread.
- Binary data (PCM audio) stored efficiently as ArrayBuffer.
- Fully offline — no network required to read saved stories.
- Zero PII leaves the device (COPPA-compliant by design).

### Negative / Trade-offs
- No cross-device sync — stories saved on one device are not available on another.
- IndexedDB is cleared by the browser under storage pressure or when the user clears site data.
- Schema migrations must be carefully managed — a bug in `onupgradeneeded` can corrupt or lose stored stories.
- Testing IndexedDB requires mocking (`fake-indexeddb` or similar) because it is not available in Node.js test environments.

## References

- [`lib/StorageManager.ts`](../../lib/StorageManager.ts)
- [`ARCHITECTURE.md`](../../ARCHITECTURE.md) — Persistence Layer section
- [MDN IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [`CHILD_SAFETY_COMPLIANCE.md`](../../CHILD_SAFETY_COMPLIANCE.md)

SPDX-License-Identifier: Apache-2.0
