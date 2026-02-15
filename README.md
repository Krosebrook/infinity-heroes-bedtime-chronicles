# Infinity Heroes: Bedtime Chronicles

**Interactive AI-powered bedtime stories with generated illustrations, narration, and ambient soundscapes.**

Infinity Heroes: Bedtime Chronicles is a single-page web application that creates personalized bedtime stories for children using Google Gemini. Kids (or parents) configure a hero, choose a story mode, and the app generates a fully illustrated, narrated, multi-part adventure -- complete with vocabulary words, jokes, reward badges, and a teaser hook for tomorrow night.

---

## Features

- **Three Story Modes**
  - **Classic** -- adventure stories with branching choices at each chapter
  - **Mad Libs** -- silly, keyword-driven narratives for maximum laughs
  - **Sleep** -- conflict-free, hypnotically slow deep-slumber stories with auto-advancing narration and ambient sound
- **AI-Generated Illustrations** -- hero avatars and per-scene storybook art via Gemini image generation
- **Text-to-Speech Narration** -- multiple narrator voices (Puck, Charon, Kore, Fenrir, Aoede, Zephyr, Leda) with adjustable playback speed, pause/resume, and next-part preloading
- **Procedural Ambient Sound** -- six soundscapes (Space, Rain, Forest, Magic, Ocean, Crickets) synthesized entirely with the Web Audio API
- **PWA / Offline Support** -- installable as a Progressive Web App; stories, audio, and images are cached in IndexedDB for offline reading
- **Memory Jar** -- saved story history with scene thumbnails, sequel preparation, and feedback/ratings
- **Configurable Story Length** -- short, medium, long, or "eternal" stories with word-count scaling
- **Accessibility** -- reduced-motion preference, adjustable font size, offline-mode banner
- **Lazy Loading & Code Splitting** -- main views are lazy-loaded for fast initial paint

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 6 |
| Language | TypeScript 5.8 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite` plugin) |
| Animations | Framer Motion 11 |
| AI Backend | Google Gemini (`@google/genai`) |
| Text Generation | `gemini-3-pro-preview` |
| Image Generation | `gemini-2.5-flash-image` |
| Text-to-Speech | `gemini-2.5-flash-preview-tts` |
| Audio Playback | Web Audio API (raw PCM 24kHz decoding) |
| Ambient Sound | Web Audio API (procedural noise synthesis) |
| Local Storage | IndexedDB (stories, audio cache, preferences) |
| PWA | `vite-plugin-pwa` with Workbox auto-update |
| Serverless API | Vercel Functions (`@vercel/node`) |
| Deployment | Vercel |

---

## Prerequisites

- **Node.js** >= 18
- **npm** (included with Node.js)
- **Google Gemini API Key** -- obtain one from [Google AI Studio](https://aistudio.google.com/apikey)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/infinity-heroes-bedtime-chronicles.git
cd infinity-heroes-bedtime-chronicles
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root (or set the variable in your Vercel project settings for production):

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

> **Note:** The serverless API functions in the `api/` directory require a Vercel-compatible runtime. During local development you can use `vercel dev` instead of `npm run dev` to run both the Vite dev server and the API functions together.

---

## Project Structure

```
infinity-heroes_-bedtime-chronicles/
├── api/                          # Vercel serverless functions (API proxy)
│   ├── generate-story.ts         #   Story text generation (gemini-3-pro-preview)
│   ├── generate-avatar.ts        #   Hero avatar image generation
│   ├── generate-scene.ts         #   Scene illustration generation
│   └── generate-narration.ts     #   TTS audio generation (gemini-2.5-flash-preview-tts)
├── components/                   # Reusable UI components
│   ├── setup/                    #   Setup-phase components
│   │   ├── ClassicSetup.tsx      #     Classic mode form
│   │   ├── MadlibsSetup.tsx      #     Mad Libs mode form
│   │   ├── SleepSetup.tsx        #     Sleep mode configuration
│   │   ├── ModeSetup.tsx         #     Mode tab switcher
│   │   ├── VoiceSelector.tsx     #     Narrator voice picker
│   │   ├── MemoryJar.tsx         #     Saved story history browser
│   │   └── SetupShared.tsx       #     Shared setup UI (length slider, etc.)
│   ├── ReadingView.tsx           #   Main story reading experience
│   ├── CompletionView.tsx        #   End-of-story summary (badge, vocab, joke)
│   ├── SyncedText.tsx            #   Narration-synced text highlighting
│   ├── SettingsModal.tsx         #   User preferences modal
│   └── ErrorBoundary.tsx         #   React error boundary
├── hooks/                        # Custom React hooks
│   ├── useStoryEngine.ts         #   Core story state machine & orchestration
│   └── useNarrationSync.ts       #   AudioContext-to-React state bridge
├── lib/                          # Utility modules
│   ├── StorageManager.ts         #   IndexedDB persistence (stories, audio, prefs)
│   └── Logger.ts                 #   Structured console logger
├── AIClient.ts                   # Client-side API abstraction with retry logic
├── NarrationManager.ts           # Web Audio TTS playback engine (PCM decoding)
├── SoundManager.ts               # Procedural ambient sound synthesizer
├── App.tsx                       # Root application component
├── Setup.tsx                     # Setup phase orchestrator
├── Book.tsx                      # Book/page layout component
├── Panel.tsx                     # Comic panel renderer
├── HeroHeader.tsx                # Hero avatar header display
├── LoadingFX.tsx                 # Loading animation component
├── ApiKeyDialog.tsx              # API key input dialog
├── useApiKey.ts                  # API key validation hook
├── types.ts                      # TypeScript type definitions
├── index.tsx                     # React entry point
├── index.css                     # Global styles (Tailwind import)
├── index.html                    # HTML shell
├── metadata.json                 # PWA web app manifest
├── vite.config.ts                # Vite configuration (React, Tailwind, PWA)
├── vercel.json                   # Vercel deployment config (CSP headers)
├── tsconfig.json                 # TypeScript compiler configuration
└── package.json                  # Dependencies and scripts
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server on port 3000 |
| `npm run build` | Build the production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Google Gemini API key. Used by the serverless functions in `api/` to authenticate with the Gemini API. Must be set as an environment variable on Vercel (not shipped to the client). |

