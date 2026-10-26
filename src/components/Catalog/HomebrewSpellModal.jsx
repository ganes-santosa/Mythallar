import React, { useState } from 'react';
import { X, Sparkles, Plus } from 'lucide-react';

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

const ALL_CLASSES = [
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

export default function HomebrewSpellModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState('');
  const [level, setLevel] = useState(1);
  const [school, setSchool] = useState('Evocation');
  const [time, setTime] = useState('1 action');
  const [range, setRange] = useState('60 feet');
  const [duration, setDuration] = useState('Instantaneous');
  const [concentration, setConcentration] = useState(false);
  const [ritual, setRitual] = useState(false);
  const [compV, setCompV] = useState(true);
  const [compS, setCompS] = useState(true);
  const [compM, setCompM] = useState(false);
  const [materialText, setMaterialText] = useState('');
  const [selectedClasses, setSelectedClasses] = useState(['Wizard']);
  const [entriesText, setEntriesText] = useState('');
  const [higherLevels, setHigherLevels] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const toggleClass = (cls) => {
    if (selectedClasses.includes(cls)) {
      setSelectedClasses(selectedClasses.filter((c) => c !== cls));
    } else {
      setSelectedClasses([...selectedClasses, cls]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please provide a spell name.');
      return;
    }

    const cleanEntries = entriesText
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);

    const newSpell = {
      id: `homebrew_${Date.now()}_${trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: trimmedName,
      source: 'Homebrew',
      level: Number(level),
      school,
      time: time.trim() || '1 action',
      range: range.trim() || 'Self',
      duration: duration.trim() || 'Instantaneous',
      concentration,
      ritual,
      components: {
        v: compV,
        s: compS,
        m: compM ? (materialText.trim() || true) : false,
      },
      classes: selectedClasses,
      entries: cleanEntries.length > 0 ? cleanEntries : ['No description provided.'],
      higherLevels: higherLevels.trim() || '',
    };

    onSave(newSpell);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-dnd-panel rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-dnd-card">
          <div className="flex items-center space-x-2">
            <Sparkles size={18} className="text-dnd-gold" />
            <h2 className="text-base font-bold text-slate-100">Create Homebrew Spell</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {error && (
            <div className="p-2 rounded bg-red-500/20 text-red-300">
              {error}
            </div>
          )}

          {/* Spell Name */}
          <div>
            <label htmlFor="custom-spell-name" className="block text-slate-300 font-semibold mb-1">
              Spell Name *
            </label>
            <input
              id="custom-spell-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="e.g. Eldritch Nova"
              required
              className="w-full bg-dnd-card rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>

          {/* Level & School Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="custom-spell-level" className="block text-slate-300 font-semibold mb-1">
                Spell Level
              </label>
              <select
                id="custom-spell-level"
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                className="w-full bg-dnd-card rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-white/20"
              >
                <option value={0}>Cantrip (Level 0)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                  <option key={lvl} value={lvl}>
                    Level {lvl}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="custom-spell-school" className="block text-slate-300 font-semibold mb-1">
                School
              </label>
              <select
                id="custom-spell-school"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full bg-dnd-card rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-white/20"
              >
                {SCHOOLS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Time, Range, Duration */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="custom-spell-time" className="block text-slate-300 font-semibold mb-1">
                Casting Time
              </label>
              <input
                id="custom-spell-time"
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="1 action"
                className="w-full bg-dnd-card rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-white/20"
              />
            </div>

            <div>
              <label htmlFor="custom-spell-range" className="block text-slate-300 font-semibold mb-1">
                Range
              </label>
              <input
                id="custom-spell-range"
                type="text"
                value={range}
                onChange={(e) => setRange(e.target.value)}
                placeholder="60 feet"
                className="w-full bg-dnd-card rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-white/20"
              />
            </div>

            <div>
              <label htmlFor="custom-spell-duration" className="block text-slate-300 font-semibold mb-1">
                Duration
              </label>
              <input
                id="custom-spell-duration"
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Instantaneous"
                className="w-full bg-dnd-card rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-white/20"
              />
            </div>
          </div>

          {/* Concentration & Ritual Toggles */}
          <div className="flex items-center space-x-5 pt-1">
            <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={concentration}
                onChange={(e) => setConcentration(e.target.checked)}
                className="rounded text-dnd-gold focus:ring-0"
              />
              <span>Concentration</span>
            </label>

            <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={ritual}
                onChange={(e) => setRitual(e.target.checked)}
                className="rounded text-dnd-gold focus:ring-0"
              />
              <span>Ritual</span>
            </label>
          </div>

          {/* Components */}
          <div className="space-y-1.5">
            <span className="block text-slate-300 font-semibold">Components</span>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-1.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={compV}
                  onChange={(e) => setCompV(e.target.checked)}
                />
                <span>Verbal (V)</span>
              </label>

              <label className="flex items-center space-x-1.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={compS}
                  onChange={(e) => setCompS(e.target.checked)}
                />
                <span>Somatic (S)</span>
              </label>

              <label className="flex items-center space-x-1.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={compM}
                  onChange={(e) => setCompM(e.target.checked)}
                />
                <span>Material (M)</span>
              </label>
            </div>

            {compM && (
              <input
                type="text"
                value={materialText}
                onChange={(e) => setMaterialText(e.target.value)}
                placeholder="Material description (e.g. a pinch of phosphorus)"
                className="w-full bg-dnd-card rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-white/20 mt-1.5"
              />
            )}
          </div>

          {/* Classes checkboxes */}
          <div>
            <span className="block text-slate-300 font-semibold mb-1.5">Classes</span>
            <div className="flex flex-wrap gap-1.5">
              {ALL_CLASSES.map((cls) => {
                const isSelected = selectedClasses.includes(cls);
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => toggleClass(cls)}
                    className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                      isSelected
                        ? 'bg-white/10 text-white shadow-[0_0_8px_rgba(255,255,255,0.08)] font-semibold'
                        : 'bg-dnd-card text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cls}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="custom-spell-description" className="block text-slate-300 font-semibold mb-1">
              Description (paragraphs separated by newlines) *
            </label>
            <textarea
              id="custom-spell-description"
              rows={4}
              value={entriesText}
              onChange={(e) => setEntriesText(e.target.value)}
              placeholder="Describe the spell effects, damage, saves..."
              required
              className="w-full bg-dnd-card rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-white/20 leading-relaxed"
            />
          </div>

          {/* At Higher Levels */}
          <div>
            <label htmlFor="custom-spell-higher-levels" className="block text-slate-300 font-semibold mb-1">
              At Higher Levels (Optional)
            </label>
            <textarea
              id="custom-spell-higher-levels"
              rows={2}
              value={higherLevels}
              onChange={(e) => setHigherLevels(e.target.value)}
              placeholder="e.g. When you cast this spell using a spell slot of 3rd level or higher..."
              className="w-full bg-dnd-card rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="pt-3 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-dnd-card hover:bg-dnd-hover text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 rounded-lg bg-dnd-gold hover:bg-dnd-gold-light text-slate-950 font-bold transition-colors shadow"
            >
              <Plus size={15} className="mr-1.5" />
              Save Spell
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
