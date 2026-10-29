import React, { useState, useMemo } from 'react';
import useTwoClickConfirm from '../../hooks/useTwoClickConfirm';
import {
  X,
  User,
  Plus,
  Trash2,
  Check,
  Search,
  ArrowUpDown,
  Sparkles,
  BookMarked,
} from 'lucide-react';
import { getTotalCharacterLevel, getCharacterClasses } from '../../utils/spellSlots';

// ponytail: extracted so useTwoClickConfirm hook works per-row inside .map()
function CharacterDeleteButton({ name, onDelete }) {
  const { armed, handleClick } = useTwoClickConfirm(onDelete);
  return (
    <button
      type="button"
      aria-label={armed ? `Click again to delete ${name}` : `Delete ${name}`}
      onClick={handleClick}
      className={`p-1 rounded-md transition-colors ${armed ? 'text-red-500 bg-red-950/70 ring-1 ring-red-500/60' : 'text-slate-400 hover:text-red-400 hover:bg-red-950/30'}`}
      title={armed ? 'Click again to delete' : `Delete ${name}`}
    >
      <Trash2 size={14} />
    </button>
  );
}

export default function CharacterManagerModal({
  isOpen,
  onClose,
  profiles = [],
  activeId,
  onSelectProfile,
  onCreateProfile,
  onDeleteProfile,
}) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('level-desc'); // 'level-desc', 'level-asc', 'name-asc', 'name-desc'

  const filteredAndSortedProfiles = useMemo(() => {
    let list = profiles.filter((p) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      const nameMatch = (p.name || '').toLowerCase().includes(q);
      const classMatch = (p.className || '').toLowerCase().includes(q);
      return nameMatch || classMatch;
    });

    list = [...list].sort((a, b) => {
      const lvlA = getTotalCharacterLevel(a);
      const lvlB = getTotalCharacterLevel(b);
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();

      switch (sortBy) {
        case 'level-desc':
          return lvlB - lvlA || nameA.localeCompare(nameB);
        case 'level-asc':
          return lvlA - lvlB || nameA.localeCompare(nameB);
        case 'name-asc':
          return nameA.localeCompare(nameB);
        case 'name-desc':
          return nameB.localeCompare(nameA);
        default:
          return 0;
      }
    });

    return list;
  }, [profiles, search, sortBy]);

  const handleCreateNew = () => {
    onCreateProfile();
    onClose();
  };

  if (!isOpen) return null;

  const handleSelect = (id) => {
    onSelectProfile(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-dnd-card rounded-2xl p-4 sm:p-5 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 rounded-lg bg-dnd-panel text-dnd-gold">
              <User size={18} />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-dnd-ivory tracking-tight font-display">
                Character Grimoires
              </h3>
              <p className="text-xs text-slate-400">
                {profiles.length} {profiles.length === 1 ? 'character' : 'characters'} saved
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/5 transition-colors"
            title="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Filter, Search & Sort Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by name or class..."
              className="w-full bg-dnd-panel/70 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors"
            />
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative flex items-center bg-dnd-panel/70 rounded-lg px-2 py-1.5 text-xs">
              <ArrowUpDown size={12} className="text-slate-400 mr-1.5 flex-shrink-0" />
              <select
                aria-label="Sort Characters"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="level-desc" className="bg-dnd-panel">Highest Level</option>
                <option value="level-asc" className="bg-dnd-panel">Lowest Level</option>
                <option value="name-asc" className="bg-dnd-panel">Name (A-Z)</option>
                <option value="name-desc" className="bg-dnd-panel">Name (Z-A)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleCreateNew}
              aria-label="New Character"
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors shadow-sm whitespace-nowrap bg-dnd-gold hover:bg-dnd-gold-light text-slate-950"
              title="Create a new character profile"
            >
              <Plus size={13} />
              <span>New Character</span>
            </button>
          </div>
        </div>

        {/* Character Cards List */}
        <div className="flex-1 overflow-y-auto space-y-2 p-1 min-h-[220px]">
          {filteredAndSortedProfiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-xs">
              <Sparkles size={20} className="text-slate-500 mb-1.5" />
              <span>{profiles.length === 0 ? 'No characters saved.' : 'No characters match your search.'}</span>
            </div>
          ) : (
            filteredAndSortedProfiles.map((char) => {
              const isActive = char.id === activeId;
              const lvl = getTotalCharacterLevel(char);
              const classes = getCharacterClasses(char);
              const spellCount = (char.spells || []).length;

              return (
                <div
                  key={char.id}
                  className={`p-3 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                    isActive
                      ? 'bg-dnd-panel/90 shadow-[0_0_16px_rgba(255,255,255,0.08)] ring-1 ring-white/25'
                      : 'bg-dnd-panel/40 hover:bg-dnd-panel/70'
                  }`}
                >
                  {/* Left Info Column */}
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-dnd-card/80 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-[10px] uppercase text-dnd-gold font-bold">Lvl</span>
                      <span className="text-sm font-bold text-slate-100 tabular-nums leading-none">
                        {lvl}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-sm text-slate-100 truncate font-display">
                          {char.name}
                        </h4>
                        {isActive && (
                          <span className="px-1.5 py-0.2 rounded bg-dnd-gold text-slate-950 font-bold text-[10px] tracking-wide uppercase">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-slate-400">
                        <span>
                          {classes.map((c) => `${c.className} ${c.level}`).join(' / ')}
                        </span>
                        <span>·</span>
                        <span className="flex items-center space-x-1">
                          <BookMarked size={11} className="text-slate-400" />
                          <span>{spellCount} {spellCount === 1 ? 'spell' : 'spells'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <>
                      {!isActive && (
                        <button
                          type="button"
                          aria-label={`Switch to ${char.name}`}
                          onClick={() => handleSelect(char.id)}
                          className="px-2.5 py-1 rounded-md bg-dnd-card/80 hover:bg-dnd-card hover:text-white text-slate-300 text-xs font-semibold transition-colors"
                        >
                          Switch
                        </button>
                      )}

                      <CharacterDeleteButton
                        name={char.name}
                        onDelete={() => {
                          onDeleteProfile(char.id);
                          if (profiles.length <= 1) {
                            onClose();
                          }
                        }}
                      />
                    </>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
