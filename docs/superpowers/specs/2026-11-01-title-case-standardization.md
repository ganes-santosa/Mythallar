# Title Case Standardization Specification

**Goal:** Standardize character sheet card headers, internal labels, field tags, tracker labels, and action buttons to Title Case across Mythallar, aligning with existing app conventions while keeping standard 5e game initialisms uppercase and prohibiting CSS `uppercase` / ALL-CAPS styling.

## Context & Rationale
The application historically and predominantly uses Title Case across headers and cards (e.g. *Spell Slots*, *Arcane Recovery*, *Combat Stats*, *Hit Points*, *Hit Dice*). Earlier attempts to introduce sentence case in the Combat Stats card conflicted with this established pattern. This specification codifies Title Case across both panes as the official project standard.

## Requirements
1. **Title Case Convention**:
   - Section and accordion titles: Title Case (e.g. *Combat Stats*, *Spell Slots*, *Ability Scores & Saving Throws*).
   - Inner card labels & headings: Title Case (e.g. *Hit Points*, *Hit Dice*, *Death Saves*, *Max HP Buff*, *Base Max*, *Temp HP*, *Armor Class*, *Walking Speed*, *Defenses & Resistances*).
   - Trackers & death save labels: Title Case (`Hit Dice`, `Death Saves`, `Inspiration`, `Succ`, `Fail`).
   - Action & utility buttons: Title Case (`Damage`, `Heal`, `+ Add Condition`, `+ Add Defense`, `Save`, `Cancel`).
2. **Standard 5e Initialisms**:
   - `HP`, `AC`, `DEX`, `STR`, `CON`, `INT`, `WIS`, `CHA`, `ft` remain uppercase.
3. **Anti-ALL-CAPS Rule**:
   - Never use CSS `uppercase` or all-caps raw text strings (`HIT POINTS`, `SPEED`, `INIT`).
4. **Responsive Elements**:
   - Initiative header displays `Initiative` on desktop/tablet and `Init` on mobile (`hidden sm:inline` and `sm:hidden`).
   - Screen reader accessibility: `<span className="sm:hidden" aria-hidden="true">Init</span>` so screen readers do not read both labels.
   - Quick HP amount input gets `aria-label="Amount"`.
5. **Documentation & Repo Guidelines**:
   - Update `docs/superpowers/specs/2026-10-31-visual-guidelines.md` to define Title Case as the global standard.
   - Update `AGENTS.md` under `## UI conventions`.