---

## Deployment

This project is designed for deployment on **Vercel**.

### Steps

1. Push the repository to GitHub (or GitLab/Bitbucket).
2. Import the project into [Vercel](https://vercel.com).
3. Add the `GEMINI_API_KEY` environment variable in the Vercel project settings.
4. Deploy. Vercel will automatically:
   - Build the Vite SPA into `dist/`
   - Deploy the `api/*.ts` files as serverless functions
   - Apply the security headers defined in `vercel.json`

### Security Headers (via `vercel.json`)

The deployment includes a Content-Security-Policy that restricts script sources, connects only to `generativelanguage.googleapis.com`, and sets `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin`.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Browser (Client)                  │
│                                                     │
│  ┌───────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  React UI │  │  Narration   │  │   Sound      │  │
│  │  (App.tsx) │  │  Manager     │  │   Manager    │  │
│  │           │  │  (Web Audio) │  │  (Web Audio) │  │
│  └─────┬─────┘  └──────┬───────┘  └──────────────┘  │
│        │               │                            │
│  ┌─────┴─────┐  ┌──────┴───────┐                    │
│  │ AIClient  │  │  IndexedDB   │                    │
│  │ (fetch)   │  │  (offline    │                    │
│  │           │  │   cache)     │                    │
│  └─────┬─────┘  └──────────────┘                    │
└────────┼────────────────────────────────────────────┘
         │  HTTPS (POST)
         ▼
┌─────────────────────────────────────────────────────┐
│              Vercel Serverless Functions             │
│                                                     │
│  /api/generate-story      (text generation)         │
│  /api/generate-avatar     (image generation)        │
│  /api/generate-scene      (image generation)        │
│  /api/generate-narration  (TTS audio generation)    │
│                                                     │
└────────┬────────────────────────────────────────────┘
         │  HTTPS (Google GenAI SDK)
         ▼
┌─────────────────────────────────────────────────────┐
│              Google Gemini API                      │
│                                                     │
│  gemini-3-pro-preview         (story text + JSON)   │
│  gemini-2.5-flash-image       (avatar & scene art)  │
│  gemini-2.5-flash-preview-tts (narration audio)     │
└─────────────────────────────────────────────────────┘
```

The API key never leaves the server. The client sends story parameters to Vercel serverless functions, which proxy the requests to Google Gemini and return the results. Generated stories, audio, and images are cached in the browser's IndexedDB for offline access.

---

## License

This project is licensed under the **Apache License 2.0**. See individual source files for the `SPDX-License-Identifier: Apache-2.0` headers.
