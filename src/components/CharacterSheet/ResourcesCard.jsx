import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, X, RotateCcw, Award, GripVertical } from 'lucide-react';

export default function ResourcesCard({
  trackedResources = [],
  featuresNotes = '',
  feats = [],
  isEditing = false,
  isAdding: externalIsAdding,
  onSetIsAdding,
  hideHeaderActions = false,
  onUpdateResources,
  onUpdateNotes,
  onUpdateFeats,
}) {
  const [internalIsAdding, setInternalIsAdding] = useState(false);
  const isAdding = externalIsAdding !== undefined ? externalIsAdding : internalIsAdding;
  const setIsAdding = onSetIsAdding || setInternalIsAdding;
  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceMax, setNewResourceMax] = useState('3');
  const [newResourceReset, setNewResourceReset] = useState('LR');
  const [newResourceNote, setNewResourceNote] = useState('');
  const [nameError, setNameError] = useState(false);

  const [draggedResId, setDraggedResId] = useState(null);
  const [dragOverResId, setDragOverResId] = useState(null);

  const [isAddingFeat, setIsAddingFeat] = useState(false);
  const [newFeat, setNewFeat] = useState('');

  const textareaRef = useRef(null);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    if (el.value) {
      el.style.height = `${Math.min(el.scrollHeight, 215)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [featuresNotes]);

  const handleAddFeat = (e) => {
    e.preventDefault();
    const trimmed = newFeat.trim();
    if (!trimmed) return;
    if (!feats.includes(trimmed)) {
      onUpdateFeats?.([...feats, trimmed]);
    }
    setNewFeat('');
    setIsAddingFeat(false);
  };

  const handleRemoveFeat = (featToRemove) => {
    onUpdateFeats?.(feats.filter((f) => f !== featToRemove));
  };

  const handleStep = (id, delta) => {
    const updated = (trackedResources || []).map((res) => {
      if (res.id !== id) return res;
      const next = Math.max(0, Math.min(res.max ?? 999, (res.current ?? 0) + delta));
      return { ...res, current: next };
    });
    onUpdateResources?.(updated);
  };

  const handleResetAll = () => {
    const updated = (trackedResources || []).map((res) => ({
      ...res,
      current: res.max ?? 0,
    }));
    onUpdateResources?.(updated);
  };

  const handleSaveResource = (e) => {
    e.preventDefault();
    if (!newResourceName.trim()) {
      setNameError(true);
      return;
    }

    const maxVal = Math.max(1, Number(newResourceMax) || 1);
    const newRes = {
      id: `res_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: newResourceName.trim(),
      max: maxVal,
      current: maxVal,
      resetOn: newResourceReset,
      note: newResourceNote.trim(),
    };

    onUpdateResources?.([...(trackedResources || []), newRes]);
    setNewResourceName('');
    setNewResourceMax('3');
    setNewResourceReset('LR');
    setNewResourceNote('');
    setNameError(false);
    setIsAdding(false);
  };

  const handleDeleteResource = (id) => {
    const filtered = (trackedResources || []).filter((r) => r.id !== id);
    onUpdateResources?.(filtered);
  };

  const handleDragStart = (e, id) => {
    if (!isEditing) return;
    setDraggedResId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e, id) => {
    if (!isEditing || !draggedResId || draggedResId === id) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverResId !== id) {
      setDragOverResId(id);
    }
  };

  const handleDragLeave = (_e, id) => {
    if (dragOverResId === id) {
      setDragOverResId(null);
    }
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!isEditing || !draggedResId || draggedResId === targetId) {
      setDraggedResId(null);
      setDragOverResId(null);
      return;
    }

    const currentList = [...(trackedResources || [])];
    const fromIndex = currentList.findIndex((r) => r.id === draggedResId);
    const toIndex = currentList.findIndex((r) => r.id === targetId);

    if (fromIndex !== -1 && toIndex !== -1) {
      const [moved] = currentList.splice(fromIndex, 1);
      currentList.splice(toIndex, 0, moved);
      onUpdateResources?.(currentList);
    }

    setDraggedResId(null);
    setDragOverResId(null);
  };

  const handleDragEnd = () => {
    setDraggedResId(null);
    setDragOverResId(null);
  };

  return (
    <div className="space-y-2">
      {/* Header action bar (fallback when not mounted in AccordionSection) */}
      {!hideHeaderActions && (
        <div className="flex items-center justify-end pb-1 border-b border-white/5 text-xs">
          <div className="flex items-center space-x-2">
            {trackedResources && trackedResources.length > 0 && (
              <button
                type="button"
                onClick={handleResetAll}
                aria-label="Reset all resources"
                title="Reset all resources to max"
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center space-x-1"
              >
                <RotateCcw size={11} />
                <span>Reset</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsAdding(!isAdding)}
              className="text-[11px] text-dnd-gold hover:text-dnd-gold-light font-medium"
            >
              + Add Tracked Resource
            </button>
          </div>
        </div>
      )}

      {/* Add resource inline drawer */}
      {isAdding && (
        <form
          noValidate
          onSubmit={handleSaveResource}
          className="p-2.5 rounded-lg bg-dnd-card space-y-2 text-xs shadow-sm ring-1 ring-dnd-gold/30"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-dnd-gold text-[11px]">New Tracked Resource</span>
            <button
              type="button"
              onClick={() => {
                setNameError(false);
                setIsAdding(false);
              }}
              className="text-slate-400 hover:text-white"
            >
              <X size={13} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label htmlFor="res-name" className="block text-[10px] text-slate-400">
                  Resource Name
                </label>
                {nameError && (
                  <span className="text-[9px] text-red-400 font-semibold">Name required</span>
                )}
              </div>
              <input
                id="res-name"
                aria-label="Resource Name"
                type="text"
                placeholder="e.g. Chronal Shift"
                value={newResourceName}
                onChange={(e) => {
                  setNewResourceName(e.target.value);
                  if (nameError) setNameError(false);
                }}
                className={`w-full px-2 py-1 rounded bg-dnd-panel/70 text-slate-200 text-xs focus:outline-none transition-colors ${
                  nameError
                    ? 'border border-red-500/60 ring-1 ring-red-500/40'
                    : 'focus:ring-1 focus:ring-white/20'
                }`}
              />
            </div>
            <div>
              <label htmlFor="res-max" className="block text-[10px] text-slate-400 mb-0.5">
                Max Uses
              </label>
              <input
                id="res-max"
                aria-label="Max Uses"
                type="number"
                min="1"
                value={newResourceMax}
                onChange={(e) => setNewResourceMax(e.target.value)}
                className="w-full px-2 py-1 rounded bg-dnd-panel/70 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-white/20"
              />
            </div>
            <div>
              <label htmlFor="res-reset" className="block text-[10px] text-slate-400 mb-0.5">
                Reset Timing
              </label>
              <select
                id="res-reset"
                aria-label="Reset Timing"
                value={newResourceReset}
                onChange={(e) => setNewResourceReset(e.target.value)}
                className="w-full px-2 py-1 rounded bg-dnd-panel/70 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-white/20"
              >
                <option value="LR">Long Rest</option>
                <option value="SR">Short Rest</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-2.5 py-1 rounded bg-dnd-panel/70 text-slate-300 text-xs hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded bg-dnd-gold text-slate-950 font-bold hover:bg-dnd-gold-light text-xs"
            >
              Save Resource
            </button>
          </div>
        </form>
      )}

      {/* Steppers Grid */}
      {trackedResources && trackedResources.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-2 text-xs">
          {trackedResources.map((res) => {
            const isDraggingThis = draggedResId === res.id;
            const isOverThis = dragOverResId === res.id;

            return (
              <div
                key={res.id}
                data-testid="tracked-resource-item"
                draggable={isEditing}
                onDragStart={(e) => handleDragStart(e, res.id)}
                onDragOver={(e) => handleDragOver(e, res.id)}
                onDragLeave={(e) => handleDragLeave(e, res.id)}
                onDrop={(e) => handleDrop(e, res.id)}
                onDragEnd={handleDragEnd}
                className={`bg-dnd-card p-2 rounded-lg flex items-center justify-between group shadow-sm transition-all duration-150 ${
                  isEditing ? 'cursor-grab active:cursor-grabbing' : ''
                } ${isDraggingThis ? 'opacity-40 scale-95' : ''} ${
                  isOverThis ? 'ring-1 ring-dnd-gold shadow-md' : ''
                }`}
              >
                <div className="flex items-center min-w-0 pr-1 flex-1">
                  {isEditing && (
                    <div
                      data-testid="resource-drag-handle"
                      className="text-slate-500 group-hover:text-slate-300 mr-1.5 flex-shrink-0"
                    >
                      <GripVertical size={13} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold text-slate-200 truncate">{res.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {res.resetOn ? `Recovers @ ${res.resetOn}` : ''}
                    </div>
                  </div>
                </div>
                <div
                  className="flex items-center space-x-1 text-xs bg-dnd-panel/70 px-1.5 py-0.5 rounded-md flex-shrink-0"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    aria-label={`Decrement ${res.name}`}
                    onClick={() => handleStep(res.id, -1)}
                    className="px-1 font-bold text-dnd-gold hover:text-white"
                  >
                    -
                  </button>
                  <span className="min-w-[34px] text-center tabular-nums">
                    <span className="font-bold text-slate-100">{res.current ?? 0}</span>
                    <span className="font-medium text-dnd-pewter"> / {res.max ?? 0}</span>
                  </span>
                  <button
                    type="button"
                    aria-label={`Increment ${res.name}`}
                    onClick={() => handleStep(res.id, 1)}
                    className="px-1 font-bold text-dnd-gold hover:text-white"
                  >
                    +
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      aria-label={`Delete ${res.name}`}
                      title="Remove resource"
                      onClick={() => handleDeleteResource(res.id)}
                      className="text-slate-500 hover:text-red-400 pl-1 ml-0.5 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Freeform Notes Box */}
      <div className="space-y-1">
        <label htmlFor="features-notes" className="text-[10px] text-slate-400">
          Features & Freeform Notes:
        </label>
        <textarea
          ref={textareaRef}
          id="features-notes"
          aria-label="Features & Notes"
          placeholder="Type or paste features, special items, math notes (e.g. Blackstones: 49 + 162 + 28), death ward status, etc..."
          value={featuresNotes || ''}
          onChange={(e) => {
            onUpdateNotes?.(e.target.value);
            adjustHeight();
          }}
          onInput={adjustHeight}
          rows={2}
          style={{ fieldSizing: 'content' }}
          className="w-full p-2.5 rounded-lg bg-dnd-card text-xs text-slate-200 leading-relaxed placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-white/20 custom-scroll resize-none min-h-[59px] max-h-[215px] overflow-y-auto shadow-sm"
        />
      </div>

      {/* Feats Subdivision (matching Conditions and Resistance & Immunities) */}
      <div className="pt-1.5 border-t border-white/5 space-y-1">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Award size={10} className="text-amber-400" /> Feats:
          </span>
          <button
            type="button"
            onClick={() => setIsAddingFeat(!isAddingFeat)}
            className="text-dnd-gold hover:text-dnd-gold-light cursor-pointer"
          >
            + Add
          </button>
        </div>

        {isAddingFeat && (
          <form noValidate onSubmit={handleAddFeat} className="flex items-center space-x-1.5 pt-1 px-0.5">
            <input
              type="text"
              autoFocus
              placeholder="e.g. War Caster, Alert, Fey Touched"
              value={newFeat}
              onChange={(e) => setNewFeat(e.target.value)}
              className="flex-1 px-2.5 py-1 rounded-lg bg-dnd-card border border-white/20 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 shadow-inner"
            />
            <button
              type="submit"
              className="px-2.5 py-1 rounded-lg bg-dnd-gold text-slate-950 font-bold text-xs hover:bg-dnd-gold-light transition-colors shadow-sm cursor-pointer"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingFeat(false);
                setNewFeat('');
              }}
              className="px-2 py-1 rounded-lg bg-dnd-card text-slate-400 text-xs hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </form>
        )}

        <div className="flex flex-wrap items-center gap-1 min-h-[20px]">
          {(!feats || feats.length === 0) && !isAddingFeat && (
            <span className="text-[11px] text-slate-500 italic">No feats recorded.</span>
          )}
          {(feats || []).map((feat) => (
            <span
              key={feat}
              className="group inline-flex items-center px-2 py-0.5 rounded-lg bg-dnd-card text-[11px] text-slate-300 shadow-sm"
            >
              <span>{feat}</span>
              {isEditing && (
                <button
                  type="button"
                  aria-label={`Remove feat ${feat}`}
                  onClick={() => handleRemoveFeat(feat)}
                  className="ml-1 text-slate-500 hover:text-red-400 opacity-60 hover:opacity-100 cursor-pointer"
                >
                  <X size={9} />
                </button>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
