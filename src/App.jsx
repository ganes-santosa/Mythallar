import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { BookOpen, Sparkles, AlertCircle, CheckCircle2, Settings } from 'lucide-react';
import {
  loadCharacterProfiles,
  saveCharacterProfiles,
  createDefaultProfile,
  loadHomebrewSpells,
  saveHomebrewSpells,
} from './utils/storage';
import { getEffectiveMaxSlots, isWizardCharacter } from './utils/spellSlots';
import { exportCharacterJSON, validateAndImportCharacterJSON } from './utils/fileExport';
import { useSpellFilter } from './hooks/useSpellFilter';
import { getSupabase, signInWithGoogle, signOut } from './utils/supabase';
import {
  fetchCloudData,
  syncCharactersToCloud,
  syncHomebrewToCloud,
  deleteCloudCharacter,
  mergeLocalAndCloud,
} from './utils/syncService';
import { getStoredThemeId, setTheme, applyTheme } from './utils/themeService';
import FilterBar from './components/Catalog/FilterBar';
import SpellList from './components/Catalog/SpellList';
import HomebrewSpellModal from './components/Catalog/HomebrewSpellModal';
import CharacterHeader from './components/Header/CharacterHeader';
import SettingsModal from './components/Header/SettingsModal';
import MythallarLogo from './components/Common/MythallarLogo';
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

  // --- Settings & Theme State ---
  const [activeThemeId, setActiveThemeId] = useState(() => getStoredThemeId());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    applyTheme(activeThemeId);
  }, [activeThemeId]);

  const handleSelectTheme = (themeId) => {
    setTheme(themeId);
    setActiveThemeId(themeId);
  };

  // --- Auth & Cloud Sync State ---
  const [user, setUser] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'saved' | 'error' | 'offline'
  const debounceSyncTimer = useRef(null);
  const supabase = getSupabase();

  // Listen to Supabase auth state change
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  // Pull cloud data on user login
  useEffect(() => {
    if (!supabase || !user) return;

    let cancelled = false;
    setSyncStatus('syncing');

    fetchCloudData(supabase, user.id)
      .then(({ characters: cloudChars, homebrewSpells: cloudHb }) => {
        if (cancelled) return;

        // Merge cloud characters with local profiles
        setProfileData((prev) => {
          const merged = mergeLocalAndCloud(prev.profiles, cloudChars);
          return {
            ...prev,
            profiles: merged.length > 0 ? merged : prev.profiles,
          };
        });

        // Merge homebrew spells
        setHomebrewSpells((prev) => mergeLocalAndCloud(prev, cloudHb));

        setSyncStatus('saved');
        showToast('Characters synced with cloud', 'success');
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Initial cloud sync error:', err);
        setSyncStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [user, supabase]);

  // Debounced push to cloud when local profileData or homebrew changes
  useEffect(() => {
    if (!supabase || !user) return;

    if (debounceSyncTimer.current) {
      clearTimeout(debounceSyncTimer.current);
    }

    setSyncStatus('syncing');

    debounceSyncTimer.current = setTimeout(async () => {
      const [charRes, hbRes] = await Promise.all([
        syncCharactersToCloud(supabase, user.id, profileData.profiles),
        syncHomebrewToCloud(supabase, user.id, homebrewSpells),
      ]);

      if (charRes.success && hbRes.success) {
        setSyncStatus('saved');
      } else {
        setSyncStatus('error');
      }
    }, 1500);

    return () => {
      if (debounceSyncTimer.current) clearTimeout(debounceSyncTimer.current);
    };
  }, [profileData.profiles, homebrewSpells, user, supabase]);

  const handleSignIn = useCallback(async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      showToast(error.message, 'error');
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    const { error } = await signOut();
    if (error) {
      showToast(error.message, 'error');
    } else {
      setUser(null);
      setSyncStatus('idle');
      showToast('Signed out', 'info');
    }
  }, []);

  const handleManualSyncNow = useCallback(async () => {
    if (!supabase || !user) return;
    setSyncStatus('syncing');
    const [cRes, hRes] = await Promise.all([
      syncCharactersToCloud(supabase, user.id, profileData.profiles),
      syncHomebrewToCloud(supabase, user.id, homebrewSpells),
    ]);
    if (cRes.success && hRes.success) {
      setSyncStatus('saved');
      showToast('Cloud sync complete', 'success');
    } else {
      setSyncStatus('error');
      showToast('Cloud sync failed', 'error');
    }
  }, [supabase, user, profileData.profiles, homebrewSpells]);

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
    source: 'all',
    isHomebrewOnly: false,
    concentration: false,
    ritual: false,
    compV: false,
    compS: false,
    compM: false,
  });

  const availableSources = useMemo(() => {
    const set = new Set();
    for (const s of allSpells) {
      if (s.source) set.add(s.source);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allSpells]);

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

  const handleDeleteCharacter = useCallback(
    async (charId) => {
      if (profileData.profiles.length <= 1) {
        showToast('Cannot delete only character profile', 'error');
        return;
      }

      const deletedChar = profileData.profiles.find((p) => p.id === charId);
      const remainingProfiles = profileData.profiles.filter((p) => p.id !== charId);
      const nextActiveId =
        profileData.activeId === charId ? remainingProfiles[0]?.id : profileData.activeId;

      setProfileData({
        profiles: remainingProfiles,
        activeId: nextActiveId,
      });

      if (supabase && user) {
        deleteCloudCharacter(supabase, user.id, charId);
      }

      showToast(`Deleted ${deletedChar?.name || 'character'}`, 'info');
    },
    [profileData, supabase, user, showToast]
  );

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

  const handleDeleteHomebrewSpell = useCallback((spellId) => {
    const spell = homebrewSpells.find((s) => s.id === spellId);
    setHomebrewSpells((prev) => prev.filter((s) => s.id !== spellId));

    // Also remove from all character profiles if they have it added
    setProfileData((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => ({
        ...p,
        spells: (p.spells || []).filter((s) => s.id !== spellId),
      })),
    }));

    showToast(`Deleted homebrew spell${spell ? `: ${spell.name}` : ''}`, 'info');
  }, [homebrewSpells, showToast]);

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

      const shouldCopy = isWizardCharacter(activeCharacter) && spell.level > 0;
      const updatedSpells = [
        ...(activeCharacter.spells || []),
        { id: spellId, prepared: spell.level === 0, copying: shouldCopy },
      ];

      updateActiveCharacter({
        ...activeCharacter,
        spells: updatedSpells,
      });

      showToast(
        shouldCopy ? `Added ${spell.name} to spellbook (Copying)` : `Added ${spell.name} to spellbook`,
        'success'
      );
    },
    [activeCharacter, catalogMap, updateActiveCharacter, showToast]
  );

  const handleFinishCopying = useCallback(
    (spellId) => {
      if (!activeCharacter) return;
      const spell = catalogMap[spellId];
      const updatedSpells = (activeCharacter.spells || []).map((s) =>
        s.id === spellId ? { ...s, copying: false } : s
      );
      updateActiveCharacter({
        ...activeCharacter,
        spells: updatedSpells,
      });
      if (spell) {
        showToast(`Finished copying ${spell.name}`, 'success');
      }
    },
    [activeCharacter, catalogMap, updateActiveCharacter, showToast]
  );

  const handleFinishCopyingAll = useCallback(() => {
    if (!activeCharacter) return;
    const updatedSpells = (activeCharacter.spells || []).map((s) =>
      s.copying ? { ...s, copying: false } : s
    );
    updateActiveCharacter({
      ...activeCharacter,
      spells: updatedSpells,
    });
    showToast('Finished copying all spells!', 'success');
  }, [activeCharacter, updateActiveCharacter, showToast]);

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
    (level, explicitUsed) => {
      if (!activeCharacter) return;
      const currentUsed = activeCharacter.slotsUsed?.[level] || 0;
      const nextUsed = typeof explicitUsed === 'number' ? explicitUsed : currentUsed + 1;
      updateActiveCharacter({
        ...activeCharacter,
        slotsUsed: {
          ...activeCharacter.slotsUsed,
          [level]: nextUsed,
        },
      });
    },
    [activeCharacter, updateActiveCharacter]
  );

  const handleRestoreSlot = useCallback(
    (level, explicitUsed) => {
      if (!activeCharacter) return;
      const currentUsed = activeCharacter.slotsUsed?.[level] || 0;
      const nextUsed = typeof explicitUsed === 'number' ? explicitUsed : Math.max(0, currentUsed - 1);
      updateActiveCharacter({
        ...activeCharacter,
        slotsUsed: {
          ...activeCharacter.slotsUsed,
          [level]: nextUsed,
        },
      });
    },
    [activeCharacter, updateActiveCharacter]
  );

  const handleSetSlotsUsed = useCallback(
    (level, used) => {
      if (!activeCharacter) return;
      updateActiveCharacter({
        ...activeCharacter,
        slotsUsed: {
          ...activeCharacter.slotsUsed,
          [level]: Math.max(0, used),
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

  const handleResetMaxSlot = useCallback(
    (level) => {
      if (!activeCharacter) return;
      const nextCustom = { ...activeCharacter.customSlots };
      delete nextCustom[level];
      updateActiveCharacter({
        ...activeCharacter,
        customSlots: nextCustom,
      });
    },
    [activeCharacter, updateActiveCharacter]
  );

  const handleUsePactSlot = useCallback(() => {
    if (!activeCharacter) return;
    const currentUsed = activeCharacter.pactSlotsUsed || 0;
    updateActiveCharacter({
      ...activeCharacter,
      pactSlotsUsed: currentUsed + 1,
    });
  }, [activeCharacter, updateActiveCharacter]);

  const handleRestorePactSlot = useCallback(() => {
    if (!activeCharacter) return;
    const currentUsed = activeCharacter.pactSlotsUsed || 0;
    updateActiveCharacter({
      ...activeCharacter,
      pactSlotsUsed: Math.max(0, currentUsed - 1),
    });
  }, [activeCharacter, updateActiveCharacter]);

  const handleSetPactSlotsUsed = useCallback(
    (used) => {
      if (!activeCharacter) return;
      updateActiveCharacter({
        ...activeCharacter,
        pactSlotsUsed: Math.max(0, used),
      });
    },
    [activeCharacter, updateActiveCharacter]
  );

  const handleLongRest = useCallback(() => {
    if (!activeCharacter) return;
    updateActiveCharacter({
      ...activeCharacter,
      slotsUsed: {},
      pactSlotsUsed: 0,
    });
    showToast('Long Rest completed: All spell slots restored!', 'success');
  }, [activeCharacter, updateActiveCharacter, showToast]);

  const handleShortRest = useCallback(() => {
    if (!activeCharacter) return;
    const classes = activeCharacter.classes || [{ className: activeCharacter.className, level: activeCharacter.level }];
    const hasWarlock = classes.some((c) => c.className === 'Warlock');
    if (hasWarlock || activeCharacter.className === 'Warlock') {
      updateActiveCharacter({
        ...activeCharacter,
        pactSlotsUsed: 0,
        // Also restore standard slots if pure Warlock without pactSlotsUsed yet
        slotsUsed: activeCharacter.className === 'Warlock' ? {} : activeCharacter.slotsUsed,
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
        activeCharacter.customSlots,
        activeCharacter
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
    <div className="flex flex-col h-screen w-full max-w-full overflow-x-hidden bg-dnd-bg text-slate-200">
      {/* Toast Banner */}
      {toast && (
        <div className="fixed top-3 right-4 z-50 flex items-center space-x-2 px-4 py-2.5 rounded-lg shadow-2xl text-xs font-semibold animate-in fade-in slide-in-from-top-2 bg-dnd-card">
          {toast.type === 'success' && <CheckCircle2 size={16} className="text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle size={16} className="text-red-400" />}
          {toast.type === 'info' && <Sparkles size={16} className="text-dnd-gold" />}
          <span className="text-slate-100">{toast.message}</span>
        </div>
      )}

      {/* Main Dual-Pane Body */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Pane: Spell Catalog with Integrated Branding Header */}
        <section className="w-full md:w-1/2 flex flex-col min-h-0 p-3 sm:p-4 overflow-hidden bg-dnd-panel/40">
          {/* Integrated Header */}
          <div className="flex items-center justify-between pb-2 mb-2 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-dnd-card/70 flex items-center justify-center p-1">
                <MythallarLogo className="w-8 h-8 max-w-none max-h-none" />
              </div>
              <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
                <h1 className="text-base sm:text-lg font-bold text-dnd-ivory tracking-tight font-display">
                  Mythallar
                </h1>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] text-dnd-gold font-medium px-1.5 py-0.5 rounded bg-dnd-gold/10">
                    DnD 5e Spellbook
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono tracking-tight select-none">
                    v{__APP_VERSION__}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              aria-label="Open settings"
              title="Appearance & Theme Settings"
              className="p-1.5 rounded-lg bg-dnd-card/60 hover:bg-dnd-card hover:text-white text-slate-400 transition-colors flex items-center justify-center"
            >
              <Settings size={15} />
            </button>
          </div>

          <FilterBar
            filters={filters}
            onChange={setFilters}
            onOpenHomebrewSpellModal={() => setIsHomebrewSpellModalOpen(true)}
            availableSources={availableSources}
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
              onDeleteHomebrew={handleDeleteHomebrewSpell}
            />
          )}
        </section>

        {/* Right Pane: Character Spellbook & Slots (Scrollable Container) */}
        <section className="w-full md:w-1/2 flex flex-col min-h-0 p-3 sm:p-4 overflow-hidden bg-dnd-panel/5">
          <CharacterHeader
            activeCharacter={activeCharacter}
            profiles={profiles}
            onUpdateCharacter={updateActiveCharacter}
            onSelectProfile={handleSelectProfile}
            onCreateProfile={handleCreateProfile}
            onDeleteProfile={handleDeleteCharacter}
            onExport={handleExport}
            onImport={handleImport}
            user={user}
            syncStatus={syncStatus}
            onSignIn={handleSignIn}
            onSignOut={handleSignOut}
            onSyncNow={handleManualSyncNow}
          />

          <SpellSlotTracker
            character={activeCharacter}
            onUseSlot={handleUseSlot}
            onRestoreSlot={handleRestoreSlot}
            onSetSlotsUsed={handleSetSlotsUsed}
            onUsePactSlot={handleUsePactSlot}
            onRestorePactSlot={handleRestorePactSlot}
            onSetPactSlotsUsed={handleSetPactSlotsUsed}
            onUpdateMaxSlot={handleUpdateMaxSlot}
            onResetMaxSlot={handleResetMaxSlot}
            onLongRest={handleLongRest}
            onShortRest={handleShortRest}
            onUpdateCharacter={updateActiveCharacter}
          />

          <div className="flex-1 min-h-[300px] flex flex-col">
            <SpellbookView
              character={activeCharacter}
              catalog={catalogMap}
              onTogglePrepare={handleTogglePrepare}
              onFinishCopying={handleFinishCopying}
              onFinishCopyingAll={handleFinishCopyingAll}
              onCastSpell={handleCastSpell}
              onRemoveSpell={handleRemoveSpell}
              onAddSpell={handleAddSpell}
              onUpdateCharacter={updateActiveCharacter}
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

      {/* Settings & Theme Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        activeThemeId={activeThemeId}
        onSelectTheme={handleSelectTheme}
      />
    </div>
  );
}
