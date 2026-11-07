# PWA Standalone Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure Mythallar as an installable Standalone Web App (PWA) for Android tablets and iPads so players can launch without browser tab or URL bars.

**Architecture:** Add a W3C Web App Manifest (`public/manifest.webmanifest`), `192x192` and `512x512` dark-background PNG app icons (`public/pwa-192x192.png`, `public/pwa-512x512.png`), a minimal pass-through service worker (`public/sw.js`) registered via `src/utils/pwa.js` + `src/main.jsx`, iPad/Android standalone meta tags in `index.html`, and `h-[100dvh]` dynamic viewport sizing in `src/App.jsx`.

**Tech Stack:** HTML5 / W3C Web App Manifest, Service Worker API, React 18, Tailwind CSS 3, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-07-pwa-standalone-mode-design.md`

## Global Constraints

- Zero new npm dependencies.
- `background_color` and `theme_color` must be `#17181B`.
- `display` must be `"standalone"`, `start_url` and `scope` must be `"/"`.
- Service worker registration must safely no-op in non-browser/test environments or when `navigator.serviceWorker` is unavailable or rejects.

## Review Focus

- Environments without `navigator.serviceWorker` (SSR, jsdom tests, older browsers, insecure contexts) must not throw when `registerServiceWorker()` runs.
- Service worker registration rejection (e.g., blocked by browser privacy settings) must be caught silently without unhandled promise rejections.
- `manifest.webmanifest` must contain valid JSON with both `192x192` and `512x512` PNG icons on `#17181B` so Android Chrome's installability check passes and iPadOS home-screen icons are non-transparent.

---

### Task 1: PWA Assets, Manifest, HTML Meta Tags, and Service Worker Registration

**Files:**
- Create: `public/pwa-192x192.png`
- Create: `public/pwa-512x512.png`
- Create: `public/manifest.webmanifest`
- Create: `public/sw.js`
- Create: `src/utils/pwa.js`
- Create: `src/utils/pwa.test.js`
- Modify: `index.html`
- Modify: `src/main.jsx`
- Modify: `src/App.jsx:1036`

**Interfaces:**
- Consumes: `public/mythallar_logo_gold.png`
- Produces: `registerServiceWorker()` in `src/utils/pwa.js`

- [ ] **Step 1: Write the failing test in `src/utils/pwa.test.js`**

```js
import { describe, it, expect, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { registerServiceWorker } from './pwa';

describe('PWA standalone configuration', () => {
  it('provides a valid manifest.webmanifest with standalone display and 192/512 icons', () => {
    const manifestPath = path.resolve(process.cwd(), 'public/manifest.webmanifest');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    expect(manifest.name).toBe('Mythallar - DnD 5e Spellbook');
    expect(manifest.short_name).toBe('Mythallar');
    expect(manifest.display).toBe('standalone');
    expect(manifest.background_color).toBe('#17181B');
    expect(manifest.theme_color).toBe('#17181B');
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }),
        expect.objectContaining({ src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' }),
      ])
    );
    expect(fs.existsSync(path.resolve(process.cwd(), 'public/pwa-192x192.png'))).toBe(true);
    expect(fs.existsSync(path.resolve(process.cwd(), 'public/pwa-512x512.png'))).toBe(true);
  });

  it('links manifest and standalone meta tags in index.html', () => {
    const html = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8');
    expect(html).toContain('rel="manifest" href="/manifest.webmanifest"');
    expect(html).toContain('name="apple-mobile-web-app-capable" content="yes"');
    expect(html).toContain('name="mobile-web-app-capable" content="yes"');
    expect(html).toContain('name="theme-color" content="#17181B"');
    expect(html).toContain('rel="apple-touch-icon" href="/pwa-192x192.png"');
  });

  it('registers /sw.js when serviceWorker is supported and swallows rejections', async () => {
    const registerMock = vi.fn().mockRejectedValueOnce(new Error('blocked'));
    await expect(registerServiceWorker({ serviceWorker: { register: registerMock } })).resolves.toBeUndefined();
    expect(registerMock).toHaveBeenCalledWith('/sw.js');
    await expect(registerServiceWorker({})).resolves.toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- --run src/utils/pwa.test.js`
Expected: FAIL with module `./pwa` not found.

- [ ] **Step 3: Generate `public/pwa-192x192.png` and `public/pwa-512x512.png`, and implement `public/manifest.webmanifest`, `public/sw.js`, `src/utils/pwa.js`, `index.html`, `src/main.jsx`, and `src/App.jsx`**

- Render `public/mythallar_logo_gold.png` centered with `16%` padding on a `#17181B` background canvas at `192x192` and `512x512` and save to `public/pwa-192x192.png` and `public/pwa-512x512.png`.
- Write `public/manifest.webmanifest` with `name: "Mythallar - DnD 5e Spellbook"`, `short_name: "Mythallar"`, `start_url: "/"`, `scope: "/"`, `display: "standalone"`, `background_color: "#17181B"`, `theme_color: "#17181B"`, and `192x192` + `512x512` icons (`purpose: "any maskable"`).
- Write `public/sw.js` with `install` (`self.skipWaiting()`), `activate` (`self.clients.claim()`), and a pass-through `fetch` listener so Android Chrome's PWA installability check succeeds.
- Implement `export async function registerServiceWorker(nav = typeof navigator !== 'undefined' ? navigator : undefined)` in `src/utils/pwa.js` that calls `await nav.serviceWorker.register('/sw.js')` inside `try/catch`, and invoke it on window `load` in `src/main.jsx`.
- Add `<meta name="theme-color" content="#17181B" />`, `<meta name="mobile-web-app-capable" content="yes" />`, `<meta name="apple-mobile-web-app-capable" content="yes" />`, `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />`, `<meta name="apple-mobile-web-app-title" content="Mythallar" />`, `<link rel="apple-touch-icon" href="/pwa-192x192.png" />`, and `<link rel="manifest" href="/manifest.webmanifest" />` to `index.html`.
- Update the root wrapper in `src/App.jsx` from `h-screen` to `h-screen h-[100dvh]`.

- [ ] **Step 4: Run test suite and build to verify everything passes**

Run: `npm.cmd test -- --run; npm.cmd run build`
Expected: PASS (all test files green, production build clean).
