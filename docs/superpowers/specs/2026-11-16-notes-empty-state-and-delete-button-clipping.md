# Notes Empty State & Delete Button Clipping Fix

## Intent
1. Allow characters to have zero notes without forcibly injecting an undeletable "General" note.
2. Provide a clean, plain text "No Notes" empty state in the notes list view.
3. Default new characters to have empty notes (`[]`).
4. Fix the 1px ring outline clipping on the note delete button when armed.

## Requirements
- `storage.js`: `createDefaultSheet` defaults `notes: []`.
- `normalizeNotes`:
  - If `rawNotes` is an array (even if empty `[]`), return normalized array of notes without forcing a default "General" entry.
  - If `rawNotes` is non-empty string (legacy data), migrate to single "General" note with that content.
  - If `rawNotes` is null/undefined or empty string, return empty array `[]`.
- `NotesCard.jsx`:
  - When all notes are deleted, update notes to `[]`, set active note to null, and return to list view.
  - When `normalizedNotes.length === 0`: render plain text "No Notes" centered label in list view.
  - When search is active and yields no matches: retain `No notes match "${searchQuery}"`.
  - Delete button clipping: provide necessary padding / margins (`p-1 -m-1` on header toolbar and `p-1` around armed ring elements) so `overflow-hidden` does not clip the armed red ring (`ring-1 ring-red-500/60`).
