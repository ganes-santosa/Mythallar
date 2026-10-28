import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';

export default function SpellNoteSection({
  note = '',
  spellName = 'spell',
  onSaveNote,
  disabled = false,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(note || '');

  useEffect(() => {
    setText(note || '');
  }, [note]);

  if (disabled) return null;

  if (isEditing) {
    return (
      <div
        className="pt-2"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-dnd-gold-light">
            Note:
          </span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a note for this spell..."
          rows={2}
          autoFocus
          className="w-full bg-dnd-panel rounded-md p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-dnd-gold transition-colors resize-none"
        />
        <div className="flex items-center justify-end space-x-1.5 mt-1">
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setText(note || '');
            }}
            className="px-2 py-0.5 rounded text-[11px] text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSaveNote?.(text.trim());
              setIsEditing(false);
            }}
            className="px-2.5 py-0.5 rounded bg-dnd-gold hover:bg-dnd-gold-light text-slate-950 font-semibold text-[11px] transition-colors"
          >
            Save Note
          </button>
        </div>
      </div>
    );
  }

  if (note && note.trim().length > 0) {
    return (
      <div
        className="pt-2 group/note"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[11px] font-semibold text-dnd-gold-light">
            Note:
          </span>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              aria-label={`Edit note for ${spellName}`}
              onClick={() => {
                setText(note);
                setIsEditing(true);
              }}
              className="text-[10px] text-slate-400 hover:text-dnd-gold p-0.5 rounded hover:bg-white/5 transition-colors"
              title="Edit note"
            >
              <Edit3 size={11} />
            </button>
            <button
              type="button"
              aria-label={`Delete note for ${spellName}`}
              onClick={() => onSaveNote?.('')}
              className="text-[10px] text-slate-400 hover:text-red-400 p-0.5 rounded hover:bg-white/5 transition-colors"
              title="Delete note"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>
        <p className="text-slate-300 text-xs whitespace-pre-wrap bg-dnd-panel/40 rounded p-1.5 border border-white/5">
          {note}
        </p>
      </div>
    );
  }

  return (
    <div
      className="pt-2 flex justify-end"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        aria-label={`Add note for ${spellName}`}
        onClick={() => {
          setText('');
          setIsEditing(true);
        }}
        className="flex items-center space-x-1 px-2 py-0.5 rounded bg-dnd-panel/70 hover:bg-dnd-panel text-slate-400 hover:text-dnd-gold text-[10px] font-medium transition-colors border border-white/5"
        title="Add a note to this spell"
      >
        <Plus size={10} />
        <span>Add Note</span>
      </button>
    </div>
  );
}
