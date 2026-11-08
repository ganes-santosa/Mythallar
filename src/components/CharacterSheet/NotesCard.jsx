import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  ChevronLeft,
  ChevronDown,
  Search,
  Pin,
  ArrowDownWideNarrow,
  ArrowUp,
  ArrowDown,
  Bold,
  Italic,
  Underline,
  Strikethrough,
} from 'lucide-react';
import useTwoClickConfirm from '../../hooks/useTwoClickConfirm';
import useClickOutside from '../../hooks/useClickOutside';
import {
  sanitizeRichNoteHtml,
  extractPlainTextFromHtml,
  isNoteContentEmpty,
} from '../../utils/richNoteUtils';

const SORT_MODES = [
  { id: 'recent', label: 'Recent' },
  { id: 'date', label: 'Date' },
  { id: 'alpha', label: 'Alphabetical' },
];

/**
 * Normalizes legacy string notes or empty arrays into structured note objects.
 * Prunes empty 'New Note' artifacts that have no content or custom title.
 */
export function normalizeNotes(rawNotes) {
  const now = new Date().toISOString();
  if (Array.isArray(rawNotes)) {
    const cleaned = rawNotes.filter((n) => {
      const hasContent = !isNoteContentEmpty(n?.content);
      const titleTrim = typeof n?.title === 'string' ? n.title.trim() : '';
      const isClutter = (titleTrim === 'New Note' || titleTrim === '') && !hasContent;
      return !isClutter;
    });

    const targetList = cleaned.length > 0 ? cleaned : rawNotes;
    if (targetList.length === 0) {
      return [{ id: 'note_default', title: 'General', content: '', updatedAt: now, pinned: false }];
    }
    return targetList.map((n, i) => ({
      id: n?.id || `note_${i}_${Date.now()}`,
      title: typeof n?.title === 'string' ? n.title : '',
      content: typeof n?.content === 'string' ? n.content : '',
      ...(n?.createdAt ? { createdAt: n.createdAt } : {}),
      updatedAt: n?.updatedAt || now,
      pinned: Boolean(n?.pinned),
    }));
  }
  if (typeof rawNotes === 'string' && rawNotes.trim().length > 0) {
    return [{ id: 'note_default', title: 'General', content: rawNotes, updatedAt: now, pinned: false }];
  }
  return [{ id: 'note_default', title: 'General', content: '', updatedAt: now, pinned: false }];
}

function NoteDeleteButton({ title, onDelete }) {
  const { armed, handleClick } = useTwoClickConfirm(onDelete);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={armed ? `Click again to delete ${title}` : `Delete note ${title}`}
      title={armed ? `Click again to delete ${title}` : `Delete note ${title}`}
      className={`p-1.5 rounded-md transition-colors ${
        armed
          ? 'text-red-500 bg-red-950/70 ring-1 ring-red-500/60'
          : 'text-slate-400 hover:text-red-400 hover:bg-dnd-hover'
      }`}
    >
      <Trash2 size={13} />
    </button>
  );
}

/**
 * Phone-style notes app with dark inset containers for title and notes body,
 * pin-to-top feature, and zero empty-note clutter saving.
 */
