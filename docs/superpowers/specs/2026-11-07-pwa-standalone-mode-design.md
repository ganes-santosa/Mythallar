# PWA Standalone Mode for Tablet & iPad Play

## Intent & Why
On Android tablets and iPads, browser tab bars and URL bars consume significant vertical screen space during tabletop play because Mythallar uses a locked `body` with independent dual-pane scroll containers (`overflow: hidden`), which never triggers browser scroll-to-hide bars. Configuring Mythallar as an installable Standalone Web App (PWA) removes browser chrome completely without adding new header buttons.

## Goals & Non-Goals
- **Goals**:
  - Enable true standalone installation ("Install App" / "Add to Home Screen") on Android tablets (Chrome) and iPads (Safari) with `display: "standalone"` so the top tab/address bar is completely removed.
  - Provide properly sized `192x192` and `512x512` app icons on Mythallar's dark background (`#17181B`) with gold logo so home screen and taskbar icons look crisp on both iOS and Android.
  - Use dynamic viewport height (`100dvh` with `100vh` fallback) on the app shell so standalone and browser viewports size accurately on tablets.
- **Non-Goals**:
  - Adding an in-header Fullscreen toggle button (header space is constrained).
  - Full offline caching of third-party external assets beyond a minimal service worker for Android Chrome PWA installability.

## Approaches Considered
1. **Native Web App Manifest + iOS Standalone Meta Tags + Minimal Service Worker (Selected)**:
   - Zero runtime dependencies; adds `public/manifest.webmanifest`, `public/sw.js`, `192x192` & `512x512` icons, and `apple-mobile-web-app-capable` / `theme-color` tags in `index.html`.
   - Satisfies both iPad Safari "Add to Home Screen" and Android Chrome "Install App" criteria with zero UI clutter.
2. **In-App Fullscreen API Toggle Button**:
   - Works without installation, but consumes header space and exits fullscreen on `Esc` or app switching.
3. **`vite-plugin-pwa` (Workbox)**:
   - Adds heavy build dependencies and aggressive precaching that can cause stale cache issues when not needed.

## Technical Changes
- **`public/pwa-192x192.png` & `public/pwa-512x512.png`**: Generated from `public/mythallar_logo_gold.png` centered on `#17181B`.
- **`public/manifest.webmanifest`**: `name: "Mythallar - DnD 5e Spellbook"`, `short_name: "Mythallar"`, `display: "standalone"`, `background_color: "#17181B"`, `theme_color: "#17181B"`, `start_url: "/"`, `icons` (`192x192`, `512x512`, `any maskable`).
- **`public/sw.js` & registration in `src/main.jsx`**: Minimal pass-through service worker so Chrome on Android enables native PWA installation ("Install app") instead of a browser bookmark.
- **`index.html`**: Link manifest, `apple-touch-icon`, `theme-color`, `apple-mobile-web-app-capable`, `mobile-web-app-capable`, and `apple-mobile-web-app-status-bar-style`.
- **`src/App.jsx`**: Add `h-dvh` alongside `h-screen` (`h-screen h-[100dvh]`) on the root container so mobile/tablet viewports fit exact visible height.
