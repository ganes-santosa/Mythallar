# Design: Uniform Container & Nested Subcontainer Color Hierarchy

**Date**: 2026-11-08  
**Status**: Pending Review  

## Intent & Why
Currently, container backgrounds and nested subcontainers throughout Mythallar have drifted into conflicting opacity and color values (`bg-dnd-panel`, `bg-dnd-panel/40`, `bg-dnd-panel/60`, `bg-dnd-panel/80`, `bg-dnd-panel/90`, `bg-dnd-card`, etc.) across different components. For example, the `Human` field subcontainer in `CharacterSheetHeader` used `bg-dnd-panel/60`, while proficiency tags in `ProficienciesCard` used solid `bg-dnd-panel`, and the `0/3` resource tracker pill in `ResourcesCard` used solid `bg-dnd-panel`.

The goal is to enforce a strictly cohesive, predictable visual hierarchy throughout the entire application based entirely on structural nesting depth rather than component type.

## Visual Hierarchy Rules
- **Level 0 (App Canvas)**: `bg-dnd-bg` (`#181a1f`) - base app canvas.
- **Level 1 (Section Panels & Modals)**: `bg-dnd-panel` (`#202227`) - main `AccordionSection` wrappers, modal backgrounds, and primary pane sections.
- **Level 2 (Cards & Standalone Items inside Level 1)**: `bg-dnd-card` (`#282a30`) - primary cards inside panels (e.g., Profile card, Hit Points hero card, AC card, Spellcasting card, Initiative card, Ability Score cards, Skills cards, Proficiencies category boxes, Tracked Resources stepper cards, Spellbook spell rows, Inventory item rows). Standalone tags directly inside Level 1 panels (e.g. Conditions, Feats) also use `bg-dnd-card`.
- **Level 3 (Nested Subcontainers & Insets inside Level 2 Cards)**: `bg-dnd-panel/70` - all nested elements, tags, insets, pills, and inputs inside Level 2 cards:
  - Identity fields in Header (Race/Species field, Subclass field, Class pills, Secondary speed pills).
  - VitalsCard inner containers (Current/Max HP box, Temp HP box, Treatment Damage/Heal capsule, Spellcasting INT ability pill, inner hit dice pools chips, AC breakdown / initiative inputs).
  - ProficienciesCard tags (Armor, Weapon, Tool, Language chips).
  - ResourcesCard stepper buttons (the `0 / 3` counter pill).
  - ItemsCard item details / inner chips and inputs.
  - Spellbook / SlotLevelRow level badges and inner inputs.

## Approaches Considered
1. **Approach A: Direct Utility Replacement (Selected)**
   - Replace all Level 3 subcontainers and insets directly with `bg-dnd-panel/70`.
   - *Trade-offs*: Zero new CSS abstractions or build changes. Minimal diff. Keeps code standard Tailwind matching surrounding codebase.
2. **Approach B: Custom Tailwind Token (`bg-dnd-subcontainer`)**
   - Add a custom utility or theme color in `tailwind.config.js` aliased to `bg-dnd-panel/70`.
   - *Trade-offs*: Single point of control if opacity changes later, but adds an extra custom token name not previously in design guidelines.

## Scope of Changes
- `src/components/CharacterSheet/CharacterSheetHeader.jsx`: Class pills, Race/Subclass display and inputs, Speed strip chips.
- `src/components/CharacterSheet/VitalsCard.jsx`: HP sub-containers (Current/Max, Temp HP), Quick treatment capsule, Spellcasting INT pill, inner hit dice chips.
- `src/components/CharacterSheet/ProficienciesCard.jsx`: Proficiency item tags (`items.map(...)`).
- `src/components/CharacterSheet/ResourcesCard.jsx`: Stepper counter capsule (`{res.current} / {res.max}`).
- `src/components/Spellbook/SlotLevelRow.jsx`: Level badge (`bg-dnd-panel/80` -> `bg-dnd-panel/70`) and inner edit inputs.
- Relevant unit tests updated where class expectations check specific background utilities.

## Verification
- Run test suite: `npm.cmd test -- --run`
- Run production build: `npm.cmd run build`
