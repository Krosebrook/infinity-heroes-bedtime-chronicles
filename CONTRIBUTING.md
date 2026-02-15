# Contributing to Infinity Heroes: Bedtime Chronicles

Welcome, hero! We are glad you are interested in contributing to **Infinity Heroes: Bedtime Chronicles** -- an AI-powered interactive bedtime story app for kids. Whether you are fixing a bug, proposing a feature, improving documentation, or refactoring code, your contributions help make bedtime more magical for families everywhere.

Please take a moment to review this guide before submitting your contribution.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Code Style Guide](#code-style-guide)
5. [Project Structure](#project-structure)
6. [Adding New Features](#adding-new-features)
7. [Testing Guidelines](#testing-guidelines)
8. [Documentation Standards](#documentation-standards)
9. [Reporting Bugs](#reporting-bugs)
10. [Feature Requests](#feature-requests)
11. [Security Vulnerability Reporting](#security-vulnerability-reporting)

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you are expected to uphold this code. Please report unacceptable behavior by opening an issue or contacting the maintainers directly.

We are committed to providing a welcoming, inclusive, and harassment-free experience for everyone -- especially because this is a project built for children and families.

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x (ships with Node.js)
- A **Gemini API key** from [Google AI Studio](https://aistudio.google.com/) (required for AI features)

### Fork and Clone

1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/infinity-heroes_-bedtime-chronicles.git
   cd infinity-heroes_-bedtime-chronicles
   ```

### Install Dependencies

```bash
npm install
```

### Set Up Environment

1. Create a `.env` file in the project root (this file is gitignored):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
2. Alternatively, the app supports entering the API key through the in-app dialog at runtime.

### Run the Development Server

```bash
npm run dev
```

The app starts at [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm run preview
```

---

## Development Workflow

### Branch Naming Conventions

Use descriptive, prefixed branch names:

| Prefix       | Purpose                        | Example                          |
|--------------|--------------------------------|----------------------------------|
| `feat/`      | New feature                    | `feat/ambient-sound-mixer`       |
| `fix/`       | Bug fix                        | `fix/narration-pause-crash`      |
| `refactor/`  | Code refactoring               | `refactor/story-engine-hooks`    |
| `docs/`      | Documentation changes          | `docs/add-api-usage-guide`       |
| `style/`     | UI/styling changes             | `style/sleep-mode-gradients`     |
| `chore/`     | Build, tooling, dependencies   | `chore/upgrade-vite-7`           |
| `test/`      | Adding or updating tests       | `test/story-engine-unit-tests`   |

Always branch from the latest `main`:

```bash
git checkout main
git pull origin main
git checkout -b feat/your-feature-name
```

### Commit Message Format

This project follows [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

**Types:**

| Type         | Description                              |
|--------------|------------------------------------------|
| `feat`       | A new feature                            |
| `fix`        | A bug fix                                |
| `docs`       | Documentation only changes               |
| `style`      | Changes that do not affect logic (CSS, formatting) |
| `refactor`   | Code change that neither fixes a bug nor adds a feature |
| `perf`       | Performance improvement                  |
| `test`       | Adding or correcting tests               |
| `chore`      | Changes to build process or tooling      |

**Scopes** (optional but encouraged): `story-engine`, `narration`, `setup`, `api`, `pwa`, `ui`, `a11y`

**Examples:**

```
feat(narration): add playback speed memory across sessions
fix(setup): prevent empty hero name from crashing avatar generation
docs: update contributing guide with branch naming conventions
refactor(story-engine): extract scene generation into dedicated hook
```

### Pull Request Process

1. Ensure your branch is up to date with `main`.
2. Run the build to verify no errors: `npm run build`.
3. Write a clear PR description explaining **what** changed and **why**.
4. Reference any related issues (e.g., `Closes #42`).
5. Request a review from at least one maintainer.
6. Address review feedback promptly.
7. Squash trivial commits before merge if requested.

**PR Title Format:** Use the same Conventional Commits format as commit messages.

---

## Code Style Guide

### TypeScript Conventions

- **Target:** ES2022 with `react-jsx` transform.
- **Module resolution:** `bundler` (Vite-native).
- **Path aliases:** Use `@/*` to reference the project root (e.g., `@/types`, `@/lib/Logger`).
- Use **explicit type annotations** for function parameters, return types on exported functions, and interface props.
- Prefer `interface` over `type` for object shapes. Use `type` for unions and aliases.
- Use **union literal types** instead of enums:
  ```typescript
  // Preferred
  export type AppMode = 'classic' | 'madlibs' | 'sleep';

  // Avoid
  enum AppMode { Classic, Madlibs, Sleep }
  ```
- Centralize shared types in `types.ts` at the project root.
- Every source file must begin with the Apache-2.0 license header:
  ```typescript
  /**
   * @license
   * SPDX-License-Identifier: Apache-2.0
   */
  ```

### React Patterns

- Use **functional components** with `React.FC<Props>` typing:
  ```typescript
  export const MyComponent: React.FC<MyComponentProps> = ({ prop1, prop2 }) => {
      // ...
  };
  ```
- Use **named exports** for components (not default exports), except for `App.tsx` and lazy-loaded module boundaries.
- Use **hooks** for all state and side-effect logic. Extract complex logic into custom hooks under `hooks/`.
- Use **`useCallback`** for event handlers and functions passed as props to prevent unnecessary re-renders.
- Use **`useRef`** for DOM references and mutable values that should not trigger re-renders.
- Wrap heavy view components with `React.lazy()` and `<Suspense>` for code splitting.
- Use the `ErrorBoundary` component to wrap major view sections.
- Use **framer-motion** for animations (`motion.*` components, `AnimatePresence`, `layoutId`).

### Tailwind CSS Usage

This project uses **Tailwind CSS v4** with the Vite plugin (`@tailwindcss/vite`). There is no `tailwind.config.js` -- configuration is done via CSS.

- **Utility-first approach:** Compose styles directly in `className` attributes.
- **Responsive design:** Use mobile-first breakpoints (`md:`, `lg:`):
  ```tsx
  <div className="text-base md:text-xl lg:text-2xl p-4 md:p-8">
  ```
- **Custom classes** are defined in `index.css` for reusable patterns:
  - `.font-comic` -- Bangers font family
  - `.comic-btn` -- Comic-style button with border, shadow, and hover/active states
  - `.custom-scrollbar` -- Styled scrollbar
  - `.animate-float` / `.animate-breathe` -- Custom keyframe animations
- Prefer Tailwind utilities over writing new CSS. Only add custom classes to `index.css` when the same pattern appears in three or more places.
- Use Tailwind's color palette (`slate-950`, `blue-500`, `red-600`, etc.) consistently. Avoid arbitrary hex values unless matching a specific design requirement.

### File Naming Conventions

| Type                | Convention         | Example                  |
|---------------------|--------------------|--------------------------|
| React components    | PascalCase `.tsx`  | `ReadingView.tsx`        |
| Custom hooks        | camelCase `.ts`    | `useStoryEngine.ts`      |
| Utility modules     | PascalCase `.ts`   | `StorageManager.ts`      |
| Type definitions    | camelCase `.ts`    | `types.ts`               |
| API endpoints       | kebab-case `.ts`   | `generate-story.ts`      |
| CSS files           | kebab-case `.css`  | `index.css`              |

### Import Ordering

Organize imports in the following order, separated by blank lines:

1. **React and framework imports** (`react`, `react-dom`)
2. **Third-party libraries** (`framer-motion`, `@google/genai`)
3. **Internal components** (`./components/*`, `./Setup`)
4. **Hooks** (`./hooks/*`)
5. **Utilities and managers** (`./lib/*`, `./SoundManager`)
6. **Types** (`./types`)

Example:

```typescript
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { ReadingView } from './components/ReadingView';
import { ErrorBoundary } from './components/ErrorBoundary';

import { useStoryEngine } from './hooks/useStoryEngine';
import { useNarrationSync } from './hooks/useNarrationSync';

import { soundManager } from './SoundManager';
import { logger } from './lib/Logger';

import { StoryState, StoryFull } from './types';
```

---

## Project Structure

```
infinity-heroes_-bedtime-chronicles/
├── api/                        # Vercel serverless API endpoints
│   ├── generate-avatar.ts      # Hero avatar generation endpoint
│   ├── generate-narration.ts   # Text-to-speech narration endpoint
│   ├── generate-scene.ts       # Scene illustration generation endpoint
│   └── generate-story.ts       # AI story generation endpoint
├── components/                 # Shared/feature React components
│   ├── setup/                  # Setup phase sub-components
│   │   ├── ClassicSetup.tsx    # Classic story mode setup form
│   │   ├── MadlibsSetup.tsx    # Mad Libs mode setup form
│   │   ├── SleepSetup.tsx      # Sleep mode setup form
│   │   ├── ModeSetup.tsx       # Mode selection component
│   │   ├── VoiceSelector.tsx   # Narrator voice picker
│   │   ├── MemoryJar.tsx       # Story history / saved stories
│   │   └── SetupShared.tsx     # Shared setup utilities
│   ├── CompletionView.tsx      # Story completion screen
│   ├── ErrorBoundary.tsx       # Error boundary wrapper
│   ├── ReadingView.tsx         # Main story reading interface
│   ├── SettingsModal.tsx       # User preferences modal
│   └── SyncedText.tsx          # Text synced with narration audio
├── hooks/                      # Custom React hooks
│   ├── useStoryEngine.ts       # Core story state machine
│   └── useNarrationSync.ts     # Narration playback sync
├── lib/                        # Utility modules
│   ├── StorageManager.ts       # IndexedDB / localStorage persistence
│   └── Logger.ts               # Structured logging utility
├── public/                     # Static assets
├── AIClient.ts                 # Client-side AI API wrapper
├── App.tsx                     # Root application component
├── Book.tsx                    # Book/comic panel component
├── HeroHeader.tsx              # Hero header display
├── LoadingFX.tsx               # Loading animation component
├── NarrationManager.ts         # Audio narration controller
├── Panel.tsx                   # Comic panel renderer
├── Setup.tsx                   # Setup phase orchestrator
├── SoundManager.ts             # Sound effects manager
├── types.ts                    # Shared TypeScript type definitions
├── useApiKey.ts                # API key validation hook
├── index.css                   # Global styles and Tailwind imports
├── index.html                  # HTML entry point
├── index.tsx                   # React DOM entry point
├── vite.config.ts              # Vite build configuration
├── tsconfig.json               # TypeScript configuration
├── vercel.json                 # Vercel deployment and security headers
├── metadata.json               # PWA manifest metadata
└── package.json                # Dependencies and scripts
```

---

## Adding New Features

### Adding a New Component

1. Create the file in `components/` (or a sub-directory if it belongs to a feature group).
2. Include the Apache-2.0 license header at the top.
3. Define a `Props` interface for the component.
4. Export the component as a **named export** using `React.FC<Props>`.
5. Use Tailwind CSS utility classes for styling.
6. Add animations with `framer-motion` where they enhance the experience.
7. Include `aria-*` attributes and `role` props for accessibility.

```typescript
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'framer-motion';

interface HeroBadgeProps {
    emoji: string;
    title: string;
    description: string;
}

export const HeroBadge: React.FC<HeroBadgeProps> = ({ emoji, title, description }) => {
    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center p-4 bg-yellow-100 rounded-2xl border-4 border-black shadow-[6px_6px_0px_black]"
            role="img"
            aria-label={`Badge: ${title}`}
        >
            <span className="text-4xl mb-2">{emoji}</span>
            <h3 className="font-comic text-lg uppercase">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
        </motion.div>
    );
};
```

### Adding an API Endpoint

API endpoints live in the `api/` directory and are deployed as Vercel serverless functions.

1. Create a new file in `api/` using **kebab-case** naming (e.g., `generate-quiz.ts`).
2. Import `VercelRequest` and `VercelResponse` from `@vercel/node`.
3. Export a default async `handler` function.
4. Validate the HTTP method (typically `POST`).
5. Read the API key from `process.env.GEMINI_API_KEY`.
6. Include proper error handling with appropriate HTTP status codes.

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

    try {
        // Your logic here
        res.status(200).json({ result: 'success' });
    } catch (error: any) {
        console.error('Endpoint error:', error);
        res.status(error.status || 500).json({ error: error.message || 'Request failed' });
    }
}
```

### Adding a Custom Hook

1. Create the file in `hooks/` using `use` prefix and camelCase (e.g., `useAmbientSound.ts`).
2. Include the license header.
3. Export the hook as a **named export**.
4. Return a well-typed object or tuple.
5. Use `useCallback` for returned functions and `useEffect` for side effects with proper cleanup.

```typescript
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';

export const useAmbientSound = (theme: string) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const toggle = useCallback(() => {
        setIsPlaying(prev => !prev);
    }, []);

    useEffect(() => {
        // Setup and cleanup logic
        return () => {
            // Cleanup
        };
    }, [theme]);

    return { isPlaying, toggle };
};
```

---

## Testing Guidelines

This project does not currently include a test framework, but contributions adding tests are welcome. If you add tests:

- Use **Vitest** as the test runner (it integrates natively with Vite).
- Place test files alongside the source files using the `.test.ts` or `.test.tsx` suffix.
- Use **React Testing Library** for component tests.
- Test custom hooks with `@testing-library/react-hooks` or `renderHook` from React Testing Library.
- Focus on:
  - **Hook logic:** State transitions in `useStoryEngine`, narration sync behavior.
  - **Component rendering:** Correct rendering based on props, user interaction handlers.
  - **API endpoints:** Request validation, error handling, response format.
  - **Utility modules:** `StorageManager`, `Logger`, `SoundManager`.
- Mock external dependencies (Gemini API, Web Audio API, IndexedDB).

Example test file structure:

```
hooks/
├── useStoryEngine.ts
└── useStoryEngine.test.ts
components/
├── ReadingView.tsx
└── ReadingView.test.tsx
```

---

## Documentation Standards

- Update the **README.md** if your change affects setup steps, available scripts, or project overview.
- Add **JSDoc comments** to exported functions, hooks, and complex logic:
  ```typescript
  /**
   * Generates an AI-powered bedtime story based on user input.
   * Streams the response and saves it to local storage.
   * @param input - The story configuration from the setup phase.
   * @returns The complete story object with parts, choices, and metadata.
   */
  ```
- Document component props with an `interface` that includes descriptive property names.
- Keep inline comments concise and focused on **why**, not **what**.
- Reference the existing architecture documentation in `ARCHITECTURE.md` and `GEMINI_INTEGRATION.md` when relevant.

---

## Reporting Bugs

When filing a bug report, please include:

### Bug Report Template

```markdown
**Describe the bug:**
A clear and concise description of what the bug is.

**Steps to reproduce:**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior:**
A clear description of what you expected to happen.

**Actual behavior:**
What actually happened, including any error messages.

**Screenshots / Screen recordings:**
If applicable, add visual evidence to help explain the problem.

**Environment:**
- OS: [e.g., Windows 11, macOS 14, iOS 17]
- Browser: [e.g., Chrome 120, Safari 17]
- App version or commit hash: [e.g., v0.0.0, abc1234]

**Story mode:**
- [ ] Classic
- [ ] Mad Libs
- [ ] Sleep

**Additional context:**
Any other relevant information (console errors, network tab output, etc.)
```

---

## Feature Requests

We welcome feature ideas! To propose a new feature:

1. **Search existing issues** to ensure it has not already been proposed.
2. **Open a new issue** with the following structure:

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem. Example: "I'm always frustrated when..."

**Describe the solution you'd like:**
A clear description of the desired behavior.

**Describe alternatives you've considered:**
Other solutions or features you have considered.

**Target audience:**
Who benefits from this feature? (e.g., children, parents, developers)

**Mockups / Examples:**
If applicable, include sketches, screenshots from similar apps, or wireframes.

**Additional context:**
Any other relevant information.
```

3. **Wait for maintainer feedback** before starting implementation. This ensures the feature aligns with the project direction.
4. Once approved, reference the issue number in your PR.

---

## Security Vulnerability Reporting

**Do NOT file security vulnerabilities as public GitHub issues.**

This project handles API keys and is designed for use by children, so security is taken seriously.

If you discover a security vulnerability, please report it responsibly:

1. **Email the maintainers directly** with the subject line: `[SECURITY] Infinity Heroes: Vulnerability Report`.
2. Include the following details:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if you have one)
3. You will receive an acknowledgment within **48 hours**.
4. We will work with you to understand and address the issue before any public disclosure.

### Security Considerations for Contributors

- **Never commit API keys, secrets, or credentials** to the repository.
- Use environment variables (`process.env.GEMINI_API_KEY`) for all sensitive values.
- Validate and sanitize all user input, especially text that gets sent to AI APIs.
- Review the Content Security Policy in `vercel.json` before adding new external resources.
- Be mindful of the `CHILD_SAFETY_COMPLIANCE.md` guidelines when contributing content or features.

---

## License

By contributing to this project, you agree that your contributions will be licensed under the **Apache License 2.0** (`SPDX-License-Identifier: Apache-2.0`), consistent with the existing codebase.

---

Thank you for helping make bedtime stories more magical! Every contribution, no matter how small, makes a difference.
