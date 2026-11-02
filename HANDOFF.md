# HANDOFF

## Current state (v2.1.2 - master)
- **Accordion Section Reorder:**
  - Restored `Ability Scores & Saving Throws` to Section 4.
  - Current order: Character -> Combat Stats -> Features & Tracked Resources -> Ability Scores & Saving Throws -> Skills & Senses -> Items & Inventory -> Proficiencies & Training.
- **Freeform Notes Auto-Expanding Field:**
  - `ResourcesCard` Freeform Notes textarea starts at 2 lines (`rows={2}`, `min-h-[59px]`) when empty.
  - Auto-expands to match content height as lines are added.
  - Capped at ~10 lines (`max-h-[215px]`) with vertical scrolling past the limit.
- **Character Identity Fields Edit Mode:**
  - `Race / Species`, `Subclass / Tradition`, and `Background` are now only editable when the Character accordion is in editing mode (`isEditing`). In read-only mode, they render as static badges with subtle italic *None* when empty.
- **Features & Tracked Resources Edit Mode & Icon:**
  - Changed accordion section icon from `Sparkles` to `Flame`.
  - Replaced "+ Add Resource" button in the accordion header with an edit toggle (`Settings2` / `Check`) matching `ProficienciesCard`.
  - Resource deletion buttons (`X`), inline "+ Add Resource" drawer trigger, Feats "+ Add" trigger, and Feat remove buttons (`X`) only reveal when `isEditingResources` is active.
- **Item Chip Two-Click Confirmation:**
  - Extracted `ItemDeleteButton` child component in `ItemsCard.jsx` wrapped with `useTwoClickConfirm`.
  - First click arms delete state (`text-red-500 bg-red-950/70 ring-1 ring-red-500/60`, title `Click again to delete ...`); second click confirms deletion.
- **Short Rest Staged State & Modal Polish:**
  - `Dices` icon for hit dice rolls, in-modal toast feedback, local staging reverted on Cancel and persisted on Finish Short Rest.
- **Verification:** 40 test files (253 tests) passing; production build clean.

## Next up
- Ready for next user instructions or commit/release.

## Open questions
- (none)
