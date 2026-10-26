# Interface Contrast and Scrollbar Design

## Intent
Improve visual cohesion and readability without changing app behavior.

## Changes
- Replace browser-default white scrollbars with theme-aware dark track and muted gold/pewter thumb across app scroll regions.
- Remove `Mythallar Grimoire` text from Settings modal footer.
- Increase left/right pane contrast from `bg-dnd-panel/30` versus `bg-dnd-panel/10` to `bg-dnd-panel/40` versus `bg-dnd-panel/5`.
- Add horizontal breathing room around left spell list cards so selected ring/shadow is not clipped at left edge.

## Approach
Use existing theme CSS variables and one global scrollbar rule, rather than per-component scrollbar classes. Keep changes minimal: one stylesheet, `App.jsx`, `SettingsModal.jsx`, and the spell-list overflow wrapper.

## Non-goals
No new dependency, no palette redesign, no behavior changes, no deployment.

## Acceptance
- Scrollbars no longer render bright white and follow current dark/gold theme.
- Settings modal no longer displays `Mythallar Grimoire`.
- Left/right pane background contrast is visibly stronger but subtle.
- Selected left spell outline is fully visible.
- `npm test` and `npm run build` pass.
