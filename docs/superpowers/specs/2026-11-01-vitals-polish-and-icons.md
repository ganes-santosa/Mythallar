# Vitals Card Visual Polish & Icon Refinement Design

## Summary
Fine-tune the VitalsCard visual hierarchy and component behaviors based on usability and styling requirements:
1. **HP Hover Highlight**: Add responsive hover feedback (`hover:border-white/20 hover:bg-dnd-panel/90`, `hover:text-dnd-gold` on Current HP input, `hover:text-blue-200` on Temp HP input).
2. **Current / Max Single-Line Spacing**: Render Current HP input auto-sized to content (`style={{ width: `${Math.max(1, String(currentHpDraft).length)}ch` }}`) with a consistent flex gap around the `/` separator and static Max HP, so the spacing between numbers and slash remains uniform regardless of digit count (1, 2, or 3 digits).
3. **Damage / Heal Group**:
   - Uniform typography: `text-[10px] font-bold` for Damage button, amount input, and Heal button.
   - Replace placeholder `"Amt"` with `"0"`.
4. **AC & Initiative Color**:
   - Change AC value from `text-dnd-gold` to white (`text-slate-100`).
   - Change Initiative modifier value from `text-dnd-gold` to white (`text-slate-100`).
5. **AC Note Function**:
   - Make the edit button visible at all times (not hidden behind hover) with an edit icon and title, matching the persistent accessibility of `SpellNoteSection`.
6. **Inspiration Icon**:
   - Replace `Sparkles` icon with `Lightbulb` icon to avoid visual collision with spell slot tracker icons.

## Approaches Considered
- **Width sizing for HP input**: Auto-width with `ch` units vs fixed grid. Auto-width using `ch` keeps `/` and numbers contiguous on one natural reading line without jarring gaps.
- **Inspiration icon**: `Lightbulb` vs `Star`. `Lightbulb` provides unambiguous metaphor for Inspiration distinct from magical sparkles and starred spells.
