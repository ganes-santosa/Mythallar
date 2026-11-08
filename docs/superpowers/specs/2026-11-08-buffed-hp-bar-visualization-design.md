# Design: Buffed Max HP Bar Line Visualization

## Context & Intent
In the Combat Stats Hit Points widget, buffed Max HP (`hpMaxBuff > 0`) is displayed numerically in gold (`text-amber-400`), but the mini health bar below only showed standard green current HP and blue temp HP against a generic panel background without distinguishing the buffed portion of maximum health capacity.

## Requirements & Goals
- Visually represent the buffed maximum HP capacity directly on the mini health bar when `hpMaxBuff > 0`.
- Display a base maximum boundary notch at the threshold between `baseMax` and the buffed extension.
- Display a subtle amber-tinted buff capacity zone (`bg-amber-400/20`) for the extended capacity above `baseMax`.
- Current HP fill segments:
  - Base Current HP (up to `baseMax`): `bg-emerald-500`.
  - Buffed Current HP (portion of `hpCurrent` exceeding `baseMax`): `bg-amber-400`.
  - Temp HP: `bg-blue-400`.
- Retain existing behavior when `hpMaxBuff <= 0` (single `bg-emerald-500` current bar and `bg-blue-400` temp bar).

## Mathematical Specification
When `hpMaxBuff > 0` and `effectiveMax > 0`:
- `basePercent = Math.min(100, Math.max(0, (baseMax / effectiveMax) * 100))`
- `baseHpCurrentPercent = Math.min(basePercent, Math.max(0, (Math.min(hpCurrent, baseMax) / effectiveMax) * 100))`
- `buffedHpCurrentPercent = Math.min(100 - baseHpCurrentPercent, Math.max(0, (Math.max(0, hpCurrent - baseMax) / effectiveMax) * 100))`
- `tempPercent = Math.min(100 - (baseHpCurrentPercent + buffedHpCurrentPercent), Math.max(0, (hpTemp / effectiveMax) * 100))`

When `hpMaxBuff <= 0`:
- Unchanged existing calculation:
  - `currentPercent = Math.min(100, Math.max(0, (hpCurrent / effectiveMax) * 100))`
  - `tempPercent = Math.min(100 - currentPercent, Math.max(0, (hpTemp / effectiveMax) * 100))`

## Visual Structure
- Health bar container: `relative bg-dnd-panel h-1.5 rounded-full overflow-hidden mt-1 border border-white/5 flex`
- Buff track background (rendered when `hpMaxBuff > 0`):
  - Absolutely positioned or flex right section from `basePercent` to 100% with `bg-amber-400/20`.
- Base Max notch marker:
  - Vertical notch line positioned at `left: ${basePercent}%` with `absolute top-0 bottom-0 w-[1.5px] bg-amber-400/70 z-10 pointer-events-none`.
- Progress segments (flex children, `h-full transition-all duration-200`):
  - Base current: `bg-emerald-500` with width `baseHpCurrentPercent%`
  - Buffed current: `bg-amber-400` with width `buffedHpCurrentPercent%` (when `hpMaxBuff > 0`)
  - Temp: `bg-blue-400` with width `tempPercent%`

## Out of Scope
- Drained Max HP line animations or interactive hover scrubbing on the health bar.
