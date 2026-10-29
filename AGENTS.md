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
  4. `git commit -m "release: vX.Y.Z - summary"`, `git tag vX.Y.Z`, `git push origin master --tags` (append `[skip netlify]` if not deploying to production).
- Never move or force-push a published tag. If something is wrong, ship the next patch.

## Handoff & Netlify credits
- Every push to `master` without `[skip netlify]` costs 15 Netlify credits (free plan: 300/month).
- Commit locally as often as needed. Push to `master` only for a release or a cross-machine handoff.
- When user says **"wrap up for handoff"** (or before any commit/push):
  1. Update `HANDOFF.md` (~25 lines max: current state, next up, open questions; do not duplicate `git log`).
  2. Stage intended files explicitly (including `HANDOFF.md`). Never use `git add -A`.
  3. If pushing only to switch machines (not deploying), append `[skip netlify]` to the commit message and `git push origin master`.
