import React, { useRef, useState } from 'react';
import {
  UserRound,
  Heart,
  Zap,
  Eye,
  Award,
  Sparkles,
  Package,
  Camera,
  User,
  Search,
  RotateCcw,
  Plus,
  Settings2,
  Check,
} from 'lucide-react';
import AccordionSection from '../Common/AccordionSection';
import VitalsCard from './VitalsCard';
import AbilitiesCard from './AbilitiesCard';
import SkillsCard from './SkillsCard';
import ProficienciesCard from './ProficienciesCard';
import ResourcesCard from './ResourcesCard';
import ItemsCard from './ItemsCard';
import { getProficiencyBonus } from '../../utils/dndCalculations';
import { createDefaultSheet } from '../../utils/storage';
import { compressImageFile } from '../../utils/imageCompressor';

export default function CharacterSheetView({ character, onUpdateCharacter, onShortRest }) {
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

  const [skillsFilter, setSkillsFilter] = useState('');
  const [isEditingVitals, setIsEditingVitals] = useState(false);
  const [isEditingAbilities, setIsEditingAbilities] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [isEditingProficiencies, setIsEditingProficiencies] = useState(false);
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [isAttuneMode, setIsAttuneMode] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);

  const safeItems = Array.isArray(sheet.items) ? sheet.items : [];
  const attunedCount = safeItems.filter((i) => i.requiresAttunement && i.attuned).length;
  const maxAttunement = sheet.maxAttunement ?? 3;

  const updateSheet = (sheetUpdates) => {
    onUpdateCharacter?.({
      ...character,
      sheet: {
        ...sheet,
        ...sheetUpdates,
      },
    });
  };

  const handleResetAllResources = () => {
    const updated = (sheet.trackedResources || []).map((res) => ({
      ...res,
      current: res.max ?? 0,
    }));
    updateSheet({ trackedResources: updated });
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
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 custom-scroll p-1 pr-1.5 pb-4">
        {/* Section 1: Character Identity */}
        <AccordionSection
          title="Character"
          icon={UserRound}
          defaultOpen={true}
        >
          <div className="p-2.5 sm:p-3 rounded-xl bg-dnd-card shadow-sm space-y-2 text-xs">
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
                </div>
                <div className="text-slate-300 text-xs">
                  {character.className || 'Adventurer'} (Level {safeLevel})
                </div>
              </div>
            </div>

            {/* Identity Metadata Fields (Race, Subclass, Background) */}
            <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-white/5 text-[11px]">
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
                  className="w-full px-2 py-0.5 rounded-lg bg-dnd-panel text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-white/20"
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
                  className="w-full px-2 py-0.5 rounded-lg bg-dnd-panel text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-white/20"
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
                  className="w-full px-2 py-0.5 rounded-lg bg-dnd-panel text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-white/20"
                />
              </div>
            </div>
          </div>
        </AccordionSection>

        {/* Section 2: Combat Stats */}
        <AccordionSection
          title="Combat Stats"
          icon={Heart}
          defaultOpen={true}
          actions={
            isEditingVitals ? (
              <button
                type="button"
                aria-label="Done editing vitals"
                onClick={() => setIsEditingVitals(false)}
                className="p-1 rounded-md bg-dnd-gold text-slate-950 hover:bg-dnd-gold-light transition-colors shadow-sm cursor-pointer"
                title="Done editing combat vitals"
              >
                <Check size={13} strokeWidth={2.5} />
              </button>
            ) : (
              <button
                type="button"
                aria-label="Edit vitals"
                onClick={() => setIsEditingVitals(true)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors cursor-pointer"
                title="Edit combat vitals"
              >
                <Settings2 size={13} />
              </button>
            )
          }
        >
          <VitalsCard
            vitals={sheet.vitals}
            dexScore={sheet.abilities?.dex ?? 10}
            conScore={sheet.abilities?.con ?? 10}
            classes={character.classes || [{ className: character.className, level: character.level }]}
            isEditing={isEditingVitals}
            onUpdateVitals={(vitals) => updateSheet({ vitals })}
            onShortRest={onShortRest}
          />
        </AccordionSection>

        {/* Section 3: Ability Scores & Saving Throws */}
        <AccordionSection
          title="Ability Scores & Saving Throws"
          icon={Zap}
          badge={
            <span className="px-2 py-0.5 rounded-lg bg-dnd-card text-[11px] text-slate-400">
              Proficiency <span className="font-semibold text-dnd-gold">+{profBonus}</span>
            </span>
          }
          defaultOpen={true}
          actions={
            isEditingAbilities ? (
              <button
                type="button"
                aria-label="Done editing abilities"
                onClick={() => setIsEditingAbilities(false)}
                className="p-1 rounded-md bg-dnd-gold text-slate-950 hover:bg-dnd-gold-light transition-colors shadow-sm"
                title="Done editing ability scores and saving throws"
              >
                <Check size={13} strokeWidth={2.5} />
              </button>
            ) : (
              <button
                type="button"
                aria-label="Edit abilities"
                onClick={() => setIsEditingAbilities(true)}
                className="p-1 rounded-md bg-dnd-card hover:bg-dnd-hover text-slate-400 hover:text-slate-200 transition-colors"
                title="Edit ability scores and saving throws"
              >
                <Settings2 size={13} />
              </button>
            )
          }
        >
          <AbilitiesCard
            abilities={sheet.abilities}
            level={safeLevel}
            isEditing={isEditingAbilities}
            onUpdateAbilities={(abilities) => updateSheet({ abilities })}
          />
        </AccordionSection>

        {/* Section 4: Skills & Senses */}
        <AccordionSection
          title="Skills & Senses"
          icon={Eye}
          defaultOpen={true}
          actions={
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <Search size={11} className="absolute left-1.5 top-1.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter skills..."
                  value={skillsFilter}
                  onChange={(e) => setSkillsFilter(e.target.value)}
                  className="pl-5 pr-2 py-0.5 rounded-lg bg-dnd-card text-[11px] text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-white/20 w-28 sm:w-36"
                />
              </div>
              {isEditingSkills ? (
                <button
                  type="button"
                  aria-label="Done editing skills"
                  onClick={() => setIsEditingSkills(false)}
                  className="p-1 rounded-md bg-dnd-gold text-slate-950 hover:bg-dnd-gold-light transition-colors shadow-sm"
                  title="Done editing skills and senses"
                >
                  <Check size={13} strokeWidth={2.5} />
                </button>
              ) : (
                <button
                  type="button"
                  aria-label="Edit skills"
                  onClick={() => setIsEditingSkills(true)}
                  className="p-1 rounded-md bg-dnd-card hover:bg-dnd-hover text-slate-400 hover:text-slate-200 transition-colors"
                  title="Edit skills and senses"
                >
                  <Settings2 size={13} />
                </button>
              )}
            </div>
          }
        >
          <SkillsCard
            abilities={sheet.abilities}
            skills={sheet.skills}
            level={safeLevel}
            senses={sheet.senses}
            filterQuery={skillsFilter}
            hideSearch={true}
            isEditing={isEditingSkills}
            onUpdateSkills={(skills) => updateSheet({ skills })}
            onUpdateSenses={(senses) => updateSheet({ senses })}
          />
        </AccordionSection>

        {/* Section 5: Proficiencies & Training */}
        <AccordionSection
          title="Proficiencies & Training"
          icon={Award}
          defaultOpen={true}
          actions={
            isEditingProficiencies ? (
              <button
                type="button"
                aria-label="Done editing proficiencies"
                onClick={() => setIsEditingProficiencies(false)}
                className="p-1 rounded-md bg-dnd-gold text-slate-950 hover:bg-dnd-gold-light transition-colors shadow-sm"
                title="Done editing proficiencies and training"
              >
                <Check size={13} strokeWidth={2.5} />
              </button>
            ) : (
              <button
                type="button"
                aria-label="Edit proficiencies"
                onClick={() => setIsEditingProficiencies(true)}
                className="p-1 rounded-md bg-dnd-card hover:bg-dnd-hover text-slate-400 hover:text-slate-200 transition-colors"
                title="Edit proficiencies and training"
              >
                <Settings2 size={13} />
              </button>
            )
          }
        >
          <ProficienciesCard
            proficiencies={sheet.proficiencies}
            isEditing={isEditingProficiencies}
            onUpdateProficiencies={(proficiencies) => updateSheet({ proficiencies })}
          />
        </AccordionSection>

        {/* Section 6: Features & Tracked Resources */}
        <AccordionSection
          title="Features & Tracked Resources"
          icon={Sparkles}
          defaultOpen={true}
          actions={
            <div className="flex flex-wrap items-center gap-1.5">
              {sheet.trackedResources && sheet.trackedResources.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetAllResources}
                  aria-label="Reset all resources"
                  title="Reset all resources to max"
                  className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-dnd-card hover:bg-dnd-hover text-slate-300 hover:text-white text-xs transition-colors"
                >
                  <RotateCcw size={11} className="text-dnd-gold" />
                  <span className="text-[11px]">Reset</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsAddingResource((prev) => !prev)}
                className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-dnd-card hover:bg-dnd-hover text-dnd-gold hover:text-dnd-gold-light text-xs transition-colors"
              >
                <Plus size={11} />
                <span className="text-[11px]">Add Resource</span>
              </button>
            </div>
          }
        >
          <ResourcesCard
            trackedResources={sheet.trackedResources}
            featuresNotes={sheet.featuresNotes}
            isAdding={isAddingResource}
            onSetIsAdding={setIsAddingResource}
            hideHeaderActions={true}
            onUpdateResources={(trackedResources) => updateSheet({ trackedResources })}
            onUpdateNotes={(featuresNotes) => updateSheet({ featuresNotes })}
          />
        </AccordionSection>

        {/* Section 7: Items & Inventory */}
        <AccordionSection
          title="Items & Inventory"
          icon={Package}
          defaultOpen={true}
          actions={
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-dnd-card text-xs shadow-sm">
                <span className="text-[11px] text-slate-400">Attuned:</span>
                <span
                  className={`text-[11px] font-semibold ${
                    attunedCount > maxAttunement ? 'text-red-400' : 'text-dnd-gold'
                  }`}
                >
                  {attunedCount} / {maxAttunement}
                </span>
              </div>

              <button
                type="button"
                aria-label="Manage Attunement"
                onClick={() => setIsAttuneMode((prev) => !prev)}
                className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-lg text-xs transition-colors ${
                  isAttuneMode
                    ? 'bg-dnd-gold text-slate-950 font-medium'
                    : 'bg-dnd-card hover:bg-dnd-hover text-slate-300 hover:text-white'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isAttuneMode ? 'bg-slate-950 animate-pulse' : 'bg-dnd-gold'
                  }`}
                />
                <span className="text-[11px]">{isAttuneMode ? 'Finish Attuning' : 'Manage Attunement'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddingItem((prev) => !prev)}
                className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-dnd-card hover:bg-dnd-hover text-dnd-gold hover:text-dnd-gold-light text-xs transition-colors"
              >
                <Plus size={11} />
                <span className="text-[11px]">+ Add Item</span>
              </button>
            </div>
          }
        >
          <ItemsCard
            items={sheet.items}
            maxAttunement={maxAttunement}
            isAttuneMode={isAttuneMode}
            onToggleAttuneMode={() => setIsAttuneMode((prev) => !prev)}
            isAdding={isAddingItem}
            onSetIsAdding={setIsAddingItem}
            hideHeaderActions={true}
            onUpdateItems={(items) => updateSheet({ items })}
          />
        </AccordionSection>
      </div>
    </div>
  );
}
