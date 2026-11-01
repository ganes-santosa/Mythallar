# Click-to-Edit Current HP & Temp HP Specification

**Goal:** Allow players to edit Current HP and Temp HP directly in the normal hero card view via click-to-edit, while keeping Max HP editable only in the section editing state.

## Context & Rationale
In combat, players frequently take ad-hoc damage, heal, or gain temporary hit points that might bypass the quick Treatment A capsule (or require direct manual override). Entering section edit mode just to tweak current HP or temp HP adds unnecessary friction. Max HP, representing character build attributes (base max + buffs), remains protected and configured in the editing state.

## Requirements
1. **Current HP Click-to-Edit**:
   - In normal view (`!isEditing`), clicking the Current HP value (24px text) opens an inline number input.
   - Input auto-focuses with current value selected.
   - Blurring or pressing Enter commits the value and returns to text display.
   - Pressing Escape cancels editing and restores previous value.
   - Clamped to minimum 0.
2. **Temp HP Click-to-Edit**:
   - In normal view (`!isEditing`), clicking the Temp HP value (18px text) opens an inline number input.
   - Input auto-focuses with current value selected.
   - Blurring or pressing Enter commits the value and returns to text display.
   - Pressing Escape cancels editing and restores previous value.
   - Clamped to minimum 0.
3. **Max HP Display**:
   - Max HP remains static display (`{effectiveMax}`) in the normal view.
   - Editable only when section is in editing mode (`isEditing`).
4. **Visual Treatment (Approach 2)**:
   - Hover state on editable values: subtle cursor pointer and light highlight/ring or hover outline indicating it is interactive.
   - Input styles match surrounding typography seamlessly without expanding the card or causing layout shifts.
5. **Testing**:
   - Unit tests verify clicking Current HP and Temp HP shows inputs, updates values on blur/Enter, and cancels on Escape.
