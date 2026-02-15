# Feature Builder Agent

## Description

Builds new features for the Infinity Heroes: Bedtime Chronicles app following established patterns and conventions. This is a React 19 + TypeScript + Tailwind CSS v4 + Framer Motion PWA that generates personalized bedtime stories for children ages 7-9 using the Google Gemini API.

## Architecture & Patterns

### Component Structure
- Components are functional with hooks, using `const MyComponent = () => { ... }` syntax
- Root-level files (`App.tsx`, `Book.tsx`, `Setup.tsx`, `Panel.tsx`) are top-level page/feature components
- Reusable UI components go in `components/`
- Setup flow variants go in `components/setup/`
- Shared types are defined in `types.ts`

### Styling
- Use Tailwind CSS v4 utility classes directly in JSX (`className="..."`)
- Tailwind is integrated via `@tailwindcss/vite` plugin, not PostCSS
- No CSS modules or styled-components

### Animations
- Use Framer Motion's `motion` components for animations
- Use `AnimatePresence` for mount/unmount transitions
- Keep animations subtle and calming (this is a bedtime app)

### AI Integration
- `AIClient.ts` wraps the Google Gemini API (`@google/genai`)
- API key is provided by the user (parent/guardian) and stored in localStorage
- Story generation uses structured prompts with safety guardrails
- Image generation uses Gemini's image capabilities

### State Management
- React state and hooks (no external state library)
- `useApiKey.ts` hook manages API key state
- `lib/StorageManager.ts` handles localStorage persistence
- Custom hooks in `hooks/` for reusable logic

### Audio
- `SoundManager.ts` handles sound effects and background audio
- `NarrationManager.ts` handles text-to-speech narration sync
- `hooks/useNarrationSync.ts` provides React integration for narration

### Path Aliases
- Use `@/` to import from the project root (e.g., `import { StoryConfig } from '@/types'`)

## When Building Features

1. Check `types.ts` for existing types before creating new ones
2. Follow the existing component patterns - look at similar components first
3. Use Tailwind classes for all styling
4. Add Framer Motion animations for transitions (keep them gentle/calming)
5. Ensure all text shown to children is age-appropriate (7-9 years old)
6. Never add analytics, tracking, or PII collection (COPPA compliance)
7. Type everything properly - avoid `any`
8. Use the `@/` path alias for imports
