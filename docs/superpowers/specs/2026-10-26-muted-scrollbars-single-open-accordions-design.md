# Muted Scrollbars and Single-Open Spell Accordions

## Intent
Reduce scrollbar distraction, preserve contrast, prevent spell content clipping, and keep spell lists compact.

## Changes
- Use muted `--color-muted` scrollbar thumb with visible `--color-panel` track; retain hover contrast without gold.
- Add right breathing room inside Spellbook scroll content so prepared spell controls do not sit beneath scrollbar.
- Make left catalog level accordions single-open: opening one closes prior open level.
- Make right Spellbook level accordions single-open: opening one closes prior open level.

## Approach
Keep existing component structure. Replace independent boolean level state with one active level ID/state in each list owner. Use existing callbacks/data flow. No dependency or shared abstraction.

## Non-goals
No palette redesign, no change to spell preparation/casting, no deployment.

## Acceptance
- Scroll thumb muted pewter; track visibly dark and distinct in Spellbook.
- Prepared spell content remains fully visible beside scrollbar.
- At most one catalog level accordion open.
- At most one Spellbook level accordion open.
- Existing tests and build pass.
