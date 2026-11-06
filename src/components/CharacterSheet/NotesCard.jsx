import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, Trash2, ChevronLeft, Search, Pin } from 'lucide-react';
import useTwoClickConfirm from '../../hooks/useTwoClickConfirm';

/**
 * Normalizes legacy string notes or empty arrays into structured note objects.
 * Prunes empty 'New Note' artifacts that have no content or custom title.
 */
export function normalizeNotes(rawNotes) {
  const now = new Date().toISOString();
  if (Array.isArray(rawNotes)) {
    const cleaned = rawNotes.filter((n) => {
      const hasContent = typeof n?.content === 'string' && n.content.trim().length > 0;
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
  const [viewMode, setViewMode] = useState('editor'); // 'editor' | 'list'
  const [searchQuery, setSearchQuery] = useState('');

  // Prune any legacy empty clutter notes from storage on load
  useEffect(() => {
    if (Array.isArray(notes) && notes.length > normalizedNotes.length) {
      onUpdateNotes?.(normalizedNotes);
    }
  }, []);

  const activeNote = (pendingNote && pendingNote.id === activeNoteId)
    ? pendingNote
    : normalizedNotes.find((n) => n.id === activeNoteId) || normalizedNotes[0];

  const textareaRef = useRef(null);

  // Auto-resize document canvas body
  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    if (el.value) {
      el.style.height = `${Math.min(Math.max(el.scrollHeight, 140), 500)}px`;
    }
  };

  useEffect(() => {
    if (viewMode === 'editor') {
      adjustHeight();
    }
  }, [activeNote?.content, activeNote?.id, viewMode]);

  const handleSelectNote = (id) => {
    setPendingNote(null);
    setActiveNoteId(id);
    setViewMode('editor');
  };

  const handleAddNote = () => {
    const newId = `note_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newNote = {
      id: newId,
      title: '',
      content: '',
      updatedAt: new Date().toISOString(),
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
      const hasContent = activeNote.content.trim().length > 0;
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
      const hasContent = updatedPending.content.trim().length > 0;
      const hasTitle = updatedPending.title.trim().length > 0;

      if (hasContent || hasTitle) {
        // Save note now that user entered text
        const updated = [...normalizedNotes, updatedPending];
        setPendingNote(null);
        onUpdateNotes?.(updated);
      } else {
        setPendingNote(updatedPending);
      }
    } else {
      const updated = normalizedNotes.map((n) =>
        n.id === activeNote.id ? { ...n, [field]: value, updatedAt: now } : n
      );
      onUpdateNotes?.(updated);
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

  const filteredAndSortedNotes = useMemo(() => {
    const filtered = searchQuery.trim()
      ? normalizedNotes.filter((n) => {
          const q = searchQuery.toLowerCase();
          return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
        })
      : normalizedNotes;

    // Pinned notes sort to the top; maintain relative order within each tier
    return [...filtered].sort((a, b) => {
      const aPinned = Boolean(a.pinned);
      const bPinned = Boolean(b.pinned);
      if (aPinned === bPinned) return 0;
      return aPinned ? -1 : 1;
    });
  }, [normalizedNotes, searchQuery]);

  // List View (All Notes overview)
  if (viewMode === 'list') {
    return (
      <div className="w-full rounded-xl bg-dnd-card shadow-sm p-3 space-y-2.5">
        {/* Navigation & Search Bar Container */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              aria-label="Search notes"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-6 pr-2.5 py-0.5 rounded-lg bg-dnd-panel/60 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={handleAddNote}
            aria-label="New Note"
            className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-dnd-card hover:bg-dnd-hover text-dnd-gold hover:text-dnd-gold-light text-xs transition-colors shrink-0"
          >
            <Plus size={11} />
            <span className="text-[11px]">New Note</span>
          </button>
        </div>

        {/* Notes Grid / Stack */}
        <div className="space-y-1.5 max-h-[420px] overflow-y-auto custom-scroll p-0.5">
          {filteredAndSortedNotes.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 bg-dnd-panel/60 rounded-lg shadow-sm">
              No notes match &ldquo;{searchQuery}&rdquo;
            </div>
          ) : (
            filteredAndSortedNotes.map((note) => {
              const snippet = note.content ? note.content.replace(/\n+/g, ' ') : 'No additional text';
              const isPinned = Boolean(note.pinned);
              return (
                <div
                  key={note.id}
                  onClick={() => handleSelectNote(note.id)}
                  role="button"
                  tabIndex={0}
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
    );
  }

  // Document Canvas View (Editor)
  return (
    <div className="w-full rounded-xl bg-dnd-card shadow-sm p-3 space-y-2.5">
      {/* 1. Header Toolbar */}
      <div className="flex items-center justify-between gap-2 text-xs pb-0.5">
        <button
          type="button"
          onClick={handleBackToList}
          aria-label="All Notes"
          className="flex items-center gap-1 px-2 py-1 -ml-1 rounded-md text-slate-300 hover:text-dnd-gold hover:bg-dnd-hover transition-colors font-medium"
        >
          <ChevronLeft size={14} />
          <span>All Notes ({normalizedNotes.length})</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => handleTogglePin(activeNote.id, e)}
            aria-label={activeNote.pinned ? `Unpin note ${activeNote.title || 'Note'}` : `Pin note ${activeNote.title || 'Note'}`}
            title={activeNote.pinned ? 'Unpin note' : 'Pin note to top'}
            className={`p-1.5 rounded-md transition-colors ${
              activeNote.pinned
                ? 'text-dnd-gold hover:text-dnd-gold-light'
                : 'text-slate-400 hover:text-slate-200 hover:bg-dnd-hover'
            }`}
          >
            <Pin size={13} className={activeNote.pinned ? 'fill-dnd-gold rotate-45' : ''} />
          </button>

          <NoteDeleteButton
            title={activeNote.title || 'Untitled'}
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
          value={activeNote.title || ''}
          onChange={(e) => handleUpdateActiveField('title', e.target.value)}
          placeholder="Note Title"
          className="w-full bg-transparent text-sm font-bold text-dnd-ivory placeholder-slate-500 focus:outline-none transition-colors"
        />
        {activeNote.pinned && (
          <Pin size={12} className="text-dnd-gold fill-dnd-gold shrink-0 rotate-45 mr-0.5" />
        )}
      </div>

      {/* 3. Note Content Body Container (Dark Inset bg-dnd-panel/60) */}
      <div className="w-full p-3 rounded-lg bg-dnd-panel/60 shadow-sm space-y-2">
        <textarea
          ref={textareaRef}
          id="note-content"
          aria-label="Note Content"
          rows={6}
          value={activeNote.content || ''}
          onChange={(e) => {
            handleUpdateActiveField('content', e.target.value);
            adjustHeight();
          }}
          onInput={adjustHeight}
          placeholder="Start writing campaign notes, quest logs, NPC details, reminders, or session recaps..."
          style={{ fieldSizing: 'content' }}
          className="w-full bg-transparent text-xs text-slate-200 leading-relaxed placeholder-slate-500 focus:outline-none custom-scroll resize-none min-h-[140px] max-h-[500px] overflow-y-auto"
        />

        {/* Content Footer Status */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            <span>Auto-saved to cloud</span>
          </span>
          <span className="text-slate-400">
            {activeNote.updatedAt ? new Date(activeNote.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
