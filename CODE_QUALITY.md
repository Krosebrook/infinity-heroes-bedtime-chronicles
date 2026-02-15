# Code Quality Guidelines

## Overview

This document outlines code quality standards, best practices, and conventions for the Infinity Heroes: Bedtime Chronicles project.

## Code Quality Standards

### TypeScript

#### Type Safety
- **Strict mode enabled**: `strict: true` in `tsconfig.json`
- **No implicit any**: Prefer explicit types over `any`
- **Return types**: Add return types to exported functions
- **Interface over type**: Use `interface` for objects, `type` for unions/intersections

✅ **Good:**
```typescript
export interface StoryPart {
  text: string;
  sceneDescription: string;
  choices: Choice[];
}

export const generateStory = async (input: StoryState): Promise<StoryFull> => {
  // Implementation
};
```

❌ **Avoid:**
```typescript
export const generateStory = async (input: any) => {
  // No return type, using any
};
```

#### Path Aliases
Use `@/` prefix for imports from project root:
```typescript
import { logger } from '@/lib/Logger';
import { StoryFull } from '@/types';
```

### React Patterns

#### Component Structure
```typescript
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { ComponentProps } from './types';

interface MyComponentProps {
  title: string;
  onAction: () => void;
  isLoading?: boolean; // Optional props have `?`
}

export const MyComponent: React.FC<MyComponentProps> = ({ 
  title, 
  onAction, 
  isLoading = false // Provide defaults
}) => {
  const [state, setState] = useState(initialValue);

  const handleClick = useCallback(() => {
    onAction();
  }, [onAction]);

  return (
    <motion.div className="container">
      <h2>{title}</h2>
      <button onClick={handleClick} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Click me'}
      </button>
    </motion.div>
  );
};
```

#### Hooks Best Practices
- Extract complex logic into custom hooks (in `hooks/` directory)
- Use `useCallback` for functions passed as props
- Use `useMemo` for expensive computations
- Always clean up effects (return cleanup function)

```typescript
export const useMyFeature = (dependency: string) => {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    
    fetchData(dependency, controller.signal)
      .then(setData)
      .catch(console.error);

    return () => controller.abort(); // Cleanup
  }, [dependency]);

  return data;
};
```

### Code Organization

#### File Naming
| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `ReadingView.tsx` |
| Hooks | camelCase with `use` prefix | `useStoryEngine.ts` |
| Utilities | PascalCase | `StorageManager.ts` |
| Types | camelCase | `types.ts` |
| API routes | kebab-case | `generate-story.ts` |

#### Import Order
1. React and framework
2. Third-party libraries
3. Internal components
4. Hooks
5. Utilities
6. Types

Separate each group with a blank line:
```typescript
import React, { useState } from 'react';
import { motion } from 'framer-motion';

import { Button } from '@/components/Button';
import { ReadingView } from '@/components/ReadingView';

import { useStoryEngine } from '@/hooks/useStoryEngine';

import { logger } from '@/lib/Logger';
import { storageManager } from '@/lib/StorageManager';

import type { StoryFull, StoryState } from '@/types';
```

## Logging Best Practices

### Using the Logger Utility

The project includes a `Logger` utility in `lib/Logger.ts`. Use it instead of `console.*` for structured logging:

```typescript
import { logger } from '@/lib/Logger';

// Different log levels
logger.debug('Detailed debug information', { userId, sessionId });
logger.info('Story generation started', { mode: 'classic', heroName });
logger.warn('API rate limit approaching', { remainingRequests: 10 });
logger.error('Failed to save story', error);
```

### When to Use Console vs Logger

#### ✅ Use Logger For:
- Application events (user actions, state changes)
- API calls and responses
- Errors and warnings
- Performance metrics

#### ⚠️ Use Console For:
- Development debugging (temporary)
- API endpoint logs (serverless functions)

```typescript
// In API endpoints (generate-story.ts, etc.)
console.error('Story generation error:', error); // OK for serverless

// In client code
logger.error('Story generation error:', error); // Prefer logger
```

### Current Console Usage Audit

The codebase has **17 instances** of `console.*` calls. These should gradually be migrated to use the Logger:

```bash
# Find all console usage
grep -r "console\." --include="*.ts" --include="*.tsx" --exclude-dir=node_modules
```

**Acceptable console usage:**
- API endpoints (`api/*.ts`) - logs are captured by Vercel
- Error boundaries - final fallback logging
- Service Worker registration

**Should migrate:**
- Retry logic warnings
- State machine transitions
- Audio/narration debugging

## Error Handling

### API Error Handling Pattern

```typescript
try {
  const result = await apiCall();
  return result;
} catch (error: any) {
  // Log with context
  logger.error('Operation failed', { 
    operation: 'apiCall',
    error: error.message,
    stack: error.stack 
  });
  
  // User-friendly message
  throw new Error('Unable to complete request. Please try again.');
}
```

### Component Error Boundaries

Wrap major sections with `ErrorBoundary`:
```tsx
<ErrorBoundary fallback={<ErrorFallback />}>
  <ReadingView story={story} />
</ErrorBoundary>
```

## Performance Best Practices

