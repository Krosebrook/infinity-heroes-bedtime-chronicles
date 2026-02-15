# Copilot Instructions for Infinity Heroes: Bedtime Chronicles

## Project Overview

A children's bedtime story PWA for ages 7-9. Kids choose a hero name, superpower, and setting, then an AI generates a personalized multi-chapter bedtime story with illustrations and optional narration.

## Tech Stack

- **Framework**: React 19 with TypeScript (strict, `noEmit`)
- **Build**: Vite 6 with PWA support (`vite-plugin-pwa`)
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- **Animations**: Framer Motion 11
- **AI**: Google Gemini API (`@google/genai`) for story generation and image creation
- **Deployment**: Vercel (auto-deploys from GitHub)

## Commands

- `npm run dev` - Start dev server on port 3000
- `npm run build` - Production build (Vite)
- `npm run preview` - Preview production build
- `npx tsc --noEmit` - Type-check only (no test framework yet)

## Directory Structure

```
/                     # Root (source files live at top level)
  App.tsx             # Main app component
  Book.tsx            # Story book/reader component
  Setup.tsx           # Story setup flow
  Panel.tsx           # Story panel display
  types.ts            # Shared TypeScript types
  AIClient.ts         # Gemini API client
  SoundManager.ts     # Audio/narration management
  NarrationManager.ts # TTS narration sync
  useApiKey.ts        # API key management hook
  components/         # Reusable UI components
    setup/            # Setup flow components (ClassicSetup, MadlibsSetup, etc.)
    ErrorBoundary.tsx
    SettingsModal.tsx
    CompletionView.tsx
    SyncedText.tsx
  hooks/              # Custom React hooks
  lib/                # Utilities (StorageManager, Logger)
  api/                # Vercel serverless functions
  public/             # Static assets (sounds, icons)
  scripts/            # Build/utility scripts
```

## Key Conventions

- **Path aliases**: Use `@/` to reference files from the project root (configured in `tsconfig.json` and `vite.config.ts`)
- **No test framework**: There are no tests yet. Do not add test files unless explicitly asked.
- **Functional React**: All components are functional components with hooks. No class components.
- **TypeScript strict**: Types are defined in `types.ts`. Use proper typing, avoid `any`.
- **Tailwind v4**: Styling uses Tailwind CSS v4 utility classes directly in JSX. No separate CSS modules.
- **Framer Motion**: Animations use `motion` components and `AnimatePresence` for transitions.

## Children's Safety (COPPA Compliance)

This app is designed for children ages 7-9. **Strictly follow these rules**:

- **No analytics or tracking** - Do not add Google Analytics, Mixpanel, Hotjar, or any tracking scripts
- **No PII collection** - Do not collect names, emails, or any personally identifiable information beyond the in-session hero name (stored only in local state, never sent to a server)
- **No third-party cookies** - Do not add any cookie consent banners or cookie-setting scripts
- **No social media integration** - No share buttons, social logins, or embedded social content
- **No ads** - Do not add any advertising or monetization code
- **No external links** - Do not add links that navigate children away from the app
- **Content must be age-appropriate** - All generated content must be suitable for children ages 7-9
- **API keys are user-provided** - The Gemini API key is entered by the parent/guardian and stored in localStorage only

## Code Style

- Use `const` arrow functions for components: `const MyComponent = () => { ... }`
- Destructure props in function parameters
- Keep components focused and single-responsibility
- Use custom hooks to extract reusable logic
- Prefer early returns for guard clauses
- Use semantic HTML elements where possible
