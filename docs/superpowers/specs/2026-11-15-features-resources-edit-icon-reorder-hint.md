# Features & Tracked Resources Edit Icon and Drag-to-Reorder Hint Spec

## Problem
In `CharacterSheetView.jsx`, the accordion action for Features & Tracked Resources uses `ArrowLeftRight` (title: "Rearrange features and tracked resources"). Other accordion sections (Combat Stats, Abilities, Skills, Proficiencies) use `Settings2` for their edit mode toggles. The `ArrowLeftRight` icon is unintuitive because clicking it actually toggles a general edit mode (enabling drag-and-drop reordering of tracked resources, deleting resources, removing feats, and showing drag handles). Users are also unaware that tracked resources can be dragged to reorder once editing is enabled.

## Solution
1. **Icon Alignment**:
   - Replace `ArrowLeftRight` with `Settings2` (`size={13}`) in `src/components/CharacterSheet/CharacterSheetView.jsx`.
   - Update `aria-label` to `"Edit features and resources"` and `title` to `"Edit features and resources"`.
2. **Reorder Hint (Option A)**:
   - In `src/components/CharacterSheet/ResourcesCard.jsx`, when `isEditing` is true and `trackedResources` exists and has items (`trackedResources.length > 0`), render subtle greyed hint text above the tracked resource item list:
     `<div className="text-[10px] text-slate-500 italic pb-0.5 select-none">Drag items to reorder</div>`
   - Keep layout minimal and borderless per UI conventions.

## Constraints
- Follow Zero Outlines rule: no borders.
- Keep tests green; update any existing tests looking for `Rearrange` or `ArrowLeftRight` if applicable.
