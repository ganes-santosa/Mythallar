# Empty State Import Character Design

## Intent & Why
When users start with no characters in storage (either new install, cleared local storage, or all profiles deleted), the right-hand panel currently presents only a "Create First Character" call-to-action. Users with existing exported JSON character sheets cannot import their characters from this screen without first creating a placeholder character. Providing an "Import Character" action alongside "Create First Character" enables immediate restoration/onboarding from JSON backup files.

## Goals
- Allow users to import an existing character JSON file directly from the "No Character Selected" empty state.
- Keep layout clean and minimal with "Create First Character" as primary action and "Import Character" as secondary ghost/slate action.
- Reuse existing JSON character validation and profile registration (`validateAndImportCharacterJSON` and `handleImport`).

## Non-Goals
- Changing the character sheet empty state on the left pane.
- Redesigning the character creation modal.

## Design
1. **Action Controls in Empty State (`src/App.jsx`)**:
   - Wrap actions in a flex container (`flex items-center gap-3`).
   - Primary button: `Create First Character` (`bg-dnd-gold hover:bg-dnd-gold-light text-slate-950 font-bold text-xs px-4 py-2 rounded-xl shadow-lg transition-all`).
   - Secondary button: `Import Character` (`bg-dnd-card hover:bg-slate-800 text-slate-300 hover:text-slate-100 font-semibold text-xs px-4 py-2 rounded-xl transition-all border border-white/5 flex items-center space-x-2`).
   - Icon: `Upload` (15px) from `lucide-react`.
   - Hidden `<input type="file" accept=".json,application/json" />` referenced via ref.
2. **Behavior**:
   - On clicking "Import Character", triggers file picker.
   - On file selection, reads file as text using `FileReader`.
   - Invokes `handleImport(jsonText)`.
   - Clears file input value so re-importing the same file works if needed.
