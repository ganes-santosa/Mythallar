import React, { useRef } from 'react';
import { Camera, User } from 'lucide-react';
import VitalsCard from './VitalsCard';
import AbilitiesCard from './AbilitiesCard';
import SkillsCard from './SkillsCard';
import ProficienciesCard from './ProficienciesCard';
import ResourcesCard from './ResourcesCard';
import ItemsCard from './ItemsCard';
import { getProficiencyBonus } from '../../utils/dndCalculations';
import { createDefaultSheet } from '../../utils/storage';
import { compressImageFile } from '../../utils/imageCompressor';

export default function CharacterSheetView({ character, onUpdateCharacter }) {
  const fileInputRef = useRef(null);

  if (!character) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 text-sm">
        <p className="font-medium text-slate-300 mb-1">No character selected</p>
        <p className="text-xs text-slate-500">
          Select or create a character to view and manage their character sheet.
        </p>
      </div>
    );
  }

  const sheet = character.sheet || createDefaultSheet(character.className);
  const identity = sheet.identity || { race: '', subclass: '', background: '', portrait: '' };
  const safeLevel = Number(character.level) || 1;
  const profBonus = getProficiencyBonus(safeLevel);

  const updateSheet = (sheetUpdates) => {
    onUpdateCharacter?.({
      ...character,
      sheet: {
        ...sheet,
        ...sheetUpdates,
      },
    });
  };

  const handleIdentityChange = (field, value) => {
    updateSheet({
      identity: {
        ...identity,
        [field]: value,
      },
    });
  };

  const handlePortraitUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedDataUrl = await compressImageFile(file, 256, 0.85);
      if (compressedDataUrl) {
        handleIdentityChange('portrait', compressedDataUrl);
      }
    } catch (err) {
      console.error('Failed to compress avatar image', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Sticky Top Character Identity & Quick Info Banner */}
      <div className="p-2.5 mb-2 rounded-lg bg-dnd-card border border-white/5 flex-shrink-0 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            {/* Portrait avatar with compressed upload */}
            <div className="relative group flex-shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload character portrait"
                title="Click to upload portrait (auto-compressed to 256px WebP)"
                className="w-10 h-10 rounded-full border border-dnd-gold/40 bg-black/40 overflow-hidden flex items-center justify-center shadow-sm relative group"
              >
                {identity.portrait ? (
                  <img
                    src={identity.portrait}
                    alt={character.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={18} className="text-slate-400 group-hover:text-dnd-gold" />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={12} className="text-white" />
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                aria-label="Portrait file input"
                onChange={handlePortraitUpload}
                className="hidden"
              />
            </div>

            {/* Name & Class / Level summary */}
            <div className="min-w-0 truncate">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-dnd-gold text-sm tracking-wide uppercase truncate">
                  {character.name || 'Unnamed Adventurer'}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-medium text-[10px] flex-shrink-0">
                  Proficiency +{profBonus}
                </span>
              </div>
              <div className="text-slate-300 text-xs">
                {character.className || 'Adventurer'} (Level {safeLevel})
              </div>
            </div>
          </div>
        </div>

        {/* Identity Metadata Fields (Race, Subclass, Background) */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/5 text-[11px]">
          <div>
            <label htmlFor="id-race" className="block text-[9px] text-slate-400 mb-0.5">
              Race / Species
            </label>
            <input
              id="id-race"
              type="text"
              placeholder="e.g. High Elf"
              value={identity.race || ''}
              onChange={(e) => handleIdentityChange('race', e.target.value)}
              className="w-full px-1.5 py-0.5 rounded bg-black/20 border border-white/5 text-slate-200 text-xs focus:outline-none focus:border-dnd-gold"
            />
          </div>

          <div>
            <label htmlFor="id-subclass" className="block text-[9px] text-slate-400 mb-0.5">
              Subclass / Tradition
            </label>
            <input
              id="id-subclass"
              type="text"
              placeholder="e.g. Chronurgy"
              value={identity.subclass || ''}
              onChange={(e) => handleIdentityChange('subclass', e.target.value)}
              className="w-full px-1.5 py-0.5 rounded bg-black/20 border border-white/5 text-slate-200 text-xs focus:outline-none focus:border-dnd-gold"
            />
          </div>

          <div>
            <label htmlFor="id-background" className="block text-[9px] text-slate-400 mb-0.5">
              Background
            </label>
            <input
              id="id-background"
              type="text"
              placeholder="e.g. Sage"
              value={identity.background || ''}
              onChange={(e) => handleIdentityChange('background', e.target.value)}
              className="w-full px-1.5 py-0.5 rounded bg-black/20 border border-white/5 text-slate-200 text-xs focus:outline-none focus:border-dnd-gold"
            />
          </div>
        </div>
      </div>

      {/* Scrollable Modular Card Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 custom-scroll pr-1 pb-4">
        {/* Card 1: Vitals & Combat Math */}
        <VitalsCard
          vitals={sheet.vitals}
          dexScore={sheet.abilities?.dex ?? 10}
          onUpdateVitals={(vitals) => updateSheet({ vitals })}
        />

        {/* Card 2: Abilities & Saves */}
        <AbilitiesCard
          abilities={sheet.abilities}
          level={safeLevel}
          onUpdateAbilities={(abilities) => updateSheet({ abilities })}
        />

        {/* Card 3: Skills & Senses */}
        <SkillsCard
          abilities={sheet.abilities}
          skills={sheet.skills}
          level={safeLevel}
          senses={sheet.senses}
          onUpdateSkills={(skills) => updateSheet({ skills })}
          onUpdateSenses={(senses) => updateSheet({ senses })}
        />

        {/* Card 4: Proficiencies & Training */}
        <ProficienciesCard
          proficiencies={sheet.proficiencies}
          onUpdateProficiencies={(proficiencies) => updateSheet({ proficiencies })}
        />

        {/* Card 5: Tracked Resources & Notes */}
        <ResourcesCard
          trackedResources={sheet.trackedResources}
          featuresNotes={sheet.featuresNotes}
          onUpdateResources={(trackedResources) => updateSheet({ trackedResources })}
          onUpdateNotes={(featuresNotes) => updateSheet({ featuresNotes })}
        />

        {/* Card 6: Items & Attunements */}
        <ItemsCard
          items={sheet.items}
          maxAttunement={sheet.maxAttunement ?? 3}
          onUpdateItems={(items) => updateSheet({ items })}
        />
      </div>
    </div>
  );
}
