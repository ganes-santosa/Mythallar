import React from 'react';
import { Search, X, Sparkles, ScrollText, Plus, Flame } from 'lucide-react';

const CLASSES = [
  'Artificer',
  'Barbarian',
  'Bard',
  'Cleric',
  'Druid',
  'Fighter',
  'Monk',
  'Paladin',
  'Ranger',
  'Rogue',
  'Sorcerer',
  'Warlock',
  'Wizard',
];

const SCHOOLS = [
  'Abjuration',
  'Conjuration',
  'Divination',
  'Enchantment',
  'Evocation',
  'Illusion',
  'Necromancy',
  'Transmutation',
];

export default function FilterBar({ filters, onChange, onOpenHomebrewSpellModal }) {
  const update = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const isFiltered = Boolean(
    filters.search ||
      (filters.level !== undefined && filters.level !== 'all') ||
      (filters.className && filters.className !== 'all') ||
      (filters.school && filters.school !== 'all') ||
      (filters.legacyMode && filters.legacyMode !== 'all') ||
      filters.isHomebrewOnly ||
      filters.concentration ||
      filters.ritual ||
      filters.compV ||
      filters.compS ||
      filters.compM
  );

  return (
    <div className="space-y-2.5 pb-3 border-b border-dnd-border">
      {/* Search Bar + Homebrew Spell Button */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => update('search', e.target.value)}
            placeholder="Search spells, text, school, book..."
            className="w-full bg-dnd-card border border-dnd-border rounded-lg pl-9 pr-9 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-dnd-gold transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => update('search', '')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {onOpenHomebrewSpellModal && (
          <button
            type="button"
            onClick={onOpenHomebrewSpellModal}
            className="flex items-center px-2.5 py-2 rounded-lg bg-dnd-card border border-dnd-border hover:border-dnd-gold text-slate-300 hover:text-dnd-gold font-medium text-xs transition-colors flex-shrink-0"
            title="Create a homebrew spell"
          >
            <Plus size={14} className="mr-1 text-dnd-gold" />
            <span className="hidden sm:inline">Homebrew Spell</span>
            <span className="sm:hidden">Homebrew</span>
          </button>
        )}
      </div>

      {/* Select Dropdowns Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Level */}
        <select
          value={filters.level !== undefined ? filters.level : 'all'}
          onChange={(e) => update('level', e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="bg-dnd-card border border-dnd-border rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-dnd-gold"
          aria-label="Filter by Level"
        >
          <option value="all">All Levels</option>
          <option value="0">Cantrips</option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
            <option key={lvl} value={lvl}>
              Level {lvl}
            </option>
          ))}
        </select>

        {/* Class */}
        <select
          value={filters.className || 'all'}
          onChange={(e) => update('className', e.target.value)}
          className="bg-dnd-card border border-dnd-border rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-dnd-gold"
          aria-label="Filter by Class"
        >
          <option value="all">All Classes</option>
          {CLASSES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* School */}
        <select
          value={filters.school || 'all'}
          onChange={(e) => update('school', e.target.value)}
          className="bg-dnd-card border border-dnd-border rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-dnd-gold"
          aria-label="Filter by School"
        >
          <option value="all">All Schools</option>
          {SCHOOLS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* 2024 / Legacy Version Filter */}
        <select
          value={filters.legacyMode || 'all'}
          onChange={(e) => update('legacyMode', e.target.value)}
          className="bg-dnd-card border border-dnd-border rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-dnd-gold font-medium"
          aria-label="Filter 2024 or Legacy"
        >
          <option value="all">All (2024 + Legacy)</option>
          <option value="modern">2024 &amp; Modern</option>
          <option value="legacy">Legacy (2014) Only</option>
        </select>
      </div>

      {/* Filter Chips Toggles */}
      <div className="flex items-center flex-wrap gap-1.5 text-xs">
        {/* Homebrew Only Filter Button */}
        <button
          type="button"
          onClick={() => update('isHomebrewOnly', !filters.isHomebrewOnly)}
          className={`flex items-center px-2 py-1 rounded border font-medium transition-colors ${
            filters.isHomebrewOnly
              ? 'bg-purple-500/25 border-purple-500 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.25)]'
              : 'bg-dnd-card border-dnd-border text-slate-400 hover:text-slate-200'
          }`}
          title="Filter only homebrew spells"
        >
          <Flame size={12} className="mr-1 text-purple-400" />
          Homebrew
        </button>

        <button
          type="button"
          onClick={() => update('concentration', !filters.concentration)}
          className={`flex items-center px-2 py-1 rounded border transition-colors ${
            filters.concentration
              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
              : 'bg-dnd-card border-dnd-border text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles size={12} className="mr-1" />
          Concentration
        </button>

        <button
          type="button"
          onClick={() => update('ritual', !filters.ritual)}
          className={`flex items-center px-2 py-1 rounded border transition-colors ${
            filters.ritual
              ? 'bg-blue-500/20 border-blue-500 text-blue-300'
              : 'bg-dnd-card border-dnd-border text-slate-400 hover:text-slate-200'
          }`}
        >
          <ScrollText size={12} className="mr-1" />
          Ritual
        </button>

        <button
          type="button"
          onClick={() => update('compV', !filters.compV)}
          className={`px-2 py-1 rounded border font-bold transition-colors ${
            filters.compV
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
              : 'bg-dnd-card border-dnd-border text-slate-400 hover:text-slate-200'
          }`}
          title="Verbal Component"
        >
          V
        </button>

        <button
          type="button"
          onClick={() => update('compS', !filters.compS)}
          className={`px-2 py-1 rounded border font-bold transition-colors ${
            filters.compS
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
              : 'bg-dnd-card border-dnd-border text-slate-400 hover:text-slate-200'
          }`}
          title="Somatic Component"
        >
          S
        </button>

        <button
          type="button"
          onClick={() => update('compM', !filters.compM)}
          className={`px-2 py-1 rounded border font-bold transition-colors ${
            filters.compM
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
              : 'bg-dnd-card border-dnd-border text-slate-400 hover:text-slate-200'
          }`}
          title="Material Component"
        >
          M
        </button>

        {isFiltered && (
          <button
            type="button"
            onClick={() =>
              onChange({
                search: '',
                level: 'all',
                className: 'all',
                school: 'all',
                legacyMode: 'all',
                isHomebrewOnly: false,
                concentration: false,
                ritual: false,
                compV: false,
                compS: false,
                compM: false,
              })
            }
            className="text-xs text-slate-400 hover:text-dnd-gold ml-auto"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
