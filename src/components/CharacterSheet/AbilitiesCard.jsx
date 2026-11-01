import React from 'react';
import {
  getAbilityModifier,
  formatModifier,
  calculateSave,
  getProficiencyBonus,
} from '../../utils/dndCalculations';

const ABILITIES = [
  { key: 'str', label: 'STR' },
  { key: 'dex', label: 'DEX' },
  { key: 'con', label: 'CON' },
  { key: 'int', label: 'INT' },
  { key: 'wis', label: 'WIS' },
  { key: 'cha', label: 'CHA' },
];

export default function AbilitiesCard({ abilities, level, isEditing = false, onUpdateAbilities }) {
  const currentAbilities = abilities || {
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
    saveProficiencies: ['int', 'wis'],
    overrides: {},
  };

  const saveProficiencies = currentAbilities.saveProficiencies || [];
  const safeLevel = Number(level) || 1;
  const profBonus = getProficiencyBonus(safeLevel);

  const handleScoreChange = (key, value) => {
    if (!isEditing) return;
    onUpdateAbilities?.({
      ...currentAbilities,
      [key]: Number(value),
    });
  };

  const toggleSaveProficiency = (key) => {
    if (!isEditing) return;
    const hasProf = saveProficiencies.includes(key);
    const nextProf = hasProf
      ? saveProficiencies.filter((k) => k !== key)
      : [...saveProficiencies, key];

    onUpdateAbilities?.({
      ...currentAbilities,
      saveProficiencies: nextProf,
    });
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center p-1">
        {ABILITIES.map(({ key, label }) => {
          const score = currentAbilities[key] ?? 10;
          const mod = getAbilityModifier(score);
          const isProf = saveProficiencies.includes(key);
          const saveVal = calculateSave(score, isProf, safeLevel, currentAbilities.overrides?.[`${key}Save`]);

          return (
            <div
              key={key}
              className={`p-2 rounded-lg relative flex flex-col justify-between transition-all shadow-sm ${
                isProf
                  ? 'bg-dnd-card ring-1 ring-dnd-gold/40'
                  : 'bg-dnd-card'
              }`}
            >
              {/* Proficiency toggle dot */}
              <button
                type="button"
                disabled={!isEditing}
                aria-label={
                  isEditing
                    ? `Toggle ${label} save proficiency`
                    : `${label} save proficiency: ${isProf ? 'proficient' : 'not proficient'}`
                }
                title={
                  isEditing
                    ? `Toggle ${label} saving throw proficiency`
                    : `${label} saving throw: ${isProf ? 'Proficient' : 'Not proficient'}`
                }
                onClick={isEditing ? () => toggleSaveProficiency(key) : undefined}
                className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full transition-all ${
                  isProf
                    ? 'bg-dnd-gold shadow-[0_0_6px_rgba(224,168,56,0.8)]'
                    : isEditing
                    ? 'bg-dnd-panel hover:bg-white/30 cursor-pointer'
                    : 'opacity-0 cursor-default'
                } ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
              />

              <div
                className={`text-[10px] font-bold tracking-wider ${
                  isProf ? 'text-dnd-gold-light' : 'text-slate-400'
                }`}
              >
                {label}
              </div>

              <div className="my-1 flex items-center justify-center">
                <input
                  type="number"
                  readOnly={!isEditing}
                  tabIndex={isEditing ? 0 : -1}
                  aria-label={`${label} Score`}
                  value={score}
                  onChange={isEditing ? (e) => handleScoreChange(key, e.target.value) : undefined}
                  className={`w-12 text-center text-base sm:text-lg font-bold text-slate-100 rounded-md transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none outline-none focus:outline-none ${
                    isEditing
                      ? 'bg-dnd-panel focus:ring-1 focus:ring-white/20 pointer-events-auto'
                      : 'bg-transparent cursor-default select-none pointer-events-none focus:ring-0'
                  }`}
                />
              </div>

              <div className="text-xs font-semibold text-dnd-gold">
                {formatModifier(mod)} mod
              </div>

              <div
                className={`mt-1 pt-1 border-t text-[11px] font-medium ${
                  isProf
                    ? 'border-dnd-gold/20 text-dnd-gold font-bold'
                    : 'border-white/5 text-slate-300'
                }`}
              >
                Save {formatModifier(saveVal)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
