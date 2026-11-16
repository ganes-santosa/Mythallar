# Character Features Accordion Restructure Design

## Intent & Why
In the character sheet, features and feats often grant or interact with tracked resources (e.g., the *Lucky* feat grants 3 Luck points). Reading top-down, users expect to see the feature or feat first, and then the mechanical resource derived from it. Aligning this accordion structure with `Items & Inventory` establishes a consistent visual pattern across the character sheet:
`Items & Inventory` -> Currency (compact tracker) -> Category groups -> Item details.
`Character Features` -> Unified detail drawer (top) -> Feats (chips) -> Tracked Resources (stepper cards) -> Freeform Notes (textarea).

Additionally, opening or closing the top detail drawer can cause content below it to jump. Attaching the existing `useAutoScrollOnExpand` hook to the viewer drawer smoothly anchors the scroll parent during animation.

## Goals
1. Rename accordion from `Features & Tracked Resources` to `Character Features` in `CharacterSheetView.jsx` and `ResourcesCard.jsx`.
2. Restructure subdivisions inside `ResourcesCard.jsx` to follow the sequence:
   - **Top Viewer Drawer**: Single unified drawer for viewing active feat or tracked resource.
   - **Feats Subdivision**: Header with `Feats` (left) + `+ Add` (right). When adding/editing, form expands above chips. Tag chips rendered in `flex flex-wrap gap-1.5`.
   - **Tracked Resources Subdivision**: Header with `Tracked Resources` (left) + `Reset` and `+ Add` (right). When adding/editing, form expands above cards. Stepper cards rendered in grid.
   - **Notes Subdivision**: Header with `Features & Freeform Notes` (or `Notes`). Auto-resizing textarea.
3. Attach `useAutoScrollOnExpand` to the unified detail viewer drawer so opening and closing does not cause jarring viewport displacement.
4. Keep all test suites green and maintain zero outline borders rule (`shadow-sm`, contrast).

## Non-Goals & Anti-Goals
- **Non-Goals**: Moving tracked resource steppers inside feat chips (chips remain compact tags; resources remain distinct stepper cards).
- **Anti-Goals**: Breaking backward compatibility of saved character data (`trackedResources`, `featuresNotes`, `feats`).
- **Anti-Goals**: Introducing outline borders (`border-white/*`, etc.) on child cards/inputs.

## Constraints
- Standard 5e initialisms (HP, AC, LR, SR, INT, WIS, etc.) uppercase; headers and buttons Title Case.
- Hooks cannot run inside `.map()`; keep hooks before early returns.
- CRLF line endings.

## Approaches Considered & Chosen

### Approach 1: Contextual inline viewers per section (like ItemsCard)
- *Pros*: Viewer opens directly adjacent to the clicked item (under feats or under resources).
- *Cons*: Two separate drawer locations; shifts items differently; linked feats like Lucky would split viewer context between sections.

### Approach 2: Top shared drawer with `useAutoScrollOnExpand` (Chosen)
- *Pros*: Clean, predictable top drawer at the head of `Character Features`. Linked items (e.g. clicking Lucky feat chip or Lucky resource card) highlight both and present the unified drawer at the top without jumping thanks to `useAutoScrollOnExpand`.
- *Cons*: Clicking an item further down the card opens the drawer at the top (mitigated by auto-scroll).

## Detailed Layout Specification

```
[ Character Features Accordion Header ]
  │
  ├── [ Unified Detail Viewer Drawer (when an item is selected) ] (with auto-scroll ref)
  │
  ├── [ Feats Subdivision ]
  │     ├── Header: "Feats" + "+ Add" button
  │     ├── [ FeatForm ] (when adding or editing feat)
  │     └── [ Feat Tag Chips ] (flex flex-wrap gap-1.5)
  │
  ├── [ Tracked Resources Subdivision ]
  │     ├── Header: "Tracked Resources" + "Reset" + "+ Add Tracked Resource" buttons
  │     ├── [ ResourceAddForm / ResourceEditForm ] (when adding or editing resource)
  │     └── [ Tracked Resources Grid ] (grid cols with steppers)
  │
  └── [ Freeform Notes Subdivision ]
        ├── Header / Label: "Features & Freeform Notes"
        └── [ Textarea ] (auto-resizing content bucket)
```

## Builder Checklist & Test Gates
1. Update `CharacterSheetView.jsx` accordion title and tests to `Character Features`.
2. Update `ResourcesCard.jsx` structure:
   - Viewer at top with `viewerRef = useAutoScrollOnExpand(...)`.
   - Feats section first with `Feats` header + `+ Add`.
   - Tracked Resources section second with `Tracked Resources` header + `Reset` + `+ Add`.
   - Freeform Notes section third.
3. Update tests in `ResourcesCard.test.jsx`, `CharacterSheetView.test.jsx`, `App.test.jsx`.
4. Verify all tests pass, build succeeds, and manual visual check passes.