### Code Splitting
Use `React.lazy()` for route-level splits:
```typescript
const ReadingView = lazy(() => import('@/components/ReadingView'));
const CompletionView = lazy(() => import('@/components/CompletionView'));

// Wrap in Suspense
<Suspense fallback={<LoadingFX />}>
  <ReadingView />
</Suspense>
```

### Memoization
```typescript
// Expensive calculation
const processedData = useMemo(() => {
  return expensiveOperation(data);
}, [data]);

// Callback stability
const handleSubmit = useCallback(async () => {
  await submitForm();
}, [submitForm]);
```

### Image Optimization
- Use WebP format for images
- Lazy load images below the fold
- Provide width/height to prevent layout shift

```tsx
<img 
  src={avatarUrl} 
  alt="Hero avatar"
  width={200}
  height={200}
  loading="lazy"
/>
```

## Security Best Practices

### Input Validation
```typescript
// Validate user input before sending to API
const validateHeroName = (name: string): boolean => {
  if (!name || name.trim().length === 0) return false;
  if (name.length > 50) return false; // Max length
  if (/<script|javascript:/i.test(name)) return false; // Basic XSS check
  return true;
};
```

### API Key Protection
```typescript
// ❌ NEVER do this
const apiKey = 'AIza...'; // Hardcoded secret

// ✅ Always use environment variables (server-side only)
const apiKey = process.env.GEMINI_API_KEY; // In API routes only
```

### Content Security Policy
Defined in `vercel.json`:
- `script-src 'self'` - Only scripts from our domain
- `connect-src` limited to Gemini API
- No inline scripts without hash/nonce

## Child Safety (COPPA Compliance)

### Prohibited Patterns

❌ **DO NOT:**
```typescript
// Collect PII
const saveUserData = (email: string, name: string) => { /* ... */ };

// Add tracking/analytics
import Analytics from 'analytics-library';

// External links
<a href="https://external-site.com">Click here</a>

// Social media embeds
<script src="https://platform.twitter.com/widgets.js"></script>
```

✅ **DO:**
```typescript
// Store only in-session data locally
localStorage.setItem('heroName', heroName);

// No analytics, just error logging
logger.error('Generation failed', { mode, length });

// No external navigation
// All content is self-contained
```

### Content Filtering
AI prompts must include safety guidelines:
```typescript
const systemInstruction = `
You are a children's storyteller (ages 7-9).
NEVER include:
- Violence, weapons, fighting, or danger
- Scary or dark themes
- References to death, injury, or harm
- Real-world brands or products
- Inappropriate language
`;
```

## Accessibility

### Semantic HTML
```tsx
// ❌ Div soup
<div className="button" onClick={handleClick}>Click</div>

// ✅ Semantic elements
<button onClick={handleClick} aria-label="Generate story">
  Generate
</button>
```

### ARIA Attributes
```tsx
<div role="status" aria-live="polite" aria-atomic="true">
  {isLoading ? 'Generating story...' : 'Story ready'}
</div>

<button 
  aria-label="Play narration"
  aria-pressed={isPlaying}
  onClick={toggleNarration}
>
  {isPlaying ? '⏸' : '▶️'}
</button>
```

### Keyboard Navigation
```tsx
const handleKeyPress = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    handleAction();
  }
};

<div 
  role="button" 
  tabIndex={0} 
  onKeyPress={handleKeyPress}
  onClick={handleAction}
>
  Interactive element
</div>
```

## Code Review Checklist

Before submitting a PR:

- [ ] All files have Apache-2.0 license header
- [ ] TypeScript compiles with no errors (`npm run typecheck`)
- [ ] ESLint passes with no errors (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] No hardcoded secrets or API keys
- [ ] Console logs replaced with Logger (except API endpoints)
- [ ] Child safety guidelines followed (no PII, tracking, external links)
- [ ] Accessibility attributes added where needed (`aria-*`, semantic HTML)
- [ ] Error handling includes user-friendly messages
- [ ] New dependencies checked for security vulnerabilities (`npm audit`)

## Automated Checks

### CI Pipeline (`.github/workflows/ci.yml`)
```yaml
- run: npm ci
- run: npx tsc --noEmit      # Type checking
- run: npm run build          # Build verification
# TODO: Add linting and tests
```

### Pre-commit Hooks (Future)
Consider adding Husky for automated checks:
```bash
npm install -D husky lint-staged

# .husky/pre-commit
npx lint-staged

# package.json
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
}
```

## Metrics & Monitoring

### Build Size Tracking
```bash
npm run build
# Check dist/assets/*.js sizes
# Main bundle should be < 400KB gzipped
```

### Performance Budget
| Metric | Target | Tool |
|--------|--------|------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Total Blocking Time | < 300ms | Lighthouse |
| Cumulative Layout Shift | < 0.1 | Lighthouse |
| Bundle size (gzip) | < 120KB | Build output |

### Runtime Monitoring (Future Recommendation)
Consider adding lightweight error tracking:
- Sentry (with strict PII filters for COPPA)
- PostHog (self-hosted, analytics disabled)
- Custom error reporting to your own endpoint

## Resources

- [TypeScript Best Practices](https://typescript-eslint.io/rules/)
- [React Best Practices](https://react.dev/learn)
- [Web.dev Performance](https://web.dev/performance/)
- [OWASP Secure Coding](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)

---

**License:** Apache-2.0 · SPDX-License-Identifier: Apache-2.0
