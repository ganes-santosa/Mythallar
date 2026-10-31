import React, { useState } from 'react';
import { Plus, X, RotateCcw } from 'lucide-react';

export default function ResourcesCard({
  trackedResources = [],
  featuresNotes = '',
  onUpdateResources,
  onUpdateNotes,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceMax, setNewResourceMax] = useState('3');
  const [newResourceReset, setNewResourceReset] = useState('LR');
  const [newResourceNote, setNewResourceNote] = useState('');

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
    if (!newResourceName.trim()) return;

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
    setIsAdding(false);
  };

  const handleDeleteResource = (id) => {
    const filtered = (trackedResources || []).filter((r) => r.id !== id);
    onUpdateResources?.(filtered);
  };

  return (
    <div className="rounded-lg bg-dnd-card p-3 border border-white/5 shadow-sm space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-dnd-pewter uppercase tracking-wider">
        <span>Features, Feats & Tracked Resources</span>
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

      {/* Add resource inline drawer */}
      {isAdding && (
        <form
          onSubmit={handleSaveResource}
          className="p-2.5 rounded bg-dnd-panel/95 border border-dnd-gold/30 space-y-2 text-xs"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-dnd-gold text-[11px]">New Tracked Resource</span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-white"
            >
              <X size={13} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label htmlFor="res-name" className="block text-[10px] text-slate-400 mb-0.5">
                Resource Name
              </label>
              <input
                id="res-name"
                aria-label="Resource Name"
                type="text"
                placeholder="e.g. Chronal Shift"
                value={newResourceName}
                onChange={(e) => setNewResourceName(e.target.value)}
                required
                className="w-full px-2 py-1 rounded bg-black/30 border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-dnd-gold"
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
                required
                className="w-full px-2 py-1 rounded bg-black/30 border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-dnd-gold"
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
                className="w-full px-2 py-1 rounded bg-black/30 border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-dnd-gold"
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
              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-xs"
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          {trackedResources.map((res) => (
            <div
              key={res.id}
              className="bg-dnd-panel/90 p-2 rounded border border-white/5 flex items-center justify-between group"
            >
              <div className="min-w-0 pr-1">
                <div className="text-[11px] font-semibold text-slate-200 truncate">{res.name}</div>
                <div className="text-[10px] text-slate-400 truncate">
                  {res.resetOn ? `Recovers @ ${res.resetOn}` : ''}
                </div>
              </div>
              <div className="flex items-center space-x-1 font-bold text-dnd-gold text-xs bg-black/30 px-1.5 py-0.5 rounded border border-white/5 flex-shrink-0">
                <button
                  type="button"
                  aria-label={`Decrement ${res.name}`}
                  onClick={() => handleStep(res.id, -1)}
                  className="px-1 hover:text-white"
                >
                  -
                </button>
                <span className="min-w-[34px] text-center">
                  {res.current ?? 0} / {res.max ?? 0}
                </span>
                <button
                  type="button"
                  aria-label={`Increment ${res.name}`}
                  onClick={() => handleStep(res.id, 1)}
                  className="px-1 hover:text-white"
                >
                  +
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${res.name}`}
                  title="Remove resource"
                  onClick={() => handleDeleteResource(res.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 pl-1 ml-0.5 transition-opacity"
                >
                  <X size={10} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Freeform Notes Box */}
      <div className="space-y-1">
        <label htmlFor="features-notes" className="text-[10px] text-slate-400">
          Features, Feats & Freeform Notes:
        </label>
        <textarea
          id="features-notes"
          aria-label="Features, Feats & Notes"
          placeholder="Type or paste features, special items, math notes (e.g. Blackstones: 49 + 162 + 28), death ward status, etc..."
          value={featuresNotes || ''}
          onChange={(e) => onUpdateNotes?.(e.target.value)}
          rows={4}
          className="w-full p-2 rounded bg-dnd-panel/60 border border-white/5 text-xs text-slate-200 font-mono leading-relaxed placeholder-slate-500 focus:outline-none focus:border-dnd-gold/40 custom-scroll resize-y"
        />
      </div>
    </div>
  );
}
