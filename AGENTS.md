# AGENTS.md

Mythallar: D&D 5e spellbook SPA. React 18, Vite 6, Tailwind 3, Vitest, lucide-react, Supabase (optional sync).

## Source of truth
- Live session state: `HANDOFF.md` (read at session start alongside `git status` and `git log -n 5`).
- Product scope: `docs/superpowers/specs/2026-10-25-dnd-spellbook-prd.md`
- Feature designs: `docs/superpowers/specs/`
- Implementation plans: `docs/superpowers/plans/`
- Workflow: superpowers skills (brainstorm, plan, TDD, verify).

## Commands (Windows PowerShell)
- Node may be missing from PATH: `$env:Path="C:\Program Files\nodejs;"+$env:Path`
- Test: `npm.cmd test -- --run`
- Build: `npm.cmd run build`
- PowerShell 5 has no `&&`. Use `;` or separate commands.

## Editing rules
- Use the edit/write tools for source changes. Never use PowerShell `-replace`, `.Replace()` or regex on JSX. Quote escaping (`''`) has corrupted `useState('')` before.
- Never run multiple parallel `edit` calls on the same file in one turn; combine into one `edit` or run sequentially so Vite's file watcher does not cache an intermediate state.
- Files use CRLF line endings.
- Write a failing test first, then the code. Leave the full suite green.

## UI conventions
- Destructive, confirm, or create actions use `src/hooks/useTwoClickConfirm.js`: first click arms, second click acts, resets after 3s. No popups, no inline expansion, no layout shift.
  - **Keep visible button text and icon identical when armed** (e.g. `Finish Copying` stays `Finish Copying`). Only change color/ring classes and `aria-label`/`title` (`Click again to ...`).
  - Armed delete: `text-red-500 bg-red-950/70 ring-1 ring-red-500/60`, `aria-label` `Click again to delete ...`
  - Armed confirm/create: `text-green-400 bg-green-950/70 ring-1 ring-green-400/70`, `aria-label` `Click again to ...`
- Hooks can't run inside `.map()`. Extract a child component (see `CharacterDeleteButton`).
- Hooks go before any early `return`.
- Scroll containers that hold ringed/glowing items need padding on every side (`p-1`), or the ring gets clipped.
- **Accordion Panels & Visual Guidelines**: All panel sections across both panes (Character Sheet and right pane) must follow `docs/superpowers/specs/2026-10-31-visual-guidelines.md` and use `AccordionSection` (`src/components/Common/AccordionSection.jsx`): Title Case headers (e.g. `Combat Stats`), 14px `text-dnd-gold` Lucide icons with hover scale, 13px `ChevronDown` (`-rotate-90` when closed), and CSS grid row height transitions. Never duplicate outer card containers.
- **Minimal Nested Elements & Zero Outlines Rule (MANDATORY CONVENTION)**: Sub-accordions, child cards, nested blocks, and inner inputs inside main accordion panels must **NEVER** have outline borders (`border`, `border-white/*`, etc.). Differentiate nested elements solely using background contrast (e.g. `bg-dnd-card` on `bg-dnd-panel`) and soft shadows (`shadow-sm`). Never create "boxes-in-boxes" with borders or outlines. Keep UI minimal, flat, and borderless by default across all future development.
- **Capitalization Hierarchy**: Accordion headers, dialog titles, inner card labels, stat badges, field labels, tracker text, and action buttons strictly use Title Case (e.g. `Combat Stats`, `Hit Points`, `Hit Dice`, `Death Saves`, `Max HP Buff`, `Base Max`, `Temp HP`, `Damage`, `Heal`, `Passive Perception`, `+ Add Condition`). Standard 5e initialisms (HP, AC, DEX, STR, CON, INT, WIS, CHA, ft) remain uppercase. Never use CSS `uppercase` or ALL-CAPS strings on card labels, tags, or buttons.
- **Character Initialization**: Storage defaults to empty profiles (`profiles: []`, `activeId: null`). When no character exists, the right pane displays an empty state with a "Create First Character" action prompting `CreateCharacterModal` (character name + 1st-level class). Designed for future extension into a full character builder.
- **Character Sheet Evolution**: Long-term plan expands the left pane (the spellbook view) into a full fillable character sheet. Keep left-pane state and component hierarchy flexible for this integration.

## Versioning (SemVer: MAJOR.MINOR.PATCH)
- PATCH: bug fixes, visual tweaks. MINOR: new user-facing features. MAJOR: breaking changes to saved data or exports.
- **MANDATORY**: Whenever updating version to X.Y.Z:
  1. Update `package.json` (`npm.cmd version <version> --no-git-tag-version`).
  2. Update `src/version.js` (`export const APP_VERSION = 'X.Y.Z';`) so the top-left version badge in the UI and the Settings modal update immediately in code and hot-reload in Vite.
  3. Update `HANDOFF.md` release header.
- Release sequence:
  1. Version updated in `package.json` AND `src/version.js`.
  2. Test and build pass (`npm.cmd test -- --run`, `npm.cmd run build`).
  3. Stage the intended files explicitly (including `src/version.js`, `package.json`, `HANDOFF.md`). Never use `git add -A`.
  4. `git commit -m "release: vX.Y.Z - summary [skip ci]"`, `git tag vX.Y.Z`, `git push origin master --tags` (omit `[skip ci]` or trigger deployment only when ready to ship).
- Never move or force-push a published tag. If something is wrong, ship the next patch.

## Deployment & Handoff
- Live deployment: Vercel (`https://mythallar.vercel.app/`). Single-page app routing handled by `vercel.json`.
- Commit locally as often as needed. Push to `master` for releases or cross-machine handoffs.
- Always include `[skip ci] [skip netlify]` (or `[skip vercel]` / `[skip ci]`) in commit messages when pushing routine commits or switching machines to avoid burning Vercel build minutes and Netlify credits. Only push without skip flags when deploying production releases.
- When user says **"wrap up for handoff"** (or before any commit/push):
  1. Update `HANDOFF.md` (~25 lines max: current state, next up, open questions; do not duplicate `git log`).
  2. Stage intended files explicitly (including `HANDOFF.md`). Never use `git add -A`.
  3. `git commit -m "... [skip ci] [skip netlify]"` and `git push origin master`.
