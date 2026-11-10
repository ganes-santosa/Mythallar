import React, { useState, useEffect } from 'react';
import { CloudUpload, Check, User, FlaskRound } from 'lucide-react';
import { useScrollLock } from '../../hooks/useScrollLock';
import { getTotalCharacterLevel, getCharacterClasses } from '../../utils/spellSlots';
import AccordionSection from '../Common/AccordionSection';

export default function LocalCharactersImportModal({
  isOpen,
  characters = [],
  spells = [],
  onConfirm,
  onKeepLocal,
}) {
  const [selectedCharacters, setSelectedCharacters] = useState(() => new Set(characters.map((c) => c.id)));
  const [selectedSpells, setSelectedSpells] = useState(() => new Set(spells.map((s) => s.id)));

  const charKey = characters.map((c) => c.id).join('|');
  const spellKey = spells.map((s) => s.id).join('|');

  useEffect(() => {
    setSelectedCharacters(new Set(characters.map((c) => c.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charKey]);

  useEffect(() => {
    setSelectedSpells(new Set(spells.map((s) => s.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spellKey]);

  const toggleCharacter = (id) =>
    setSelectedCharacters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleSpell = (id) =>
    setSelectedSpells((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleConfirm = () => {
    const chosenChars = characters.filter((c) => selectedCharacters.has(c.id)).map((c) => c.id);
    const chosenSpells = spells.filter((s) => selectedSpells.has(s.id)).map((s) => s.id);
    if (spells.length > 0) {
      onConfirm?.(chosenChars, chosenSpells);
    } else {
      onConfirm?.(chosenChars);
    }
  };

  const hasItems = characters.length > 0 || spells.length > 0;
  useScrollLock(isOpen && hasItems);

  if (!isOpen || !hasItems) return null;

  const totalSelected = selectedCharacters.size + selectedSpells.size;

  let title = 'Add Local Characters & Spells To Your Account?';
  let subtitle = 'Unchecked items stay on this device and keep working. You can sync them later whenever you want.';

  if (characters.length > 0 && spells.length === 0) {
    const count = characters.length;
    title = `Add ${count} Local ${count === 1 ? 'Character' : 'Characters'} To Your Account?`;
    subtitle = 'Unchecked characters stay on this device and keep working. Sync them later from the character manager.';
  } else if (spells.length > 0 && characters.length === 0) {
    const count = spells.length;
    title = `Add ${count} Local Homebrew ${count === 1 ? 'Spell' : 'Spells'} To Your Account?`;
    subtitle = 'Unchecked spells stay on this device and keep working. You can sync them later whenever you want.';
  }

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in overscroll-contain">
      <div className="bg-dnd-card rounded-2xl p-4 sm:p-5 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center space-x-2.5 flex-shrink-0">
          <span className="p-1.5 rounded-lg bg-dnd-panel text-dnd-gold">
            <CloudUpload size={18} />
          </span>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-dnd-ivory tracking-tight font-display">
              {title}
            </h3>
            <p className="text-xs text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Collapsible Content */}
        <div className="flex-1 overflow-y-auto space-y-3 p-1">
          {characters.length > 0 && (
            <AccordionSection
              title="Characters"
              icon={User}
              badge={
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-dnd-card text-slate-300 font-mono">
                  {selectedCharacters.size}/{characters.length}
                </span>
              }
              actions={
                <div className="flex items-center space-x-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setSelectedCharacters(new Set(characters.map((c) => c.id)))}
                    className="text-dnd-gold hover:text-dnd-gold-light transition-colors px-1 py-0.5 rounded cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-slate-600">·</span>
                  <button
                    type="button"
                    onClick={() => setSelectedCharacters(new Set())}
                    className="text-slate-400 hover:text-slate-200 transition-colors px-1 py-0.5 rounded cursor-pointer"
                  >
                    Select None
                  </button>
                </div>
              }
              defaultOpen={true}
              autoScroll={false}
            >
              <div className="space-y-1.5 pt-1">
                {characters.map((c) => {
                  const classes = getCharacterClasses(c).map((k) => `${k.className} ${k.level}`).join(' / ');
                  const checked = selectedCharacters.has(c.id);
                  return (
                    <label
                      key={c.id}
                      className={`flex items-center space-x-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                        checked ? 'bg-dnd-card/90 shadow-sm' : 'bg-dnd-card/40 hover:bg-dnd-card/70'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCharacter(c.id)}
                        aria-label={`${c.name} ${classes}`}
                        className="sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                          checked ? 'bg-dnd-gold text-slate-950' : 'bg-dnd-panel'
                        }`}
                      >
                        {checked && <Check size={12} />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-slate-100 truncate font-display">{c.name}</span>
                        <span className="block text-xs text-slate-400">
                          {classes} · Lvl {getTotalCharacterLevel(c)}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </AccordionSection>
          )}

          {spells.length > 0 && (
            <AccordionSection
              title="Homebrew Spells"
              icon={FlaskRound}
              badge={
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-dnd-card text-slate-300 font-mono">
                  {selectedSpells.size}/{spells.length}
                </span>
              }
              actions={
                <div className="flex items-center space-x-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setSelectedSpells(new Set(spells.map((s) => s.id)))}
                    className="text-dnd-gold hover:text-dnd-gold-light transition-colors px-1 py-0.5 rounded cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-slate-600">·</span>
                  <button
                    type="button"
                    onClick={() => setSelectedSpells(new Set())}
                    className="text-slate-400 hover:text-slate-200 transition-colors px-1 py-0.5 rounded cursor-pointer"
                  >
                    Select None
                  </button>
                </div>
              }
              defaultOpen={true}
              autoScroll={false}
            >
              <div className="space-y-1.5 pt-1">
                {spells.map((s) => {
                  const checked = selectedSpells.has(s.id);
                  const meta = `${s.level === 0 ? 'Cantrip' : `Level ${s.level}`} · ${s.school || 'Homebrew'}`;
                  return (
                    <label
                      key={s.id}
                      className={`flex items-center space-x-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                        checked ? 'bg-dnd-card/90 shadow-sm' : 'bg-dnd-card/40 hover:bg-dnd-card/70'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSpell(s.id)}
                        aria-label={`${s.name} ${meta}`}
                        className="sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                          checked ? 'bg-dnd-gold text-slate-950' : 'bg-dnd-panel'
                        }`}
                      >
                        {checked && <Check size={12} />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-slate-100 truncate font-display">{s.name}</span>
                        <span className="block text-xs text-slate-400">{meta}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </AccordionSection>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-2 flex-shrink-0">
          <button
            type="button"
            onClick={onKeepLocal}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-dnd-panel/70 hover:bg-dnd-panel text-slate-200 transition-colors cursor-pointer"
          >
            Keep All Local
          </button>
          <button
            type="button"
            disabled={totalSelected === 0}
            onClick={handleConfirm}
            aria-label="Add Selected To Account"
            title="Add Selected To Account"
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-dnd-gold hover:bg-dnd-gold-light text-slate-950"
          >
            <CloudUpload size={13} />
            <span>Add Selected To Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
