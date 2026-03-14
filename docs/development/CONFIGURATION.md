<!--
SPDX-License-Identifier: Apache-2.0
-->

# Configuration & Customization Guide

**Project:** Infinity Heroes: Bedtime Chronicles  
**Audience:** Developers, DevOps, contributors who need to adjust runtime behaviour

---

## 1. Environment Variables

Environment variables are the primary configuration mechanism. They are consumed exclusively by the **Vercel serverless functions** in `api/`; none are ever exposed to the client-side JavaScript bundle.

### Production (Vercel)

Set variables in **Vercel Dashboard → Project → Settings → Environment Variables**.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | — | Google Gemini API key. Obtain from [Google AI Studio](https://aistudio.google.com/apikey). Used by all four `api/generate-*.ts` functions. |

### Local Development

Create a `.env` file in the project root (`.gitignore` already excludes it):

```env
# .env  — DO NOT COMMIT THIS FILE
GEMINI_API_KEY=your_key_here
```

When using `vercel dev`, the Vercel CLI automatically loads `.env` into the serverless function runtime. When using `npm run dev` alone, API calls will fail because the functions do not run.

> **Security reminder:** The `.env` file must never be committed. The CI pipeline scans for `AIza[0-9A-Za-z_-]{35}` patterns in source files and will fail if a key is detected.

---

## 2. Application Feature Flags

There are currently no runtime feature flags. Story modes, voices, and settings are controlled through the UI by the user. If you add a feature flag system in the future, document it here.

---

## 3. Configurable Constants in Source Code

The following constants can be adjusted in their respective source files. They are not env vars because they are consumed client-side.

### Story Generation (`hooks/useStoryEngine.ts` / `types.ts`)

| Constant / Setting | Location | Default | Description |
|--------------------|----------|---------|-------------|
| Story length options | `types.ts` → `StoryLength` | `short`, `medium`, `long`, `eternal` | Word-count buckets for generated stories |
| Narrator voices | `types.ts` → `NarratorVoice` | `Puck`, `Charon`, `Kore`, `Fenrir`, `Aoede`, `Zephyr`, `Leda` | Gemini TTS voice names |
| Story modes | `types.ts` → `AppMode` | `classic`, `madlibs`, `sleep` | Available story modes |

### AI Client Retry Policy (`AIClient.ts`)

| Constant | Default | Description |
|----------|---------|-------------|
| Max retries | `3` | Number of automatic retry attempts on 5xx errors |
| Backoff base (ms) | `1000` | Initial retry delay; doubles on each attempt |
| Retry jitter | Random 0–500 ms | Prevents thundering herd on simultaneous retries |

Adjust these values directly in `AIClient.ts` if the Gemini API response time changes significantly.

### IndexedDB Schema (`lib/StorageManager.ts`)

| Constant | Default | Description |
|----------|---------|-------------|
| Database name | `infinityHeroesDB` | IndexedDB database name |
| Schema version | `4` | Increment when adding or changing object stores |
| Object stores | `stories`, `audio` | Persistent data buckets |

> **Warning:** Incrementing the schema version triggers `onupgradeneeded`. Always add a migration branch; never delete existing user data without a fallback.

### PWA (`vite.config.ts`)

| Setting | Value | Description |
|---------|-------|-------------|
| `registerType` | `autoUpdate` | Service worker updates automatically on next page load |
| `includeAssets` | `icon.svg`, fonts | Assets preloaded by the service worker |
| Workbox strategy | `NetworkFirst` for API, `CacheFirst` for assets | Controls offline vs. fresh behaviour |

---

## 4. AI Model Configuration

AI model names are set in the serverless function files. Update them when Google releases newer stable models.

| Function | File | Model |
|----------|------|-------|
| Story text | `api/generate-story.ts` | `gemini-3-pro-preview` |
| Hero avatar | `api/generate-avatar.ts` | `gemini-2.5-flash-image` |
| Scene illustration | `api/generate-scene.ts` | `gemini-2.5-flash-image` |
| Text-to-speech | `api/generate-narration.ts` | `gemini-2.5-flash-preview-tts` |

### Upgrading a Model

1. Check [Google AI model availability](https://ai.google.dev/models) for the new model name.
2. Update the model string in the relevant `api/*.ts` file.
3. Test locally with `vercel dev`.
4. Open a PR with the change and update `CHANGELOG.md` under `[Unreleased]`.

---

## 5. Security Headers (`vercel.json`)

Security headers are declared in `vercel.json` and applied at the Vercel CDN layer:

```json
"Content-Security-Policy": "default-src 'self'; script-src 'self'; connect-src 'self'; ..."
```

To allow an additional external resource (e.g., a new font provider), add it to the appropriate CSP directive in `vercel.json`. Document the rationale in a comment within the PR.

See [`SECURITY.md`](../../SECURITY.md) for the full list of enforced headers and their rationale.

---

## 6. Ambient Soundscape Configuration (`SoundManager.ts`)

The six built-in soundscapes (Space, Rain, Forest, Magic, Ocean, Crickets) are synthesized procedurally using the Web Audio API. Each soundscape is defined as a set of oscillator/noise parameters within `SoundManager.ts`.

To add a new soundscape:
1. Define a new entry in the `SOUNDSCAPES` record in `SoundManager.ts`.
2. Add the corresponding option to the UI in `components/setup/SleepSetup.tsx`.
3. Add the new value to the `Soundscape` union type in `types.ts`.

---

## 7. PWA Manifest (`metadata.json`)

The PWA web app manifest is defined in `metadata.json` and referenced from `index.html`. Customizable fields:

| Field | Current Value | Description |
|-------|--------------|-------------|
| `name` | `Infinity Heroes: Bedtime Chronicles` | Full app name |
| `short_name` | `Infinity Heroes` | Name used on home screen icons |
| `theme_color` | `#1a1a2e` | Browser toolbar / splash screen colour |
| `background_color` | `#1a1a2e` | Splash screen background |
| `display` | `standalone` | PWA display mode |

Update `metadata.json` and the `<link rel="manifest">` tag in `index.html` when rebranding.

---

## 8. Customization Reference

| What to change | Where to change it |
|---------------|-------------------|
| AI story content guardrails (system prompt) | `api/generate-story.ts` → system prompt string |
| Maximum story parts | `api/generate-story.ts` → `maxParts` constant |
| Available narrator voices | `types.ts` → `NarratorVoice` + `components/setup/VoiceSelector.tsx` |
| Narration speed options | `components/setup/SetupShared.tsx` |
| Story length word counts | `api/generate-story.ts` → word-count mapping |
| IndexedDB schema | `lib/StorageManager.ts` |
| Security headers | `vercel.json` |
| PWA manifest | `metadata.json` |
| Ambient soundscapes | `SoundManager.ts` |
| Tailwind theme | `vite.config.ts` (Tailwind v4 configuration) |

---

*See also: [`docs/operations/DEPLOYMENT.md`](../operations/DEPLOYMENT.md) for deployment-time configuration and [`docs/operations/RUNBOOK.md`](../operations/RUNBOOK.md) for production operations.*

SPDX-License-Identifier: Apache-2.0
