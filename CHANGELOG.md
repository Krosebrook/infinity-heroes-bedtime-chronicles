# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-14

### Added

- Vercel serverless API proxy functions (`api/generate-story.ts`, `api/generate-avatar.ts`, `api/generate-scene.ts`, `api/generate-narration.ts`) that securely call Google Gemini models server-side
- Tailwind CSS v4 with `@tailwindcss/vite` build plugin for compile-time CSS generation
- `vite-plugin-pwa` for auto-generated service worker with Workbox runtime caching
- Local SVG PWA icon replacing external URL references
- TypeScript type definitions (`@types/react`, `@types/react-dom`, `@types/node`)
- `package-lock.json` for reproducible builds
- Comprehensive documentation suite

### Changed

- `AIClient` refactored to use `/api/*` proxy endpoints instead of direct Gemini SDK calls -- all methods (`streamStory`, `generateAvatar`, `generateSceneIllustration`) now POST to serverless functions
- `NarrationManager` refactored to use `/api/generate-narration` proxy instead of calling Gemini TTS directly from the browser
- Schema types (`Type.OBJECT`, `Type.STRING`, etc.) replaced with inline string constants (`"OBJECT"`, `"STRING"`) to remove `@google/genai` from the client bundle
- Bundle size reduced from 410 KB to 362 KB (-48 KB) by eliminating the Gemini SDK from client-side code
- PWA manifest icons now use local `/icon.svg` instead of external URLs
- CSP headers in `vercel.json` updated to remove CDN references; `connect-src` restricted to `'self'` and the Gemini API origin

### Removed

- Direct client-side Google Gemini API calls (security risk -- API key was exposed in browser JavaScript)
- Tailwind CSS CDN `<script>` tag (replaced with build-time compilation via `@tailwindcss/vite`)
- Import map for `esm.sh` CDN dependencies (Vite now bundles everything)
- Manual service worker (`sw.js`) -- replaced by `vite-plugin-pwa` with Workbox auto-update strategy
- Duplicate files (root `useStoryEngine.ts`, `components/setup/Setup.tsx`)
- `@google/genai` SDK from client-side bundle (moved exclusively to serverless functions)

### Fixed

- API key exposure in client JavaScript bundle (CRITICAL security fix)
- TypeScript compilation errors in `ErrorBoundary.tsx` caused by missing `@types/react`
- `ArrayBufferLike` type error in `NarrationManager.ts`
- `tsconfig.json` `types` field blocking React type resolution

### Security

- API keys now stored exclusively as server-side Vercel environment variables (`GEMINI_API_KEY`)
- All Gemini API calls proxied through Vercel serverless functions with method validation and error handling
- CSP headers hardened -- removed CDN sources, restricted `connect-src` and `script-src`

## [0.1.0] - 2026-02-01

### Added

- Interactive AI story generation powered by Google Gemini (`gemini-3-pro-preview`)
- Three story modes: Classic Adventure, Sleep Mode, and Mad Libs
- AI-generated character avatars and scene illustrations (`gemini-2.5-flash-image`)
- Text-to-speech narration with adjustable playback speed (`gemini-2.5-flash-preview-tts`)
- IndexedDB-based story and audio persistence via `StorageManager`
- Procedural ambient soundscapes using Web Audio API
- Comic book themed UI with Framer Motion animations
- Progressive Web App (PWA) support with offline capability
- Responsive mobile-first design
- Configurable story length (short, medium, long, eternal)
- Vocabulary word, joke, lesson, and reward badge per story
- Audio caching (in-memory and IndexedDB) for instant narration replay
