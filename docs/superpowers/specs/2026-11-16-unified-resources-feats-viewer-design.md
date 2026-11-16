# Unified Resources & Feats Viewer with Tag Chips Design

**Goal:** Unify the Tracked Resources viewer and Feats viewer into a single top-level viewer drawer, swap vertical order so Feats precede Freeform Notes, and style Feats as clean flex-wrap tag chips.

## Motivation & User Problem
Currently in `ResourcesCard`:
1. Active feats (like *Lucky*) create a tracked resource at the top and a feat card at the bottom. Clicking either opened two separate, redundant detail viewer panes in two different places on screen.
2. Feats were rendered in a rigid 2/3-column card grid, which felt bulky compared to lightweight tag chips.
3. Freeform notes sat above Feats, pushing Feats down below a large multiline textarea.

## Architecture & Layout Changes

### 1. Vertical Section Reordering
Inside `ResourcesCard.jsx`:
- **Top**: Header action bar (`Reset` all resources, `+ Add Tracked Resource`)
- **Add Resource Drawer**: When `isAdding` is true
- **Unified Detail Viewer**: Single shared drawer for inspecting any Tracked Resource or Feat
- **Tracked Resources Grid**: Resource steppers with drag-reorder and gradient glow
- **Feats Subdivision**:
  - Header: `Feats:` with `Award` icon and `+ Add` button
  - `FeatForm` (Add / In-place Edit): Expands right above the Feats tag chips
  - Feats Tag Chips: `flex flex-wrap gap-1.5` lightweight badges
- **Bottom**: Freeform Notes textarea (`featuresNotes`) with stepped auto-resizing

### 2. Single Unified Detail Viewer
- Replaces duplicate `FeatDetailViewer` and `ResourceDetailViewer` with one unified viewer drawer (`UnifiedDetailViewer` or consolidated `ResourceDetailViewer`).
- Clicking a Tracked Resource:
  - If standalone resource: shows name, current/max, reset timing, description/notes, Edit, Delete.
  - If linked to a feat: displays feat stat badge (e.g. `+1 DEX`), feat type line/source, current/max, reset timing, full description.
- Clicking a Feat Chip:
  - If active/linked (e.g. *Lucky*): opens the exact same viewer entry as the tracked resource card. Shows name, counters (`3 / 3`), reset timing, stat badge, notes/description. Both entry points activate the exact same viewer state.
  - If passive (e.g. *Tough*, *Alert*): opens in the top viewer drawer with feat name, stat badge, full notes/description, Edit, and Delete.
- Single open contract: opening any resource or feat viewer immediately switches to that item in the single top viewer drawer.
- Two-click confirm delete inside viewer works consistently whether deleting a resource or a feat.

### 3. Feats Tag Chips Styling
- `flex flex-wrap gap-1.5` layout (natural wrapping, minimal vertical footprint).
- Visual hierarchy:
  - Small `Award` icon (`text-amber-400`).
  - Feat name in semibold text.
  - Stat badge pill (`+1 STAT` in gold highlight) if an ASI is selected.
  - Subtle `Link2` icon if the feat has a linked tracked resource.
  - Highlight ring (`ring-1 ring-dnd-gold` or subtle brightness) when the feat is active in the viewer.
  - Clean hover state without layout shift.

### 4. Feat Form Placement
- Clicking `+ Add` or Edit Feat expands `FeatForm` right above the tag chips.
- Editing an active feat updates both the feat and its linked tracked resource.
- Deleting a feat cleans up its linked tracked resource.
