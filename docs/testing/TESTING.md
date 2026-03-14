# Testing Strategy & Guidelines

## Current Status

**⚠️ Important:** This project currently **does not have a test framework** in place. The testing infrastructure documented here represents the **recommended approach** for contributors who wish to add tests.

## Why No Tests Yet?

This is a rapid prototype focused on:
- Quick iteration on AI story generation features
- PWA capabilities and offline functionality
- User experience experimentation

While the project is production-ready from a feature perspective, comprehensive automated testing would be valuable for:
- Preventing regressions during refactoring
- Documenting expected behavior
- Catching edge cases in AI content generation
- Ensuring COPPA compliance safeguards remain intact

## Recommended Testing Stack

If you're adding tests to this project, we recommend:

### Core Testing Tools
```bash
npm install -D vitest @vitest/ui
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D @testing-library/react-hooks
npm install -D happy-dom # Lightweight DOM for Vitest
```

### Configuration
Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
```

Create `test/setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

### Package.json Scripts
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

## Testing Priorities

### 1. **Critical Path (High Priority)**
These tests protect the most important user flows:

#### Story Generation Flow
```typescript
// hooks/useStoryEngine.test.ts
describe('useStoryEngine', () => {
  it('should transition from setup to loading to reading phase');
  it('should handle story generation errors gracefully');
  it('should save story to IndexedDB after successful generation');
  it('should validate API key before making requests');
});
```

#### Child Safety Filters
```typescript
// AIClient.test.ts
describe('AIClient Story Generation', () => {
  it('should include child safety guardrails in system prompt');
  it('should reject prompts with inappropriate keywords');
  it('should enforce age-appropriate content guidelines');
});
```

#### Offline Functionality
```typescript
// lib/StorageManager.test.ts
describe('StorageManager', () => {
  it('should persist stories to IndexedDB');
  it('should retrieve cached stories when offline');
  it('should handle storage quota exceeded errors');
  it('should migrate data when schema version changes');
});
```

### 2. **API Endpoints (Medium Priority)**
Verify serverless functions behave correctly:

```typescript
// api/generate-story.test.ts
describe('POST /api/generate-story', () => {
  it('should return 405 for non-POST requests');
  it('should return 500 when API key is missing');
  it('should call Gemini API with correct parameters');
  it('should handle rate limiting with retry logic');
  it('should sanitize error messages before returning to client');
});
```

### 3. **UI Components (Medium Priority)**
Test user interactions and rendering:

```typescript
// components/ReadingView.test.tsx
describe('<ReadingView />', () => {
  it('should display current story part text');
  it('should show loading state while generating next part');
  it('should enable narration play button when audio is ready');
  it('should render choices when available');
  it('should advance to next part when choice is selected');
});
```

### 4. **Audio & Media (Low Priority)**
These are harder to test due to Web Audio API:

```typescript
// NarrationManager.test.ts
describe('NarrationManager', () => {
  it('should decode PCM audio data correctly');
  it('should emit progress events during playback');
  it('should clean up audio context on stop');
  // Use mock AudioContext for testing
});
```

## Testing Patterns

### Mocking External APIs

```typescript
// __mocks__/AIClient.ts
export const AIClient = {
  streamStory: vi.fn().mockResolvedValue({
    title: 'Test Story',
    parts: [{ text: 'Once upon a time...', choices: [] }]
  }),
  generateAvatar: vi.fn().mockResolvedValue('data:image/png;base64,...'),
};
```

### Testing Custom Hooks

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useStoryEngine } from './useStoryEngine';

describe('useStoryEngine', () => {
  it('should generate story when handleSubmit is called', async () => {
    const { result } = renderHook(() => useStoryEngine(
      mockValidateApiKey,
      mockSetShowApiKeyDialog
    ));

    act(() => {
      result.current.updateInput({ heroName: 'TestHero', mode: 'classic' });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current.story).toBeDefined();
    });
  });
});
```

### Testing Components with Framer Motion

```typescript
import { render, screen } from '@testing-library/react';

// Disable animations in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    // ... map all motion components to plain HTML
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('<CompletionView />', () => {
  it('should render badge when story is complete', () => {
    render(<CompletionView story={mockStory} />);
    expect(screen.getByText(/🏆/)).toBeInTheDocument();
  });
});
```

## Test Coverage Goals

If implementing tests, aim for:

| Category | Target Coverage | Rationale |
|----------|----------------|-----------|
| Business Logic (hooks, utilities) | 80%+ | Critical for correctness |
| API Endpoints | 90%+ | Security-sensitive |
| UI Components | 60%+ | Visual testing is also valuable |
| Integration Tests | 3-5 key flows | Covers realistic user journeys |

## Manual Testing Checklist

Until automated tests exist, use this checklist:

### Pre-Release Checks
- [ ] Test all three story modes (Classic, Mad Libs, Sleep)
- [ ] Verify avatar generation with different hero descriptions
- [ ] Test narration with all 7 voice options
- [ ] Verify offline mode (disconnect network, load saved story)
- [ ] Test on mobile devices (iOS Safari, Android Chrome)
- [ ] Check PWA installation on mobile
- [ ] Verify no console errors in production build
- [ ] Test with slow/throttled network (3G simulation)
- [ ] Verify Memory Jar loads previously saved stories
- [ ] Test long story generation (eternal mode)

### Child Safety Verification
- [ ] Generate 5+ stories and verify no inappropriate content
- [ ] Check that choices are always age-appropriate
- [ ] Verify no external links appear in generated content
- [ ] Confirm no PII is collected or transmitted

### Performance Checks
- [ ] Lighthouse PWA audit score > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3.5s
- [ ] Bundle size < 500KB gzipped
- [ ] No memory leaks during 30-minute session

## E2E Testing (Future)

For end-to-end testing, consider **Playwright**:

```bash
npm install -D @playwright/test
```

Example E2E test:
```typescript
// e2e/story-generation.spec.ts
import { test, expect } from '@playwright/test';

test('complete story generation flow', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Setup
  await page.fill('[data-testid="hero-name"]', 'TestHero');
  await page.selectOption('[data-testid="mode-select"]', 'classic');
  await page.click('[data-testid="generate-button"]');
  
  // Wait for generation
  await expect(page.locator('[data-testid="story-title"]')).toBeVisible({ timeout: 30000 });
  
  // Verify story loaded
  await expect(page.locator('[data-testid="story-part"]')).toHaveText(/Once upon a time/);
});
```

## CI/CD Integration

Once tests are added, update `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test -- --run
      - run: npm run build
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Status:** Recommendation document (no tests currently implemented)  
**License:** Apache-2.0 · SPDX-License-Identifier: Apache-2.0
