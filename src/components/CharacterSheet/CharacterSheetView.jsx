import React from 'react';
import VitalsCard from './VitalsCard';
import AbilitiesCard from './AbilitiesCard';
import ResourcesCard from './ResourcesCard';
import ItemsCard from './ItemsCard';
import { getProficiencyBonus } from '../../utils/dndCalculations';
import { createDefaultSheet } from '../../utils/storage';

export default function CharacterSheetView({ character, onUpdateCharacter }) {
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

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Sticky Top Character Quick Info Banner */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 flex-shrink-0 text-xs">
        <div className="flex items-center space-x-2 truncate">
          <span className="font-bold text-dnd-gold tracking-wide uppercase truncate">
            {character.name || 'Unnamed Adventurer'}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">
            {character.className || 'Adventurer'} (Level {safeLevel})
          </span>
          <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-medium text-[10px] flex-shrink-0">
            Proficiency +{profBonus}
          </span>
        </div>
      </div>

      {/* Scrollable Modular Card Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 custom-scroll pr-1 pb-4">
        {/* Card 1: Vitals & Formulas */}
        <VitalsCard
          vitals={sheet.vitals}
          onUpdateVitals={(vitals) => updateSheet({ vitals })}
        />

        {/* Card 2: Abilities & Saves */}
        <AbilitiesCard
          abilities={sheet.abilities}
          level={safeLevel}
          onUpdateAbilities={(abilities) => updateSheet({ abilities })}
        />

        {/* Card 3: Tracked Resources & Notes */}
        <ResourcesCard
          trackedResources={sheet.trackedResources}
          featuresNotes={sheet.featuresNotes}
          onUpdateResources={(trackedResources) => updateSheet({ trackedResources })}
          onUpdateNotes={(featuresNotes) => updateSheet({ featuresNotes })}
        />

        {/* Card 4: Items & Attunements */}
        <ItemsCard
          items={sheet.items}
          maxAttunement={sheet.maxAttunement ?? 3}
          onUpdateItems={(items) => updateSheet({ items })}
        />
      </div>
    </div>
  );
}
