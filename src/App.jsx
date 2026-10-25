import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BookOpen, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  loadCharacterProfiles,
  saveCharacterProfiles,
  createDefaultProfile,
  loadHomebrewSpells,
  saveHomebrewSpells,
} from './utils/storage';
import { getEffectiveMaxSlots } from './utils/spellSlots';
import { exportCharacterJSON, validateAndImportCharacterJSON } from './utils/fileExport';
import { useSpellFilter } from './hooks/useSpellFilter';
import FilterBar from './components/Catalog/FilterBar';
import SpellList from './components/Catalog/SpellList';
import HomebrewSpellModal from './components/Catalog/HomebrewSpellModal';
import CharacterHeader from './components/Header/CharacterHeader';
import SpellSlotTracker from './components/Spellbook/SpellSlotTracker';
import SpellbookView from './components/Spellbook/SpellbookView';

export default function App() {
  // --- Character & Profile State ---
  const [profileData, setProfileData] = useState(() => loadCharacterProfiles());
  const { profiles, activeId } = profileData;

  const activeCharacter = useMemo(() => {
    return profiles.find((p) => p.id === activeId) || profiles[0];
  }, [profiles, activeId]);

  // Persist profiles on change
  useEffect(() => {
    saveCharacterProfiles(profileData);
  }, [profileData]);

  // --- Homebrew Spells State ---
  const [homebrewSpells, setHomebrewSpells] = useState(() => loadHomebrewSpells());
  const [isHomebrewSpellModalOpen, setIsHomebrewSpellModalOpen] = useState(false);

  useEffect(() => {
    saveHomebrewSpells(homebrewSpells);
  }, [homebrewSpells]);

  // --- Spell Catalog State ---
  const [baseSpells, setBaseSpells] = useState([]);
  const [isLoadingSpells, setIsLoadingSpells] = useState(true);
  const [spellError, setSpellError] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetch('/data/spells.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch spells`);
        return res.json();
      })
      .then((data) => {
        if (mounted) {
          setBaseSpells(Array.isArray(data) ? data : []);
          setIsLoadingSpells(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          console.error('Error fetching spells catalog:', err);
          setSpellError('Could not load spells dataset.');
          setIsLoadingSpells(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Merge base catalog spells + homebrew spells
  const allSpells = useMemo(() => {
    return [...homebrewSpells, ...baseSpells];
  }, [homebrewSpells, baseSpells]);

  // Quick lookup dictionary: spell.id -> Spell
  const catalogMap = useMemo(() => {
    const map = {};
    for (const s of allSpells) {
      map[s.id] = s;
    }
    return map;
  }, [allSpells]);

  // Spellbook spell ID set for fast in-book checks
  const spellbookSpellIds = useMemo(() => {
    const ids = new Set();
    if (activeCharacter?.spells) {
      for (const item of activeCharacter.spells) {
        ids.add(item.id);
      }
    }
    return ids;
  }, [activeCharacter?.spells]);

  // --- Filter State ---
  const [filters, setFilters] = useState({
    search: '',
    level: 'all',
    className: 'all',
    school: 'all',
    legacyMode: 'all', // 'all', 'modern', 'legacy'
    isHomebrewOnly: false,
    concentration: false,
    ritual: false,
    compV: false,
    compS: false,
    compM: false,
  });

  const filteredSpells = useSpellFilter(allSpells, filters);

  // --- Toast Notification State ---
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 3200);
  }, []);

  // --- Character Profile Mutations ---
  const updateActiveCharacter = useCallback(
    (updated) => {
      setProfileData((prev) => ({
        ...prev,
        profiles: prev.profiles.map((p) => (p.id === updated.id ? updated : p)),
      }));
    },
    []
  );

  const handleSelectProfile = (id) => {
    setProfileData((prev) => ({ ...prev, activeId: id }));
  };

  const handleCreateProfile = () => {
    const newChar = createDefaultProfile(`Adventurer ${profiles.length + 1}`, 'Wizard');
    setProfileData((prev) => ({
      profiles: [...prev.profiles, newChar],
      activeId: newChar.id,
    }));
    showToast(`Created new profile: ${newChar.name}`, 'success');
  };

  const handleExport = () => {
    if (activeCharacter) {
      exportCharacterJSON(activeCharacter);
      showToast(`Exported ${activeCharacter.name}'s spellbook`, 'success');
    }
  };

  const handleImport = (jsonStr) => {
    const { character, error } = validateAndImportCharacterJSON(jsonStr);
    if (error) {
      showToast(error, 'error');
      return;
    }
    setProfileData((prev) => ({
      profiles: [...prev.profiles, character],
      activeId: character.id,
    }));
    showToast(`Imported ${character.name}!`, 'success');
  };

  // --- Homebrew Spell Action ---
  const handleSaveHomebrewSpell = (newSpell) => {
    setHomebrewSpells((prev) => [newSpell, ...prev]);
    showToast(`Created homebrew spell: ${newSpell.name}`, 'success');
  };

  // --- Spell Management Actions ---
  const handleAddSpell = useCallback(
    (spellId) => {
      if (!activeCharacter) return;
      const spell = catalogMap[spellId];
      if (!spell) return;

      const alreadyHas = activeCharacter.spells?.some((s) => s.id === spellId);
      if (alreadyHas) {
        showToast(`${spell.name} is already in your spellbook`, 'info');
        return;
      }

      const updatedSpells = [
        ...(activeCharacter.spells || []),
        { id: spellId, prepared: spell.level === 0 },
      ];

      updateActiveCharacter({
        ...activeCharacter,
        spells: updatedSpells,
      });

      showToast(`Added ${spell.name} to spellbook`, 'success');
    },
    [activeCharacter, catalogMap, updateActiveCharacter, showToast]
  );

  const handleRemoveSpell = useCallback(
    (spellId) => {
      if (!activeCharacter) return;
      const spell = catalogMap[spellId];
      const updatedSpells = (activeCharacter.spells || []).filter((s) => s.id !== spellId);
      updateActiveCharacter({
        ...activeCharacter,
        spells: updatedSpells,
      });
      if (spell) {
        showToast(`Removed ${spell.name} from spellbook`, 'info');
      }
    },
    [activeCharacter, catalogMap, updateActiveCharacter, showToast]
  );

  const handleTogglePrepare = useCallback(
    (spellId) => {
      if (!activeCharacter) return;
      const updatedSpells = (activeCharacter.spells || []).map((s) =>
        s.id === spellId ? { ...s, prepared: !s.prepared } : s
      );
      updateActiveCharacter({
        ...activeCharacter,
        spells: updatedSpells,
      });
    },
    [activeCharacter, updateActiveCharacter]
  );

  // --- Spell Slot Actions ---
  const handleUseSlot = useCallback(
    (level) => {
      if (!activeCharacter) return;
      const used = activeCharacter.slotsUsed?.[level] || 0;
      updateActiveCharacter({
        ...activeCharacter,
        slotsUsed: {
          ...activeCharacter.slotsUsed,
          [level]: used + 1,
        },
      });
    },
    [activeCharacter, updateActiveCharacter]
  );

  const handleRestoreSlot = useCallback(
    (level) => {
      if (!activeCharacter) return;
      const used = activeCharacter.slotsUsed?.[level] || 0;
      if (used <= 0) return;
      updateActiveCharacter({
        ...activeCharacter,
        slotsUsed: {
          ...activeCharacter.slotsUsed,
          [level]: Math.max(0, used - 1),
        },
      });
    },
    [activeCharacter, updateActiveCharacter]
  );

  const handleUpdateMaxSlot = useCallback(
    (level, newMax) => {
      if (!activeCharacter) return;
      updateActiveCharacter({
        ...activeCharacter,
        customSlots: {
          ...activeCharacter.customSlots,
          [level]: newMax,
        },
      });
    },
    [activeCharacter, updateActiveCharacter]
  );

  const handleLongRest = useCallback(() => {
    if (!activeCharacter) return;
    updateActiveCharacter({
      ...activeCharacter,
      slotsUsed: {},
    });
    showToast('Long Rest completed: All spell slots restored!', 'success');
  }, [activeCharacter, updateActiveCharacter, showToast]);

  const handleShortRest = useCallback(() => {
    if (!activeCharacter) return;
    if (activeCharacter.className === 'Warlock') {
      updateActiveCharacter({
        ...activeCharacter,
        slotsUsed: {},
      });
      showToast('Short Rest completed: Pact Magic slots restored!', 'success');
    }
  }, [activeCharacter, updateActiveCharacter, showToast]);

  const handleCastSpell = useCallback(
    (spell) => {
      if (!activeCharacter || !spell) return;
      if (spell.level === 0) {
        showToast(`Cast ${spell.name} (Cantrip, at will)`, 'info');
        return;
      }

      // Check available slots
      const maxSlots = getEffectiveMaxSlots(
        activeCharacter.className,
        activeCharacter.level,
        activeCharacter.customSlots
      );

      // Find lowest available slot level >= spell.level
      let slotToUse = null;
      for (let lvl = spell.level; lvl <= 9; lvl++) {
        const max = maxSlots[lvl] || 0;
        const used = activeCharacter.slotsUsed?.[lvl] || 0;
        if (used < max) {
          slotToUse = lvl;
          break;
        }
      }

      if (slotToUse === null) {
        showToast(`No available spell slots to cast ${spell.name} (Level ${spell.level}+)`, 'error');
        return;
      }

      handleUseSlot(slotToUse);
      const isUpcast = slotToUse > spell.level;
      showToast(
        `Cast ${spell.name} using Level ${slotToUse} slot${isUpcast ? ' (Upcast)' : ''}`,
        'success'
      );
    },
    [activeCharacter, handleUseSlot, showToast]
  );

  return (
    <div className="flex flex-col h-screen bg-dnd-bg text-slate-200">
      {/* Toast Banner */}
      {toast && (
        <div className="fixed top-3 right-4 z-50 flex items-center space-x-2 px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-2 bg-dnd-card border border-dnd-border">
          {toast.type === 'success' && <CheckCircle2 size={16} className="text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle size={16} className="text-red-400" />}
          {toast.type === 'info' && <Sparkles size={16} className="text-dnd-gold" />}
          <span className="text-slate-100">{toast.message}</span>
        </div>
      )}

      {/* Main Dual-Pane Body */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Pane: Spell Catalog with Integrated Branding Header */}
        <section className="w-full md:w-1/2 flex flex-col border-b md:border-b-0 md:border-r border-dnd-border p-3 sm:p-4 overflow-hidden bg-dnd-panel/30">
          {/* Integrated Header */}
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-dnd-border/60 flex-shrink-0">
            <div className="flex items-center space-x-2.5">
              <span className="p-1.5 rounded-lg bg-dnd-gold/10 border border-dnd-gold/30 text-dnd-gold">
                <BookOpen size={17} />
              </span>
              <div className="flex flex-wrap items-baseline gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                  D&D 5e Spellbook
                </h1>
                <span className="hidden sm:inline text-[11px] text-dnd-gold font-medium px-1.5 py-0.2 rounded bg-dnd-gold/10 border border-dnd-gold/20">
                  Official 5e (2024 &amp; Legacy) + Homebrew
                </span>
              </div>
            </div>

            <span className="hidden lg:inline text-[11px] text-slate-400">
              Drag to Spellbook
            </span>
          </div>

          <FilterBar
            filters={filters}
            onChange={setFilters}
            onOpenHomebrewSpellModal={() => setIsHomebrewSpellModalOpen(true)}
          />

          {isLoadingSpells ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-sm">
              <Sparkles className="animate-spin text-dnd-gold mb-2" size={24} />
              <span>Loading spell grimoire...</span>
            </div>
          ) : spellError ? (
            <div className="flex items-center justify-center h-64 text-red-400 text-sm">
              <AlertCircle size={18} className="mr-2" />
              <span>{spellError}</span>
            </div>
          ) : (
            <SpellList
              spells={filteredSpells}
              spellbookSpellIds={spellbookSpellIds}
              onAddToSpellbook={handleAddSpell}
            />
          )}
        </section>

        {/* Right Pane: Character Spellbook & Slots (Scrollable Container) */}
        <section className="w-full md:w-1/2 flex flex-col p-3 sm:p-4 overflow-y-auto bg-dnd-panel/10">
          <CharacterHeader
            activeCharacter={activeCharacter}
            profiles={profiles}
            onUpdateCharacter={updateActiveCharacter}
            onSelectProfile={handleSelectProfile}
            onCreateProfile={handleCreateProfile}
            onExport={handleExport}
            onImport={handleImport}
          />

          <SpellSlotTracker
            character={activeCharacter}
            onUseSlot={handleUseSlot}
            onRestoreSlot={handleRestoreSlot}
            onUpdateMaxSlot={handleUpdateMaxSlot}
            onLongRest={handleLongRest}
            onShortRest={handleShortRest}
            onUpdateCharacter={updateActiveCharacter}
          />

          <div className="flex-1 min-h-[300px] flex flex-col">
            <SpellbookView
              character={activeCharacter}
              catalog={catalogMap}
              onTogglePrepare={handleTogglePrepare}
              onCastSpell={handleCastSpell}
              onRemoveSpell={handleRemoveSpell}
              onAddSpell={handleAddSpell}
            />
          </div>
        </section>
      </main>

      {/* Homebrew Spell Modal */}
      <HomebrewSpellModal
        isOpen={isHomebrewSpellModalOpen}
        onClose={() => setIsHomebrewSpellModalOpen(false)}
        onSave={handleSaveHomebrewSpell}
      />
    </div>
  );
}
