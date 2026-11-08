# Inventory Modernization Design (ARC Raiders Styling, Compact Attunement, Category Inline Viewer, Search)

## 1. Intent & Context
Players find the inventory UI cramped on tablet viewports and visually plain (colored dots look like productivity tags rather than game loot). Long inventory lists also force players to scroll all the way back to the top when inspecting an item at the bottom.

## 2. Requirements & Visual Language

### A. Compact Attunement Indicator (Option B)
- **Item Chip (List View)**:
  - Remove wide `(attunable)` and `Attuned` text badges.
  - Remove the left bookmark strip (`w-1.5` left bar).
  - Add compact glowing icon at right (e.g. `Sparkles` or `CircleDot` / `Radio` or custom ring icon):
    - When `attuned`: glowing amber/gold icon (`text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]`).
    - When `requiresAttunement && !attuned`: dim outline icon (`text-slate-600 group-hover:text-slate-400`).
    - When non-attunable: no icon.
- **Detail Viewer Pane**:
  - Keep explicit `Attuned` / `Attune` button and text badge so full status is completely clear.

### B. ARC Raiders Container Rarity Styling
- Remove round color dot (`w-2 h-2`).
- Neutral dark container base (`bg-dnd-card` / `bg-[#141820]`).
- Rarity visual cues:
  - Bottom border or bottom glow gradient sweep:
    - Slate/Common: neutral subtle edge `from-slate-700/20 via-transparent`.
    - Emerald/Uncommon: `from-emerald-500/25 via-emerald-500/5 to-transparent` with bottom accent `border-b border-emerald-500/40`.
    - Sky/Rare: `from-sky-500/25 via-sky-500/5 to-transparent` with bottom accent `border-b border-sky-500/40`.
    - Purple/Very Rare: `from-purple-500/25 via-purple-500/5 to-transparent` with bottom accent `border-b border-purple-500/40`.
    - Amber/Legendary: `from-amber-500/25 via-amber-500/5 to-transparent` with bottom accent `border-b border-amber-500/40`.
    - Rose/Artifact: `from-rose-500/25 via-rose-500/5 to-transparent` with bottom accent `border-b border-rose-500/40`.
  - Subtle rarity-tinted hover highlight and soft glow.

### C. Category-Inline Item Detail Viewer
- Move persistent viewer from the top of the entire card to **inside the active category subsection**, right under the category sub-header and above that category's items grid.
- When an item in "Magic Items" is clicked, viewer opens inside "Magic Items".
- When an item in "Spell Components" is clicked, viewer opens inside "Spell Components".
- If user switches categories, viewer smoothly animates into the new category.

### D. Search Bar
- Positioned in the toolbar / header controls above categories.
- Realtime text matching on `item.name` and `item.note`/`item.description`.
- Clear button (`X`) when text is entered.
- Shows total matching count; displays "No items matching '[search]'" empty state when filter yields zero.

### E. Smooth Viewer Animations
- Smooth height transition using CSS Grid `grid-template-rows: 0fr -> 1fr` with `transition-[grid-template-rows,opacity] duration-300 ease-out`.
- Content auto-sizes smoothly without binary bucket snaps.

## 3. Files to Touch
- `src/components/CharacterSheet/ItemsCard.jsx`: implement search state, ARC Raiders card styling, compact attunement icon, inline category viewer, and smooth transitions.
- `src/components/CharacterSheet/ItemsCard.test.jsx`: update assertions to verify compact attunement icon, search filtering, and category-inline viewer.
