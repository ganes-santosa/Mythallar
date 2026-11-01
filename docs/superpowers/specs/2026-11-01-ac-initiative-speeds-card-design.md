# Design Spec: Combined AC & Initiative + Dedicated Speeds Card

**Date:** 2026-11-01  
**Status:** Draft for Review  

## Intent & Why
In the Combat Stats accordion (Row 1 of the Character Sheet), Armor Class and Initiative currently sit in separate containers (or paired with Speed). Combining AC and Initiative into a single vertical stacked card frees up a full card slot for all official 5e movement modes (Walking, Climbing, Swimming, Flying, Burrowing), eliminating cramped layouts and giving characters with special movement speeds clear visibility.

## Goals
1. **Row 1 Layout (`VitalsCard.jsx`)**:
   - 3-card grid: `[Hit Points Hero]` | `[AC & Initiative]` | `[Movement Speeds]`.
   - Grid proportions balanced for desktop (`lg:grid-cols-[12fr_5fr_7fr]` or similar ~50% / ~21% / ~29%).
2. **Card 2: AC & Initiative**:
   - **Top Section (AC)**: Shield icon with Title Case "AC", "+ Note" / edit note trigger, large hero AC value in `text-slate-100`, formula breakdown subtitle.
   - **Bottom Section (Initiative)**: Divider or pill containing Zap icon, "Initiative" label, and calculated modifier with override capability.
3. **Card 3: Dedicated Movement Speeds**:
   - **Left Column**: Hero Walking Speed (e.g. `30 ft` in large font, `Walking` subtitle). Always present as base speed.
   - **Right Column (Optional Speeds & Add Button)**:
     - Header or action bar has `+ Speed` / `+ Add` button.
     - Clicking `+ Speed` opens inline selector for available 5e modes (`Climbing`, `Swimming`, `Flying`, `Burrowing`) with distance input (ft).
     - Active added speeds list vertically on the right with remove (`x`) button.
     - When no special speeds added, shows subtle empty state or prompt (`+ Add Speed`).
   - **Edit Mode / Inline**: Allows editing Walking speed and managing added movement types.
4. **Data & Storage Backward-Compatibility**:
   - Support legacy `vitals.speed: 30` (number) by treating as `{ walk: 30 }`.
   - Support expanded `vitals.speeds = { walk: 30, fly: 60, ... }` (only configured speeds stored, or object map).
   - Zero-migration fallback in `storage.js` and `VitalsCard.jsx`.

## Non-Goals
- Adding non-standard or homebrew movement modes (stick to official 5e core speeds: walk, climb, swim, fly, burrow).
- Modal popups for editing (use inline editing matching existing edit toggle).

## Approaches Considered
- **Approach 1 (Chosen)**: Hero Walking speed on left, active-only secondary speeds listed on right. Cleanest for 95% of characters that only have walking speed or 1 special speed.
- **Approach 2 (Fixed Table)**: Always show all 5 speeds with `—` when 0. Rejected: excessive visual noise for characters without special speeds.
- **Approach 3 (Tag Chips)**: Arbitrary tag chips with text add form. Rejected: 5e speeds are a fixed set of mechanical rules, not freeform tags.
