# Mythallar Visual Design & Component Guidelines

Established: October 31, 2026  
Status: Active Standard for Left & Right Panes

## 1. Core Visual Principles
1. **Symmetric Consistency**: The left pane (Character Sheet & Grimoire) and right pane (Character Header, Spell Slot Tracker, Spellbook) share identical panel containers, accordion mechanics, typography, and icon treatment.
2. **Capitalization Hierarchy (Title Case Standard)**:
   - **Section Titles & Accordion Headers**: Strictly use Title Case (e.g. *Combat Stats*, *Spell Slots*, *Ability Scores & Saving Throws*).
   - **Internal Card Labels, Fields, Trackers & Controls**: Strictly use Title Case (e.g. *Hit Points*, *Hit Dice*, *Death Saves*, *Max HP Buff*, *Base Max*, *Temp HP*, *Damage*, *Heal*, *Passive Perception*, *Defenses & Resistances*, *+ Add Condition*, *+ Add Defense*).
   - **Game Initialisms & Units**: Standard 5e system acronyms remain uppercase (HP, AC, DEX, STR, CON, INT, WIS, CHA, ft).
   - **Anti-ALL-CAPS Rule**: Never use CSS `uppercase` or all-caps strings (`HIT POINTS`, `INIT`, `SPEED`) for section headings, card tags, tracker labels, or buttons inside cards.
3. **No Redundant Nesting (Anti-Box-in-Box)**: The outer accordion container (`bg-dnd-panel`) serves as the framing card. Child content must not duplicate outer borders, excessive padding, or re-declare section title headers inside the card.
4. **Gold Accent Iconography**: Primary category icons use `text-dnd-gold` with hover scaling for subtle tactile feedback.

---

## 2. Accordion Container Specification (`AccordionSection`)

Every modular collapsible section adheres to the standard established by `src/components/Common/AccordionSection.jsx`:

### Container Styles
- **Background**: `bg-dnd-panel` (`#202227` base theme, dynamic CSS variable).
- **Border**: `border border-white/5` with `shadow-sm` and `rounded-lg`.
- **Padding**: `p-2.5`.
- **Spacing**: `space-y-2.5` or `mb-2.5` between adjacent accordion panels.

### Header Interaction & Layout
- **Container**: `flex items-center justify-between gap-2`.
- **Header Button**: `<button type="button" className="flex items-center space-x-1.5 text-left group focus:outline-none">`
  - **Category Icon**: 14px Lucide icon (`size={14}`) in `text-dnd-gold group-hover:scale-110 transition-transform flex-shrink-0`.
  - **Title Text**: `<h3 className="text-xs font-semibold text-slate-200 group-hover:text-dnd-gold-light transition-colors">{title}</h3>`
  - **Chevron**: `<ChevronDown size={13} className={`text-slate-400 group-hover:text-slate-200 transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} />`
  - **Optional Badges**: Rendered inline directly beside the chevron (e.g. `Proficiency +3`, `Attuned 2/3`).
  - **Optional Actions**: Placed in the right-aligned actions slot (`flex items-center space-x-2`).

### Transition Animation
CSS Grid Template Rows for buttery-smooth expand/collapse without JS height measurement:
```jsx
<div
  className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${
    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
  }`}
>
  <div className="overflow-hidden">
    <div className="pt-2">{children}</div>
  </div>
</div>
```

---

## 3. Left-Pane Section Hierarchy & Icon Mapping

| Section Title | Icon | Badge / Summary | Purpose |
|---|---|---|---|
| **Character** | `UserRound` | `Proficiency +{pb}` | Portrait, Name, Class, Level, Species, Subclass, Background |
| **Combat Stats** | `Heart` | None | HP, Temp HP, AC + note drawer, Hit dice, Defenses, Death saves, Exhaustion |
| **Ability Scores & Saving Throws**| `Zap` | `Proficiency +{pb} (Level {lvl})` | 6 Ability Scores, Modifiers, Saving Throw proficiencies |
| **Skills & Senses** | `Eye` | Search input | 18 Skills (3-state dot), Passive Perception/Investigation/Insight, Senses |
| **Proficiencies & Training** | `Award` | None | Armor, Weapons, Tools, Languages tag management |
| **Features & Tracked Resources** | `Sparkles` | Short/Long Rest reset buttons | Counter bars with reset buttons & custom notes |
| **Items & Inventory** | `Package` | `Attuned: X / Y` | Attunement toggles, Magic items, Consumables, Equipment |

---

## 4. UI Controls & Interactive Patterns

1. **Destructive Actions**: Use `useTwoClickConfirm` hook. Armed state keeps text and icon unchanged; turns red/green with ring indicator.
2. **Search Inputs**: Compact rounded inputs (`px-2 py-0.5 text-[11px] bg-black/20 border border-white/5 text-slate-300 placeholder-slate-500 focus:outline-none focus:border-dnd-gold/40`).
3. **Scrollable Panes**: All scroll containers containing highlighted or ringed elements must include padding on all sides (`p-1`) to avoid clipping glow effects.
