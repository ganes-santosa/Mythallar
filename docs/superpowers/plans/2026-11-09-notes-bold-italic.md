# Bold & Italic Notes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable bold and italic formatting, keyboard shortcuts, formatting buttons, and rich paste sanitization for character notes.

**Architecture:** Replace plain textarea with a contentEditable rich editor container in `NotesCard.jsx`. Add a pure sanitizer helper `sanitizeRichNoteHtml` to strip dangerous or messy markup while preserving `<b>`, `<strong>`, `<i>`, `<em>`, and line breaks. Strip tags for search and snippet display.

**Tech Stack:** React 18, Tailwind CSS, DOMParser, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-09-notes-bold-italic-design.md`

## Global Constraints
- Zero new external dependencies.
- Follow "Minimal Nested Elements & Zero Outlines Rule": no outline borders on toolbar or inputs.
- Keep `note.content` as a string for JSON/Supabase compatibility.
- Existing plain-text notes must continue to display properly.
- All 43 test suites must remain green.

## Review Focus
1. Pasting formatted HTML from Word/Google Docs with CSS inline styles (`font-weight: 700` or `font-style: italic`): converts to semantic bold/italic tags.
2. XSS safety: `<script>` tags, event handlers (`onerror`), or `javascript:` links in pasted content are strictly stripped.
3. Empty note handling: empty `contentEditable` (e.g. `<br>` or `<div><br></div>`) counts as empty string so notes with no content prune properly.
4. Search snippet: note search and list view ignore HTML tags when querying and previewing notes.
5. Plain text notes with newlines: loaded properly into editor without tag corruption.

---

### Task 1: Rich Note HTML Sanitizer and Text Extractor

**Files:**
- Create: `src/utils/richNoteUtils.js`
- Test: `src/utils/richNoteUtils.test.js`

**Interfaces:**
- Produces:
  - `sanitizeRichNoteHtml(html: string) -> string`
  - `extractPlainTextFromHtml(html: string) -> string`
  - `isNoteContentEmpty(htmlOrText: string) -> boolean`

- [ ] **Step 1: Write failing tests in `src/utils/richNoteUtils.test.js`**
- [ ] **Step 2: Run test to verify it fails (`npm.cmd test -- src/utils/richNoteUtils.test.js --run`)**
- [ ] **Step 3: Implement `sanitizeRichNoteHtml`, `extractPlainTextFromHtml`, and `isNoteContentEmpty` in `src/utils/richNoteUtils.js`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 2: Integrate Rich Editor, Toolbar, and Sanitized Paste into `NotesCard`

**Files:**
- Modify: `src/components/CharacterSheet/NotesCard.jsx`
- Modify: `src/components/CharacterSheet/NotesCard.test.jsx`

**Interfaces:**
- Consumes: `sanitizeRichNoteHtml`, `extractPlainTextFromHtml`, `isNoteContentEmpty` from `src/utils/richNoteUtils.js`

- [ ] **Step 1: Write failing test in `src/components/CharacterSheet/NotesCard.test.jsx` asserting bold/italic formatting, paste behavior, and search without HTML interference**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement contentEditable editor, Bold/Italic toolbar controls, sanitized onPaste handler, and tag-stripped search/preview in `NotesCard.jsx`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Run full test suite (`npm.cmd test -- --run`) and production build (`npm.cmd run build`)**
- [ ] **Step 6: Commit**
