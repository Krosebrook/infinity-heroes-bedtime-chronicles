# Troubleshooting Guide

Common issues and solutions for Infinity Heroes: Bedtime Chronicles development and deployment.

## Table of Contents

- [Development Setup](#development-setup)
- [Build Issues](#build-issues)
- [API & AI Generation](#api--ai-generation)
- [Audio & Narration](#audio--narration)
- [PWA & Offline](#pwa--offline)
- [Performance](#performance)

---

## Development Setup

### Issue: `npm install` fails with permission errors

**Symptoms:**
```
EACCES: permission denied, mkdir '/usr/local/lib/node_modules'
```

**Solution:**
```bash
# Use nvm (Node Version Manager) for better Node.js management
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20
nvm use 20
npm install
```

### Issue: Wrong Node.js version

**Symptoms:**
```
error: The engine "node" is incompatible with this module
```

**Solution:**
Node.js >= 18 is required. Check your version:
```bash
node --version
```

If below 18, upgrade:
```bash
# Using nvm
nvm install 20
nvm use 20

# Or download from https://nodejs.org
```

### Issue: Port 3000 already in use

**Symptoms:**
```
Port 3000 is in use, trying another one...
```

**Solution:**
```bash
# Option 1: Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Option 2: Use a different port
npm run dev -- --port 3001
```

### Issue: Missing `.env` file causes API errors

**Symptoms:**
- "API key not configured" error in development
- AI generation requests fail

**Solution:**
1. Create `.env` in project root:
```bash
touch .env
```

2. Add your Gemini API key:
```env
GEMINI_API_KEY=your_key_here
```

3. Get a key from [Google AI Studio](https://aistudio.google.com/apikey)

4. **For local Vercel function testing**, use `vercel dev` instead of `npm run dev`

---

## Build Issues

### Issue: Build fails with TypeScript errors

**Symptoms:**
```
error TS2307: Cannot find module '@/types'
```

**Solution:**
Ensure `tsconfig.json` has the correct path aliases:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

Clear cache and rebuild:
```bash
rm -rf node_modules dist
npm install
npm run build
```

### Issue: Build succeeds but app crashes on load

**Symptoms:**
- Blank white screen in production
- Console errors about missing chunks

**Solution:**
Check `vite.config.ts` output configuration:
```typescript
export default defineConfig({
  base: './', // Use relative paths
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
```

### Issue: Tailwind styles not working

**Symptoms:**
- No styling in built app
- "Unexpected token" errors in CSS

**Solution:**
Verify `@tailwindcss/vite` plugin is installed and configured:
```bash
npm install -D @tailwindcss/vite tailwindcss
```

In `vite.config.ts`:
```typescript
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()]
});
```

---

## API & AI Generation

### Issue: "Failed to generate story" errors

**Symptoms:**
```
Error: API key not configured
```

**Solution (Development):**
```bash
# Use Vercel CLI to test functions locally
npm install -g vercel
vercel dev
```

**Solution (Production):**
1. Go to Vercel project settings
2. Add environment variable: `GEMINI_API_KEY`
3. Redeploy

### Issue: Rate limiting from Gemini API

**Symptoms:**
```
429 Too Many Requests
```

**Solution:**
The `AIClient.ts` has built-in retry logic with exponential backoff. If you're hitting limits frequently:

1. Check your Gemini API quota at [Google AI Studio](https://aistudio.google.com)
2. Consider adding request caching in development
3. Increase `storyLength` to 'short' during testing

### Issue: Inappropriate content generated

**Symptoms:**
- Story contains scary or violent themes
- Content not suitable for 7-9 year olds

**Solution:**
This should not happen due to system instructions. If it does:

1. Check `AIClient.ts` system instruction includes:
   - "NO violence, fear, or darkness"
   - "Age-appropriate for 7-9 year olds"
2. Report to Gemini API feedback
3. Implement additional client-side content filtering

### Issue: Image generation fails or returns broken images

**Symptoms:**
- Avatar or scene shows broken image icon
- Base64 decode errors in console

**Solution:**
```typescript
// Check response format from /api/generate-avatar
// Should return: { image: "base64_string_here" }

// Verify base64 string has proper data URL prefix
const imageUrl = `data:image/png;base64,${response.image}`;
```

---

## Audio & Narration

### Issue: Narration not playing

**Symptoms:**
- Play button doesn't work
- No audio output
- Console error: "AudioContext not available"

**Solution:**
Check browser autoplay policies:
```typescript
// User interaction required before audio plays
// Ensure play() is called from a click handler

const playNarration = async () => {
  try {
    await narrationManager.play();
  } catch (error) {
    console.error('Autoplay blocked:', error);
    // Show user prompt to enable audio
  }
};
```

### Issue: Narration out of sync with text

**Symptoms:**
- Text highlighting lags behind audio
- Words don't match spoken narration

**Solution:**
This is controlled by `useNarrationSync.ts`. The sync uses `requestAnimationFrame` polling. If issues persist:

1. Check audio playback rate:
```typescript
narrationManager.setPlaybackRate(1.0); // Reset to normal speed
```

2. Verify word timing data from TTS API
3. Clear audio cache and regenerate

### Issue: Ambient sound doesn't play in Sleep mode

**Symptoms:**
- No background sounds
- SoundManager errors in console

**Solution:**
Check Web Audio API support:
```typescript
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
if (!audioContext) {
  console.error('Web Audio API not supported');
}
```

Ensure theme is set correctly:
```typescript
soundManager.setTheme('rain'); // Valid themes: rain, forest, ocean, space, magic, crickets
```

---

## PWA & Offline

### Issue: App not installing as PWA

**Symptoms:**
- No "Install App" prompt
- Service worker registration fails

**Solution:**
1. Verify `metadata.json` is correctly configured
2. Check `vite-plugin-pwa` configuration in `vite.config.ts`
3. Serve over HTTPS (required for PWA)
4. Test with Lighthouse PWA audit

### Issue: Offline mode not working

**Symptoms:**
- "No internet" banner shows even when online
- Stories not loading from cache

**Solution:**
1. Check service worker registration:
```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});
```

2. Clear service worker cache:
```javascript
// In browser console
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

3. Verify IndexedDB is not full:
```javascript
// In browser console
indexedDB.databases().then(console.log);
```

### Issue: Large IndexedDB causing performance issues

**Symptoms:**
- App becomes slow over time
- Browser prompts about storage quota

**Solution:**
Clear old stories from Memory Jar:
1. Open Settings
2. Navigate to Memory Jar
3. Delete older stories
4. Or clear all data from browser DevTools → Application → Storage

---

## Performance

### Issue: Slow initial load time

**Symptoms:**
- First page load takes > 5 seconds
- Large bundle size

**Solution:**
1. Check bundle size:
```bash
npm run build
# Look at dist/assets/*.js sizes
```

2. Ensure code splitting is working:
```typescript
// In App.tsx
const ReadingView = lazy(() => import('./components/ReadingView'));
const CompletionView = lazy(() => import('./components/CompletionView'));
```

3. Optimize images in `public/`:
```bash
npm install -g @squoosh/cli
squoosh-cli --webp auto public/*.png
```

### Issue: Memory leaks during long story sessions

**Symptoms:**
- Browser tab becomes unresponsive
- High memory usage in Task Manager

**Solution:**
Verify cleanup in `useEffect` hooks:
```typescript
useEffect(() => {
  // Setup code
  return () => {
    // Cleanup: stop audio, clear timers, etc.
    narrationManager.stop();
    soundManager.stop();
  };
}, []);
```

### Issue: High CPU usage during narration

**Symptoms:**
- Fan spins up during story reading
- Battery drains quickly

**Solution:**
The `requestAnimationFrame` loop in `useNarrationSync` is the likely cause. Consider:
1. Reducing sync frequency (sample every 100ms instead of every frame)
2. Disabling word-level sync for long stories
3. Using CSS animations instead of JavaScript where possible

---

## Getting More Help

If your issue isn't covered here:

1. **Check existing issues**: [GitHub Issues](https://github.com/Krosebrook/infinity-heroes-bedtime-chronicles/issues)
2. **Search documentation**: See `docs/` directory for detailed guides
3. **Enable debug logging**:
```typescript
import { logger } from './lib/Logger';
logger.setLevel('debug');
```
4. **Create a new issue** with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser/OS information
   - Console error messages
   - Network tab screenshots (if API-related)

---

## Quick Diagnostics

Run this checklist for 90% of issues:

```bash
# 1. Check Node.js version
node --version  # Should be >= 18

# 2. Clear all caches
rm -rf node_modules dist .vite
npm install

# 3. Type check
npx tsc --noEmit

# 4. Build
npm run build

# 5. Test production build
npm run preview
```

If all steps pass, the issue is likely environment-specific (API keys, network, browser).

---

**License:** Apache-2.0 · SPDX-License-Identifier: Apache-2.0
