# Class Card Icons Design

## Problem
In the Character Builder Step 3 ("Choose your class"), class cards currently only display text (class name and Hit Die). Visual distinction and tactile quality would be significantly enhanced with iconic D&D 5e class symbols.

## Requirements
1. Import 13 official D&D 5e class SVG icons from `D:\Ganes\Workshop\Coding\Mythallar Dump\D&D 5e Icons`:
   - Artificer, Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard.
2. Icons must support dynamic theme coloring using `fill="currentColor"`.
3. Provide a reusable `ClassIcon` component (`src/components/Common/ClassIcon.jsx`):
   - Accepts `name` (case-insensitive string, e.g. "Wizard", "wizard"), `size` (default 20), and standard SVG attributes (`className`, `aria-hidden`, etc.).
   - Graceful fallback for unknown or missing class names.
4. Integrate `ClassIcon` in:
   - **Class Selection Card Grid**: Left icon badge (e.g., `w-9 h-9` or `w-8 h-8` container with soft contrasting background, e.g., `bg-dnd-card` or `bg-white/5`, displaying `ClassIcon` in `text-dnd-gold` when selected or `text-slate-300 group-hover:text-slate-100` when unselected).
   - **Class Detail Viewer Header**: Larger badge (`w-9 h-9`, 22px icon) alongside class title, Hit Die, and saving throws.

## Approaches Considered
- **Approach 1: Left Icon Badge (Selected)**:
  - Square icon container on the left of each class card, name & Hit Die on the right.
  - Aligns with `CreateCharacterModal` option cards and standard design system.
  - Preserves compact grid layout across mobile and desktop.
- **Approach 2: Centered Large Icon**:
  - Icon centered on top of class name.
  - Makes cards much taller and forces excess vertical scrolling.

## Architecture
- `src/components/Common/ClassIcon.jsx`:
  - Contains SVG path definitions with `viewBox="0 0 100 100"` and `fill="currentColor"`.
- `src/components/CharacterBuilder/CharacterBuilderModal.jsx`:
  - Imports `ClassIcon` and renders it inside class grid button cards and Class Detail Viewer header.
