# Vitals HP Sub-Containers & Always-Interactive Inputs Design

## Intent & Rationale
Refine the Hero Hit Points card layout to match standard D&D Beyond readability and visual hierarchy:
1. Group Current & Max HP into a unified sub-container chip (`bg-dnd-panel/60 rounded-md`).
2. Group Temp HP into a separate sub-container chip with the same chip styling.
3. Eliminate stray vertical divider lines.
4. Place the slash `/` directly between the numbers on the number row (`[Current] / [Max]`).
5. Labels (`Current`, `Max`, `Temp`) align cleanly above their respective values.
6. Make Current HP and Temp HP always-interactive inline inputs (transparent, borderless, matching typography, auto-select on focus, commit on change/blur, clamp `>= 0`).
7. Keep Max HP static in normal view.

## Visual Structure

```
[ Hit Points (heart icon) ]                  [ Buff Tag (+5 Buff) ]

+-------------------------+   +--------------+
| Current     Max         |   | Temp         |
| [ 10 ]   /   18         |   | [  0 ]       |
+-------------------------+   +--------------+
(sub-container 1)              (sub-container 2)
[====== Mini Health Bar (Current + Temp) ======]
```

- **Sub-container 1 (Current & Max)**:
  - Class: `bg-dnd-panel/60 border border-white/5 rounded-md px-2.5 py-1 flex flex-col justify-between`
  - Top header: labels `Current` and `Max` positioned over their values.
  - Value row:
    - `Current`: borderless numeric input (`text-2xl font-black text-slate-100 bg-transparent text-center focus:outline-none focus:ring-1 focus:ring-dnd-gold/50 rounded`), auto-selects on focus, commits on change/blur, clamps `>= 0`.
    - Divider: `/` positioned between Current and Max on the number line (`text-base text-slate-600 font-bold`).
    - `Max`: static text (`text-lg font-bold text-slate-400 text-center`).
- **Sub-container 2 (Temp HP)**:
  - Class: `bg-dnd-panel/60 border border-white/5 rounded-md px-2.5 py-1 flex flex-col justify-between items-center`
  - Top header: label `Temp` (`text-blue-400 font-semibold text-[8px]`).
  - Value row:
    - `Temp`: borderless numeric input (`text-lg font-bold text-blue-300 bg-transparent text-center focus:outline-none focus:ring-1 focus:ring-blue-400/50 rounded`), displays `0` when zero, auto-selects on focus, commits on change/blur, clamps `>= 0`.
- **Mini Health Bar**: Remains positioned below the chips spanning the width.

## Approaches Considered
1. **Approach A (Selected)**: Dual sub-container chips (`bg-dnd-panel/60`) for [Current / Max] and [Temp], with always-interactive inputs.
   - Clean grouping, eliminates stray dividers, identical to class level chip language.
2. **Approach B**: Single continuous card without sub-containers, using whitespace gap.
   - Lacks visual separation between base HP and temporary HP.
3. **Approach C**: Three separate chips for Current, Max, and Temp.
   - Fractures Current and Max which conceptually belong together as a fraction (`Current / Max`).

## Decision
Approach A selected.
