# Visual Overhaul, Palette Switcher & Mythallar Celestial Logo Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the visual styling to remove gambling-style harsh gold outlines and glowing borders in favor of clean tone-on-tone surfaces and sleek modern layouts; replace the top-right "Drag to Spellbook" text with a Settings modal button supporting live theme palette selection across 6 curated palettes; add a subtle version number (`v1.1.0`) on the top-left subheader; and replace the generic BookOpen icon with the newly processed transparent Mythallar Celestial Sigil.

**Architecture:**
- Theme Palette Engine: `src/utils/themeService.js` defines the 6 palettes (Mythallar Classic, Delft Sunset, Twilight Violet, Burnt Sienna, Autumn Canopy, Space Cadet) using CSS variables (`--color-bg`, `--color-panel`, `--color-card`, `--color-hover`, `--color-border`, `--color-gold`, etc.), persisted to `localStorage` and applied to `document.documentElement`.
- Tailwind configuration: `tailwind.config.js` and `src/index.css` mapped to CSS variables with fallback.
- Logo Component: `src/components/Common/MythallarLogo.jsx` rendering the transparent Celestial Sphere icon with dynamic coloring and sizing.
- Settings Modal: `src/components/Header/SettingsModal.jsx` displaying palette cards with visual color dots, active checks, and settings controls.
- Visual Polish: Refine `CharacterManagerModal.jsx`, `CharacterHeader.jsx`, `FilterBar.jsx`, `SpellCard.jsx`, `SpellbookView.jsx`, and `App.jsx` to eliminate harsh border-heavy/casino styling.

**Tech Stack:** React 18, Vite, Tailwind CSS, Lucide React, Vitest.

---

### Task 1: Theme Palette Service & Tailwind CSS Variables

**Files:**
- Create: `src/utils/themeService.js`
- Test: `src/utils/themeService.test.js`
- Modify: `tailwind.config.js`
- Modify: `src/index.css`

- [ ] **Step 1: Write tests for `themeService.js`**
  Verify available themes, `getStoredTheme()`, `setTheme()`, and CSS variable application.
- [ ] **Step 2: Implement `src/utils/themeService.js`**
  Map 6 palettes:
  - `mythallar-classic`: Obsidian (`#17181B`), Panel (`#202227`), Card (`#292B32`), Amber Gold (`#e0a838`), Ivory (`#EFE9E0`).
  - `delft-sunset`: Licorice (`#251211`), Delft Blue (`#353B56`), Persian Orange (`#C99379`), Earth Yellow (`#FBB45E`), Taupe Gray (`#7D7585`).
  - `twilight-violet`: Midnight Violet (`#2B193D`), Twilight Indigo (`#2C365E`), Dusty Grape (`#484D6D`), Dark Cyan (`#4B8F8C`), Rosy Taupe (`#C5979D`).
  - `burnt-sienna`: Raisin Black (`#272233`), Gunmetal (`#213241`), Dark Purple (`#3D2228`), Burnt Sienna (`#DD7057`), Sandy Brown (`#F4A971`).
  - `autumn-canopy`: PNW Breeze (`#443B1C`), Leather (`#5E3721`), Fall Leaves (`#8D5C2F`), Mustard (`#C5953E`), Trail Dust (`#C8B38B`), Field Notes (`#F4EEE6`).
  - `space-cadet`: Caput Mortuum (`#632024`), Space Cadet (`#25344F`), Coffee (`#6F4D38`), Slate Gray (`#617891`), Tan (`#D5B893`).
- [ ] **Step 3: Update `tailwind.config.js` and `src/index.css`**
  Map `colors.dnd.*` to CSS variables with default fallbacks.
- [ ] **Step 4: Run tests and verify**

---

### Task 2: Mythallar Celestial Logo Component

**Files:**
- Create: `src/components/Common/MythallarLogo.jsx`
- Test: `src/components/Common/MythallarLogo.test.jsx`

- [ ] **Step 1: Write test for `MythallarLogo`**
  Verify it renders an image or masked icon element with accessibility attributes and custom sizing.
- [ ] **Step 2: Implement `MythallarLogo.jsx`**
  Render `/mythallar_logo.png` with crisp scaling and optional accent tinting.
- [ ] **Step 3: Run tests and verify**

---

### Task 3: Settings Modal Component

**Files:**
- Create: `src/components/Header/SettingsModal.jsx`
- Test: `src/components/Header/SettingsModal.test.jsx`

- [ ] **Step 1: Write test for `SettingsModal.test.jsx`**
  Verify palette list renders, clicking a palette activates it and calls `setTheme`, modal closes on close button.
- [ ] **Step 2: Implement `SettingsModal.jsx`**
  Modal with clean borderless design, theme palette swatch grid, and version display.
- [ ] **Step 3: Run tests and verify**

---

### Task 4: Visual Clean-Up & Header Overhaul

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/Header/CharacterHeader.jsx`
- Modify: `src/components/Header/CharacterManagerModal.jsx`
- Modify: `src/components/Header/ProfileSelector.jsx`

- [ ] **Step 1: Replace "Drag to Spellbook" text with Settings button in `src/App.jsx`**
- [ ] **Step 2: Add version tag (`v1.1.0`) under or beside DnD 5e Spellbook in `src/App.jsx`**
- [ ] **Step 3: Replace BookOpen icon with `MythallarLogo` in `src/App.jsx`**
- [ ] **Step 4: Remove harsh outlines and glowing borders in modals and panels**
  Replace with subtle dark tones, gentle backdrop blurs, and soft surface distinctions.
- [ ] **Step 5: Run complete test suite and build verification**
