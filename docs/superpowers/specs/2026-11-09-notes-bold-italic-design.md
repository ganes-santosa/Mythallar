# Design Doc: Bold & Italic Rich Notes Support

## Intent
Enable players to write, format (bold and italic), and paste bold/italic rich text into character notes without breaking existing plain-text notes, search, or storage serialization.

## Goals
- Allow bold (`Ctrl+B` / `Cmd+B` or formatting button) and italic (`Ctrl+I` / `Cmd+I` or formatting button) formatting in the active note editor.
- Preserve bold and italic styles when pasting rich text from external sources (websites, Word, Discord, markdown-copied text).
- Strip out unsafe tags, styling garbage, scripts, or intrusive layout markup on paste (keep only semantic formatting: `<b>`, `<strong>`, `<i>`, `<em>`, `<u>`, `<br>`, `<p>`, `<div>`).
- Backward compatibility: existing notes stored as plain text render seamlessly without alteration.
- Search compatibility: note search across notes (`n.content.toLowerCase().includes(q)`) and list snippet display continue to match text contents without matching raw HTML tags.
- Full offline + Supabase JSON sync compatibility: `note.content` remains a string.

## Non-Goals
- Full WYSIWYG suite (no tables, embedded images, font colors, heading blocks, blockquotes).
- External heavy dependencies like Quill, TipTap, Slate, or Draft.js (violates zero unnecessary dependencies constraint).

## Approach Selected
**Clean Native `contentEditable` with Sanitized HTML paste & plain-text fallback.**
- Replace `<textarea id="note-content">` in `NotesCard.jsx` with a styled `contentEditable` div.
- Provide a compact, borderless formatting toolbar above/in the note editor with bold (`B`) and italic (`I`) toggle buttons using `document.execCommand('bold')` and `document.execCommand('italic')` (or modern `Selection` range formatting) and native browser keyboard shortcuts.
- On paste (`onPaste`): inspect `clipboardData`. If `text/html` is available, parse into a DOM tree, sanitize to keep only bold (`strong`, `b`), italic (`em`, `i`), line breaks (`br`, block tags), and strip all external attributes (`style`, `class`, `href`, `script`). If only plain text is pasted, paste as text.
- Synchronize inner HTML changes to `activeNote.content`.
- When searching or displaying snippets, strip HTML tags via lightweight regex/DOM parser (`content.replace(/<[^>]*>/g, '')`) so search matches readable words.

## Edge Cases Handled
1. Plain-text notes loaded from storage: safely injected or parsed with line breaks preserved.
2. Pasting arbitrary HTML with inline styles (`<span style="font-weight: bold">`): normalize to standard bold tags.
3. Empty content representation: empty strings or single `<br>` normalized to avoid ghost content triggering empty-note retention checks.