export default function NotesCard({
  notes = [],
  onUpdateNotes,
}) {
  const normalizedNotes = normalizeNotes(notes);
  const [activeNoteId, setActiveNoteId] = useState(() => normalizedNotes[0]?.id || 'note_default');
  const [pendingNote, setPendingNote] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'editor'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'date' | 'alpha'
  const [sortDir, setSortDir] = useState('desc'); // 'desc' | 'asc'
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const sortMenuRef = useRef(null);
  useClickOutside(sortMenuRef, () => setIsSortMenuOpen(false), isSortMenuOpen);

  // Prune any legacy empty clutter notes from storage on load
  useEffect(() => {
    if (Array.isArray(notes) && notes.length > normalizedNotes.length) {
      onUpdateNotes?.(normalizedNotes);
    }
  }, []);

  const activeNote = (pendingNote && pendingNote.id === activeNoteId)
    ? pendingNote
    : normalizedNotes.find((n) => n.id === activeNoteId) || normalizedNotes[0];

  const editorRef = useRef(null);
  const cardRef = useRef(null);
  const listScrollRef = useRef(null);
  const savedSheetScrollTopRef = useRef(null);
  const savedListScrollTopRef = useRef(0);
  const lastLoadedNoteIdRef = useRef(null);

  const captureScrollPositions = () => {
    if (savedSheetScrollTopRef.current === null) {
      if (listScrollRef.current) {
        savedListScrollTopRef.current = listScrollRef.current.scrollTop;
      }
      const parentScroller = cardRef.current?.closest('.overflow-y-auto');
      if (parentScroller) {
        savedSheetScrollTopRef.current = parentScroller.scrollTop;
      }
    }
  };

  useLayoutEffect(() => {
    if (viewMode === 'list') {
      if (listScrollRef.current) {
        listScrollRef.current.scrollTop = savedListScrollTopRef.current;
      }
      if (savedSheetScrollTopRef.current !== null) {
        const parentScroller = cardRef.current?.closest('.overflow-y-auto');
        if (parentScroller) {
          parentScroller.scrollTop = savedSheetScrollTopRef.current;
        }
        savedSheetScrollTopRef.current = null;
      }
    } else if (viewMode === 'editor') {
      // Find parent scroll container and Notes section container
      const parentScroller = cardRef.current?.closest('.overflow-y-auto');
      const accordionSection = cardRef.current?.closest('.bg-dnd-panel') || cardRef.current;
      if (parentScroller && accordionSection) {
        // Calculate offsetTop of Notes accordion relative to parentScroller
        const parentRect = parentScroller.getBoundingClientRect();
        const accordionRect = accordionSection.getBoundingClientRect();
        const targetScroll = parentScroller.scrollTop + (accordionRect.top - parentRect.top);

        // Defer scroll to next animation frame so DOM layout/height updates before scrolling
        requestAnimationFrame(() => {
          if (typeof parentScroller.scrollTo === 'function') {
            parentScroller.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
          } else {
            parentScroller.scrollTop = Math.max(0, targetScroll);
          }
        });
      }
    }
  }, [viewMode]);

  useEffect(() => {
    if (viewMode === 'editor' && editorRef.current) {
      // Only re-populate innerHTML when switching to a different note ID or entering editor
      if (lastLoadedNoteIdRef.current !== activeNote?.id) {
        lastLoadedNoteIdRef.current = activeNote?.id;
        editorRef.current.innerHTML = activeNote?.content || '';
      }
    } else {
      lastLoadedNoteIdRef.current = null;
    }
  }, [activeNote?.id, viewMode]);

  // ponytail: When switching between List and Editor, both views are rendered simultaneously inside
  // two grid-rows CSS transitions (300ms). When exiting, the editor row collapses from 1fr to 0fr
  // while the list row expands from 0fr to 1fr, providing a smooth animated height change.
  const handleSelectNote = (id) => {
    captureScrollPositions();
    setPendingNote(null);
    setActiveNoteId(id);
    setViewMode('editor');
  };

  const handleAddNote = () => {
    captureScrollPositions();
    const now = new Date().toISOString();
    const newId = `note_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newNote = {
      id: newId,
      title: '',
      content: '',
      createdAt: now,
      updatedAt: now,
      pinned: false,
    };
    // Kept in pending state in memory; not saved until user inputs content or title
    setPendingNote(newNote);
    setActiveNoteId(newId);
    setViewMode('editor');
  };

  const handleBackToList = () => {
    if (pendingNote) {
      // Discard un-entered pending note
      setPendingNote(null);
      setActiveNoteId(normalizedNotes[0]?.id || 'note_default');
    } else if (activeNote) {
      // If user cleared out an existing note completely (no title AND no content), prune it on exit
      const hasContent = !isNoteContentEmpty(activeNote.content);
      const hasTitle = activeNote.title.trim().length > 0;
      if (!hasContent && !hasTitle && normalizedNotes.length > 1) {
        const remaining = normalizedNotes.filter((n) => n.id !== activeNote.id);
        onUpdateNotes?.(remaining);
        setActiveNoteId(remaining[0]?.id || 'note_default');
      }
    }
    setViewMode('list');
  };

  const handleUpdateActiveField = (field, value) => {
    const now = new Date().toISOString();
    if (pendingNote && pendingNote.id === activeNote.id) {
      const updatedPending = { ...pendingNote, [field]: value, updatedAt: now };
      const hasContent = !isNoteContentEmpty(updatedPending.content);
      const hasTitle = updatedPending.title.trim().length > 0;

      if (hasContent || hasTitle) {
        // Save new note at the top now that user entered text
        const updated = [updatedPending, ...normalizedNotes];
        setPendingNote(null);
        onUpdateNotes?.(updated);
      } else {
        setPendingNote(updatedPending);
      }
    } else {
      const editedNote = { ...activeNote, [field]: value, updatedAt: now };
      const updated = [
        editedNote,
        ...normalizedNotes.filter((n) => n.id !== activeNote.id),
      ];
      onUpdateNotes?.(updated);
    }
  };

  const applyFormat = (command) => {
    // Preserve selection range within editor
    let range = null;
    if (typeof window !== 'undefined' && window.getSelection) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        range = sel.getRangeAt(0);
      }
    }

    if (editorRef.current) {
      editorRef.current.focus({ preventScroll: true });
    }

    if (range && typeof window !== 'undefined' && window.getSelection) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }

    if (typeof document !== 'undefined' && typeof document.execCommand === 'function') {
      document.execCommand(command, false, null);
      if (editorRef.current) {
        handleUpdateActiveField('content', editorRef.current.innerHTML);
      }
    }
  };

  const handlePasteContent = (e) => {
    e.preventDefault();
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    const html = clipboardData.getData('text/html');
    const text = clipboardData.getData('text/plain');

    if (html) {
      const sanitized = sanitizeRichNoteHtml(html);
      if (typeof document !== 'undefined' && typeof document.execCommand === 'function') {
        document.execCommand('insertHTML', false, sanitized);
      } else if (editorRef.current) {
        editorRef.current.innerHTML += sanitized;
      }
    } else if (text) {
      if (typeof document !== 'undefined' && typeof document.execCommand === 'function') {
        document.execCommand('insertText', false, text);
      } else if (editorRef.current) {
        editorRef.current.innerText += text;
      }
    }

    if (editorRef.current) {
      handleUpdateActiveField('content', editorRef.current.innerHTML);
    }
  };

  const handleTogglePin = (id, e) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    if (pendingNote && pendingNote.id === id) {
      setPendingNote({ ...pendingNote, pinned: !pendingNote.pinned });
      return;
    }
    const updated = normalizedNotes.map((n) =>
      n.id === id ? { ...n, pinned: !n.pinned } : n
    );
    onUpdateNotes?.(updated);
  };

  const handleDeleteActive = () => {
    if (pendingNote && pendingNote.id === activeNote.id) {
      setPendingNote(null);
      setActiveNoteId(normalizedNotes[0]?.id || 'note_default');
      return;
    }
    const remaining = normalizedNotes.filter((n) => n.id !== activeNote.id);
    const nextNotes = remaining.length > 0
      ? remaining
      : [{ id: `note_${Date.now()}`, title: 'General', content: '', updatedAt: new Date().toISOString(), pinned: false }];
    setActiveNoteId(nextNotes[0].id);
    onUpdateNotes?.(nextNotes);
  };

  const handleSelectSortBy = (nextMode) => {
    setSortBy(nextMode);
    setIsSortMenuOpen(false);
  };

  const currentSortLabel = SORT_MODES.find((m) => m.id === sortBy)?.label || 'Recent';

  const filteredAndSortedNotes = useMemo(() => {
    const filtered = searchQuery.trim()
      ? normalizedNotes.filter((n) => {
          const q = searchQuery.toLowerCase();
          const cleanTitle = (n.title || '').toLowerCase();
          const cleanContent = extractPlainTextFromHtml(n.content || '').toLowerCase();
          return cleanTitle.includes(q) || cleanContent.includes(q);
        })
      : normalizedNotes;

    // Pinned notes sort to the top; sort within each tier by selected mode & direction
    return [...filtered].sort((a, b) => {
      const aPinned = Boolean(a.pinned);
      const bPinned = Boolean(b.pinned);
      if (aPinned !== bPinned) return aPinned ? -1 : 1;

      if (sortBy === 'alpha') {
        const aTitle = (a.title || 'Untitled Note').toLowerCase();
        const bTitle = (b.title || 'Untitled Note').toLowerCase();
        const cmp = aTitle.localeCompare(bTitle);
        return sortDir === 'desc' ? cmp : -cmp;
      }

      if (sortBy === 'date') {
        const aTime = new Date(a.createdAt || a.updatedAt || 0).getTime() || 0;
        const bTime = new Date(b.createdAt || b.updatedAt || 0).getTime() || 0;
        if (aTime !== bTime) {
          return sortDir === 'desc' ? bTime - aTime : aTime - bTime;
        }
        return 0;
      }

      // 'recent': most recently edited/made first when desc
      const aTime = new Date(a.updatedAt || 0).getTime() || 0;
      const bTime = new Date(b.updatedAt || 0).getTime() || 0;
      if (aTime !== bTime) {
        return sortDir === 'desc' ? bTime - aTime : aTime - bTime;
      }
      return 0;
    });
  }, [normalizedNotes, searchQuery, sortBy, sortDir]);

  return (
    <div ref={cardRef} className="w-full rounded-xl bg-dnd-card shadow-sm p-3">
      {/* List View */}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
          viewMode === 'list' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
        }`}
      >
        <div className="overflow-hidden space-y-2.5">
          {/* Navigation, Sort & Search Bar Container */}
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1 min-w-0">
              <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                aria-label="Search notes"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                tabIndex={viewMode === 'list' ? 0 : -1}
                className="w-full pl-6 pr-2.5 py-0.5 rounded-lg bg-dnd-panel/60 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors"
              />
            </div>

            {/* Left Button: Sort Direction (ArrowDown = desc, ArrowUp = asc) */}
            <button
              type="button"
              onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
              aria-label={`Toggle sort direction (${sortDir === 'desc' ? 'Descending' : 'Ascending'})`}
              title={sortDir === 'desc' ? 'Sorting Top to Bottom (click for Bottom to Top)' : 'Sorting Bottom to Top (click for Top to Bottom)'}
              tabIndex={viewMode === 'list' ? 0 : -1}
              className="flex items-center justify-center p-1.5 rounded-lg bg-dnd-panel/60 hover:bg-dnd-hover text-slate-300 hover:text-dnd-gold transition-colors shrink-0 cursor-pointer"
            >
              {sortDir === 'desc' ? <ArrowDown size={13} /> : <ArrowUp size={13} />}
            </button>

            {/* Right Button: Sort By Dropdown with ArrowDownWideNarrow icon */}
            <div className="relative shrink-0" ref={sortMenuRef}>
              <button
                type="button"
                onClick={() => setIsSortMenuOpen((prev) => !prev)}
                aria-label="Sort By"
                title={`Sort By: ${currentSortLabel}`}
                tabIndex={viewMode === 'list' ? 0 : -1}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-dnd-panel/60 hover:bg-dnd-hover text-slate-300 hover:text-dnd-ivory text-[11px] font-medium transition-colors cursor-pointer"
              >
                <ArrowDownWideNarrow size={11} className="text-dnd-gold shrink-0" />
                <span className="text-slate-200">Sort By</span>
                <ChevronDown size={10} className={`text-slate-400 transition-transform ${isSortMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSortMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 py-1 rounded-lg bg-dnd-card shadow-lg z-30 min-w-[120px]">
                  {SORT_MODES.map((mode) => {
                    const isSelected = sortBy === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        aria-label={`Sort by ${mode.label}`}
                        onClick={() => handleSelectSortBy(mode.id)}
                        className={`w-full text-left px-3 py-1.5 text-[11px] font-medium transition-colors cursor-pointer ${
                          isSelected
                            ? 'text-dnd-gold font-bold bg-dnd-panel/60'
                            : 'text-slate-300 hover:text-dnd-ivory hover:bg-dnd-hover'
                        }`}
                      >
                        {mode.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddNote}
              aria-label="New Note"
              tabIndex={viewMode === 'list' ? 0 : -1}
              className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-dnd-panel/60 hover:bg-dnd-hover text-dnd-gold hover:text-dnd-gold-light text-xs transition-colors shrink-0 cursor-pointer"
            >
              <Plus size={11} />
              <span className="text-[11px]">New Note</span>
            </button>
          </div>

          {/* Notes Grid / Stack */}
          <div ref={listScrollRef} className="space-y-1.5 max-h-[420px] overflow-y-auto custom-scroll -m-0.5 p-0.5">
            {filteredAndSortedNotes.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 bg-dnd-panel/60 rounded-lg shadow-sm">
                No notes match &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              filteredAndSortedNotes.map((note) => {
                const plain = extractPlainTextFromHtml(note.content || '');
                const snippet = plain ? plain.replace(/\n+/g, ' ') : 'No additional text';
                const isPinned = Boolean(note.pinned);
                return (
                  <div
                    key={note.id}
                    onClick={() => handleSelectNote(note.id)}
                    role="button"
                    tabIndex={viewMode === 'list' ? 0 : -1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectNote(note.id);
                      }
                    }}
                    className="w-full text-left p-3 rounded-lg transition-colors shadow-sm block bg-dnd-panel/60 hover:bg-dnd-panel/90 cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-xs font-semibold text-dnd-ivory truncate min-w-0">
                        {note.title || 'Untitled Note'}
                      </h4>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-slate-400">
                          {note.updatedAt ? new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleTogglePin(note.id, e)}
                          aria-label={isPinned ? `Unpin note ${note.title}` : `Pin note ${note.title}`}
                          title={isPinned ? 'Unpin note' : 'Pin note to top'}
                          tabIndex={viewMode === 'list' ? 0 : -1}
                          className={`p-1 rounded transition-colors ${
                            isPinned
                              ? 'text-dnd-gold hover:text-dnd-gold-light'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <Pin size={12} className={isPinned ? 'fill-dnd-gold rotate-45' : ''} />
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {snippet}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Document Canvas View (Editor) */}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
          viewMode === 'editor' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
        }`}
      >
        <div className="overflow-hidden space-y-2.5">
          {/* 1. Header Toolbar */}
          <div className="flex items-center justify-between gap-2 text-xs pb-0.5">
            <button
              type="button"
              onClick={handleBackToList}
              aria-label="All Notes"
              tabIndex={viewMode === 'editor' ? 0 : -1}
              className="flex items-center gap-1 px-2 py-1 -ml-1 rounded-md text-slate-300 hover:text-dnd-gold hover:bg-dnd-hover transition-colors font-medium"
            >
              <ChevronLeft size={14} />
              <span>All Notes ({normalizedNotes.length})</span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => handleTogglePin(activeNote?.id, e)}
                aria-label={activeNote?.pinned ? `Unpin note ${activeNote?.title || 'Note'}` : `Pin note ${activeNote?.title || 'Note'}`}
                title={activeNote?.pinned ? 'Unpin note' : 'Pin note to top'}
                tabIndex={viewMode === 'editor' ? 0 : -1}
                className={`p-1.5 rounded-md transition-colors ${
                  activeNote?.pinned
                    ? 'text-dnd-gold hover:text-dnd-gold-light'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-dnd-hover'
                }`}
              >
                <Pin size={13} className={activeNote?.pinned ? 'fill-dnd-gold rotate-45' : ''} />
              </button>

              <NoteDeleteButton
                title={activeNote?.title || 'Untitled'}
                onDelete={handleDeleteActive}
              />
            </div>
          </div>

          {/* 2. Note Title Container (Dark Inset bg-dnd-panel/60) */}
          <div className="w-full px-3 py-2 rounded-lg bg-dnd-panel/60 shadow-sm flex items-center justify-between gap-2">
            <input
              type="text"
              id="note-title"
              aria-label="Note Title"
              value={activeNote?.title || ''}
              onChange={(e) => handleUpdateActiveField('title', e.target.value)}
              placeholder="Note Title"
              tabIndex={viewMode === 'editor' ? 0 : -1}
              className="w-full bg-transparent text-sm font-bold text-dnd-ivory placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>

          {/* 3. Note Content Body Container (Dark Inset bg-dnd-panel/60) */}
          <div className="w-full p-3 rounded-lg bg-dnd-panel/60 shadow-sm space-y-2">
            {/* Formatting Toolbar */}
            <div className="flex items-center gap-1 pb-1 border-b border-white/5">
              <button
                type="button"
                aria-label="Bold"
                title="Bold (Ctrl+B)"
                tabIndex={viewMode === 'editor' ? 0 : -1}
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFormat('bold');
                }}
                className="p-1 rounded text-slate-400 hover:text-dnd-ivory hover:bg-white/5 transition-colors"
              >
                <Bold size={13} />
              </button>
              <button
                type="button"
                aria-label="Italic"
                title="Italic (Ctrl+I)"
                tabIndex={viewMode === 'editor' ? 0 : -1}
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFormat('italic');
                }}
                className="p-1 rounded text-slate-400 hover:text-dnd-ivory hover:bg-white/5 transition-colors"
              >
                <Italic size={13} />
              </button>
              <button
                type="button"
                aria-label="Underline"
                title="Underline (Ctrl+U)"
                tabIndex={viewMode === 'editor' ? 0 : -1}
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFormat('underline');
                }}
                className="p-1 rounded text-slate-400 hover:text-dnd-ivory hover:bg-white/5 transition-colors"
              >
                <Underline size={13} />
              </button>
              <button
                type="button"
                aria-label="Strikethrough"
                title="Strikethrough"
                tabIndex={viewMode === 'editor' ? 0 : -1}
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFormat('strikeThrough');
                }}
                className="p-1 rounded text-slate-400 hover:text-dnd-ivory hover:bg-white/5 transition-colors"
              >
                <Strikethrough size={13} />
              </button>
            </div>

            {/* Rich ContentEditable Editor Canvas */}
            <div
              ref={editorRef}
              id="note-content"
              role="textbox"
              aria-label="Note Content"
              contentEditable
              draggable={false}
              tabIndex={viewMode === 'editor' ? 0 : -1}
              onDragStart={(e) => e.preventDefault()}
              suppressContentEditableWarning
              onInput={(e) => {
                const html = e.currentTarget.innerHTML ?? e.target.innerHTML;
                handleUpdateActiveField('content', html);
              }}
              onPaste={handlePasteContent}
              data-placeholder="Start writing campaign notes, quest logs, NPC details, reminders, or session recaps..."
              className="w-full bg-transparent text-xs font-light text-slate-200 leading-relaxed focus:outline-none custom-scroll min-h-[140px] max-h-[500px] overflow-y-auto whitespace-pre-wrap break-words empty:before:content-[attr(data-placeholder)] empty:before:text-slate-500 empty:before:pointer-events-none select-text"
            />

            {/* Content Footer Status */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span>Auto-saved to cloud</span>
              </span>
              <span className="text-slate-400">
                {activeNote?.updatedAt ? new Date(activeNote.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
