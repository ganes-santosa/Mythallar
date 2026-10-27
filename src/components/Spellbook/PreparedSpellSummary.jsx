import React, { useEffect, useState } from 'react';
import { BookOpen, Check, HelpCircle, Pencil, RotateCcw, X } from 'lucide-react';
import { getEffectiveMaxPreparedInfo, getEffectiveMaxKnownInfo } from '../../utils/spellSlots';

function SpellLimitBadge({ label, count, info, customKey, character, onUpdateCharacter }) {
  const [showHint, setShowHint] = useState(false);
  const [editing, setEditing] = useState(false);
  const max = Number.isFinite(info.total) ? info.total : null;
  const [draft, setDraft] = useState(max ?? '');

  useEffect(() => {
    if (!editing) setDraft(max ?? '');
  }, [max, editing]);

  const save = () => {
    const value = Number(draft);
    if (onUpdateCharacter && Number.isFinite(value) && value >= 0) {
      onUpdateCharacter({ ...character, [customKey]: value });
    }
    setEditing(false);
  };

  const reset = () => {
    if (onUpdateCharacter) {
      const next = { ...character };
      delete next[customKey];
      onUpdateCharacter(next);
    }
    setEditing(false);
  };

  return (
    <div className="relative flex items-center space-x-1 bg-dnd-card rounded-lg px-2 py-0.5 text-xs">
      <BookOpen size={11} className="text-dnd-gold" />
      <span className="text-[11px] text-slate-400">{label}:</span>
      {editing ? (
        <>
          <input
            type="number"
            min="0"
            max="50"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save();
              if (e.key === 'Escape') setEditing(false);
            }}
            autoFocus
            className="w-10 bg-dnd-panel rounded px-1 text-[11px] text-slate-100 text-center"
          />
          <button type="button" aria-label={`Save Max ${label}`} onClick={save} className="p-0.5 text-emerald-400">
            <Check size={11} />
          </button>
          <button type="button" aria-label={`Reset Max ${label}`} onClick={reset} className="p-0.5 text-slate-400">
            <RotateCcw size={11} />
          </button>
          <button type="button" aria-label={`Cancel Edit Max ${label}`} onClick={() => setEditing(false)} className="p-0.5 text-slate-400">
            <X size={11} />
          </button>
        </>
      ) : (
        <span className={`font-semibold text-[11px] ${max !== null && count > max ? 'text-red-500' : 'text-slate-200'}`}>
          {count} / {max ?? '—'}
        </span>
      )}
      <button
        type="button"
        aria-label={`${label} spells limit breakdown`}
        onClick={() => setShowHint(!showHint)}
        className="p-0.5 text-slate-400 hover:text-dnd-gold"
      >
        <HelpCircle size={10} />
      </button>
      {!editing && (
        <button
          type="button"
          aria-label={`Edit Max ${label}`}
          onClick={() => setEditing(true)}
          className="p-0.5 text-slate-400 hover:text-dnd-gold"
        >
          <Pencil size={10} />
        </button>
      )}
      {showHint && (
        <div className="absolute right-0 top-6 z-30 w-56 p-2 rounded-lg bg-dnd-card shadow-xl text-[11px] text-slate-200 ring-1 ring-white/10">
          <div className="font-semibold text-dnd-gold mb-1">{label} Limit per Class</div>
          {info.isCustom ? (
            <p className="text-amber-300">Manually set to {info.total} spells.</p>
          ) : info.breakdown.length ? (
            info.breakdown.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span>{item.formula}</span>
                <span>{item.amount}</span>
              </div>
            ))
          ) : (
            <p className="text-slate-400">No {label.toLowerCase()} caster classes.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function PreparedSpellSummary({ character, catalog, onUpdateCharacter }) {
  const preparedInfo = getEffectiveMaxPreparedInfo(character);
  const knownInfo = getEffectiveMaxKnownInfo(character);

  const isLeveledActive = (spell) => {
    if (spell.copying) return false;
    const lvl = catalog?.[spell.id]?.level;
    return typeof lvl === 'number' ? lvl > 0 : true;
  };

  const preparedCount = (character?.spells || []).filter((s) => s.prepared && isLeveledActive(s)).length;
  const knownCount = (character?.spells || []).filter(isLeveledActive).length;

  const showPrepared = preparedInfo.hasPreparedCaster || preparedInfo.isCustom || !knownInfo.hasKnownCaster;
  const showKnown = knownInfo.hasKnownCaster || knownInfo.isCustom;

  return (
    <>
      {showPrepared && (
        <SpellLimitBadge
          label="Prepared"
          count={preparedCount}
          info={preparedInfo}
          customKey="customMaxPrepared"
          character={character}
          onUpdateCharacter={onUpdateCharacter}
        />
      )}
      {showKnown && (
        <SpellLimitBadge
          label="Known"
          count={knownCount}
          info={knownInfo}
          customKey="customMaxKnown"
          character={character}
          onUpdateCharacter={onUpdateCharacter}
        />
      )}
    </>
  );
}
