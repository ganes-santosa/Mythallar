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

export default function AbilitiesCard({ abilities, level, onUpdateAbilities }) {
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
    onUpdateAbilities?.({
      ...currentAbilities,
      [key]: Number(value),
    });
  };

  const toggleSaveProficiency = (key) => {
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
    <div className="rounded-lg bg-dnd-card p-3 border border-white/5 shadow-sm space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-dnd-pewter uppercase tracking-wider">
        <div className="flex items-center space-x-2">
          <span>Ability Scores & Saving Throws</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-green-500/15 text-green-300 normal-case font-normal">
            Proficiency +{profBonus} (Level {safeLevel})
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
        {ABILITIES.map(({ key, label }) => {
          const score = currentAbilities[key] ?? 10;
          const mod = getAbilityModifier(score);
          const isProf = saveProficiencies.includes(key);
          const saveVal = calculateSave(score, isProf, safeLevel, currentAbilities.overrides?.[`${key}Save`]);

          return (
            <div
              key={key}
              className={`p-2 rounded border relative flex flex-col justify-between transition-all ${
                isProf
                  ? 'bg-dnd-panel/95 border-dnd-gold/30 ring-1 ring-dnd-gold/20'
                  : 'bg-dnd-panel/80 border-white/5'
              }`}
            >
              {/* Proficiency toggle dot */}
              <button
                type="button"
                aria-label={`Toggle ${label} save proficiency`}
                title={`Toggle ${label} saving throw proficiency`}
                onClick={() => toggleSaveProficiency(key)}
                className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full transition-all ${
                  isProf
                    ? 'bg-dnd-gold shadow-[0_0_6px_rgba(224,168,56,0.8)]'
                    : 'bg-white/10 hover:bg-white/30'
                }`}
              />

              <div
                className={`text-[10px] font-bold tracking-wider ${
                  isProf ? 'text-dnd-gold-light' : 'text-slate-400'
                }`}
              >
                {label}
              </div>

              <div className="my-1">
                <input
                  type="number"
                  aria-label={`${label} Score`}
                  value={score}
                  onChange={(e) => handleScoreChange(key, e.target.value)}
                  className="w-12 text-center text-base sm:text-lg font-bold text-slate-100 bg-black/20 rounded border border-white/5 focus:outline-none focus:border-dnd-gold/60"
                />
              </div>

              <div className="text-xs font-semibold text-dnd-gold">
                {formatModifier(mod)} mod
              </div>

              <div
                className={`mt-1 pt-1 border-t text-[11px] font-medium ${
                  isProf
                    ? 'border-white/10 text-dnd-gold font-bold'
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
