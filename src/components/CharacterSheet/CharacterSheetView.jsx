import React, { useState } from 'react';
import {
  Swords,
  Pyramid,
  Eye,
  Award,
  Flame,
  Backpack,
  Search,
  RotateCcw,
  Plus,
  Settings2,
  Check,
  NotebookPen,
  Blend,
  ChevronDown,
  Waypoints,
} from 'lucide-react';
import AccordionSection from '../Common/AccordionSection';
import CharacterSheetHeader from './CharacterSheetHeader';
import VitalsCard from './VitalsCard';
import AbilitiesCard from './AbilitiesCard';
import SkillsCard from './SkillsCard';
import ProficienciesCard from './ProficienciesCard';
import ResourcesCard from './ResourcesCard';
import ItemsCard, { MaxAttunementInput } from './ItemsCard';
import NotesCard from './NotesCard';
import { getProficiencyBonus } from '../../utils/dndCalculations';
import { createDefaultSheet } from '../../utils/storage';

function CharacterSheetView({
  character,
  profiles = [],
  isActive = true,
  onUpdateCharacter,
  onSelectProfile,
  onCreateProfile,
  onDeleteProfile,
  onExport,
  onImport,
  user = null,
  syncStatus = 'idle',
  onSignIn,
  onSignOut,
  onSyncNow,
  onShortRest,
  onShowToast,
}) {
  const [skillsFilter, setSkillsFilter] = useState('');
  const [isEditingVitals, setIsEditingVitals] = useState(false);
  const [isEditingAbilities, setIsEditingAbilities] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [isEditingProficiencies, setIsEditingProficiencies] = useState(false);
  const [isEditingResources, setIsEditingResources] = useState(false);
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [isAttuneMode, setIsAttuneMode] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [showItemFilters, setShowItemFilters] = useState(false);
  const [itemFilters, setItemFilters] = useState({ category: 'all', color: 'all' });
  const isItemFiltered = itemFilters.category !== 'all' || itemFilters.color !== 'all';

  // Track how far the sheet is scrolled in refs (zero re-renders during scroll) so when collapsing
  // Section 1 into Spell Library, we preserve the exact scrolled-up offset (or skip the close animation
  // if scrolled past Section 1), and restore that scroll position when returning to Character Sheet.
  const sheetScrollRef = React.useRef(null);
  const headerRef = React.useRef(null);
  const savedScrollTopRef = React.useRef(0);
  const headerHeightRef = React.useRef(120);
  const isRestoringScrollRef = React.useRef(false);

  React.useLayoutEffect(() => {
    if (isActive && sheetScrollRef.current) {
      const targetScroll = savedScrollTopRef.current;
      isRestoringScrollRef.current = true;
      sheetScrollRef.current.scrollTop = targetScroll;
      headerHeightRef.current = headerRef.current?.offsetHeight || 120;
      isRestoringScrollRef.current = false;
    }
  }, [isActive]);

  if (!character) {
    if (!isActive) return null;
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

  const handleSheetScroll = (e) => {
    if (!isActive || isRestoringScrollRef.current) return;
    savedScrollTopRef.current = e.currentTarget.scrollTop;
    headerHeightRef.current = headerRef.current?.lastChild?.offsetHeight || headerRef.current?.offsetHeight || 120;
  };

  const savedScrollTop = savedScrollTopRef.current;
  const isHeaderVisible = savedScrollTop < headerHeightRef.current;

  return (
    <div className={isActive ? 'flex-1 flex flex-col min-h-0 overflow-hidden' : 'flex-shrink-0 overflow-hidden'}>
      <div
        ref={sheetScrollRef}
        onScroll={isActive ? handleSheetScroll : undefined}
        className={
          isActive
            ? 'flex-1 min-h-0 overflow-y-auto space-y-2.5 custom-scroll [scrollbar-gutter:stable] p-1 pr-1.5 pb-0 [overflow-anchor:none]'
            : 'custom-scroll [scrollbar-gutter:stable] px-1 pr-1.5 overflow-hidden [overflow-anchor:none]'
        }
      >
        {/* Section 1: Character Header Accordion (Animates open on Character Sheet, animates closed from its current scroll offset on Spell Library) */}
        <div
          ref={headerRef}
          data-testid="left-character-header-accordion"
          aria-hidden={!isActive}
          style={
            !isActive && isHeaderVisible && savedScrollTop > 0
              ? { marginTop: `-${savedScrollTop}px` }
              : undefined
          }
          className={`grid ${
            (isActive && savedScrollTop === 0) || (!isActive && isHeaderVisible)
              ? 'transition-[grid-template-rows,opacity] duration-300 ease-in-out'
              : 'duration-0'
          } ${
            isActive
              ? 'grid-rows-[1fr] opacity-100'
              : 'grid-rows-[0fr] opacity-0 mb-0 pointer-events-none'
          }`}
        >
          <div className="overflow-hidden">
            <CharacterSheetHeader
              character={character}
              profiles={profiles}
              onUpdateCharacter={onUpdateCharacter}
              onSelectProfile={onSelectProfile}
              onCreateProfile={onCreateProfile}
              onDeleteProfile={onDeleteProfile}
              onExport={onExport}
              onImport={onImport}
            />
          </div>
        </div>

        {isActive && (
          <>
        {/* Section 2: Combat Stats */}
        <AccordionSection
          title="Combat Stats"
          icon={Swords}
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
            onShowToast={onShowToast}
          />
        </AccordionSection>

        {/* Section 3: Features & Tracked Resources */}
        <AccordionSection
          title="Features & Tracked Resources"
          icon={Flame}
          defaultOpen={true}
          actions={
            <div className="flex flex-wrap items-center gap-1.5">
              {sheet.trackedResources && sheet.trackedResources.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetAllResources}
                  aria-label="Reset all resources"
                  title="Reset all resources to max"
                  className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-dnd-card hover:bg-dnd-hover text-slate-300 hover:text-white text-xs transition-colors cursor-pointer"
                >
                  <RotateCcw size={11} className="text-dnd-gold" />
                  <span className="text-[11px]">Reset</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsAddingResource((prev) => !prev)}
                className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-dnd-card hover:bg-dnd-hover text-dnd-gold hover:text-dnd-gold-light text-xs transition-colors cursor-pointer"
              >
                <Plus size={11} />
                <span className="text-[11px]">Add Resource</span>
              </button>
              {isEditingResources ? (
                <button
                  type="button"
                  aria-label="Done editing resources"
                  onClick={() => {
                    setIsEditingResources(false);
                    setIsAddingResource(false);
                  }}
                  className="p-1 rounded-md bg-dnd-gold text-slate-950 hover:bg-dnd-gold-light transition-colors shadow-sm cursor-pointer"
                  title="Done editing features and resources"
                >
                  <Check size={13} strokeWidth={2.5} />
                </button>
              ) : (
                <button
                  type="button"
                  aria-label="Edit resources"
                  onClick={() => setIsEditingResources(true)}
                  className="p-1 rounded-md bg-dnd-card hover:bg-dnd-hover text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title="Edit features and tracked resources"
                >
                  <Settings2 size={13} />
                </button>
              )}
            </div>
          }
        >
          <ResourcesCard
            trackedResources={sheet.trackedResources}
            featuresNotes={sheet.featuresNotes}
            feats={sheet.feats || []}
            isEditing={isEditingResources}
            isAdding={isAddingResource}
            onSetIsAdding={setIsAddingResource}
            hideHeaderActions={true}
            onUpdateResources={(trackedResources) => updateSheet({ trackedResources })}
            onUpdateNotes={(featuresNotes) => updateSheet({ featuresNotes })}
            onUpdateFeats={(feats) => updateSheet({ feats })}
          />
        </AccordionSection>

        {/* Section 4: Ability Scores & Saving Throws */}
        <AccordionSection
          title="Ability Scores & Saving Throws"
          icon={Pyramid}
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

        {/* Section 5: Skills & Senses */}
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

        {/* Section 6: Items & Inventory */}
        <AccordionSection
          title="Items & Inventory"
          icon={Backpack}
          defaultOpen={true}
          actions={
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                aria-label="Manage Attunement"
                onClick={() => setIsAttuneMode((prev) => !prev)}
                className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-lg text-xs transition-colors shadow-sm cursor-pointer ${
                  isAttuneMode
                    ? 'bg-dnd-gold text-slate-950 font-semibold shadow-sm'
                    : 'bg-dnd-card hover:bg-dnd-hover hover:ring-1 hover:ring-dnd-gold/40 text-slate-300'
                }`}
                title={isAttuneMode ? 'Finish managing attunement' : 'Click to manage attunement slots'}
              >
                <Waypoints size={11} className={isAttuneMode ? 'text-slate-950' : 'text-dnd-gold'} />
                <span className={`text-[11px] ${isAttuneMode ? 'text-slate-900 font-semibold' : 'text-slate-300'}`}>
                  Attune:
                </span>
                <span
                  className={`text-[11px] font-bold ${
                    isAttuneMode
                      ? 'text-slate-950'
                      : attunedCount > maxAttunement
                      ? 'text-red-400'
                      : 'text-dnd-gold'
                  }`}
                >
                  {attunedCount} /{' '}
                  {isAttuneMode ? (
                    <MaxAttunementInput
                      value={maxAttunement}
                      onChange={(val) => updateSheet({ maxAttunement: val })}
                    />
                  ) : (
                    maxAttunement
                  )}
                </span>
              </button>

              <button
                type="button"
                aria-label="Toggle Items Filters"
                onClick={() => setShowItemFilters((prev) => !prev)}
                className={`relative flex items-center space-x-1 bg-dnd-card rounded-lg px-2 py-0.5 text-xs transition-colors ${
                  isItemFiltered ? 'ring-1 ring-dnd-gold/50 text-slate-100' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Filter items in inventory"
              >
                <Blend size={11} className="text-dnd-gold" />
                <span className="text-[11px] font-semibold text-slate-200">Filters</span>
                <ChevronDown size={10} className={`text-slate-400 transition-transform duration-200 ${showItemFilters ? '' : '-rotate-90'}`} />
              </button>

              <button
                type="button"
                aria-label="Add Item"
                onClick={() => setIsAddingItem((prev) => !prev)}
                className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-dnd-card hover:bg-dnd-hover text-dnd-gold hover:text-dnd-gold-light text-xs transition-colors"
              >
                <Plus size={11} />
                <span className="text-[11px]">Add</span>
              </button>
            </div>
          }
        >
          <ItemsCard
            items={sheet.items}
            maxAttunement={maxAttunement}
            onUpdateMaxAttunement={(maxAttunement) => updateSheet({ maxAttunement })}
            isAttuneMode={isAttuneMode}
            onToggleAttuneMode={() => setIsAttuneMode((prev) => !prev)}
            isAdding={isAddingItem}
            onSetIsAdding={setIsAddingItem}
            showFilters={showItemFilters}
            onToggleFilters={() => setShowItemFilters((prev) => !prev)}
            filters={itemFilters}
            onFilterChange={setItemFilters}
            hideHeaderActions={true}
            onUpdateItems={(items) => updateSheet({ items })}
          />
        </AccordionSection>

        {/* Section 7: Proficiencies & Training */}
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

        {/* Section 8: Notes */}
        <AccordionSection
          title="Notes"
          icon={NotebookPen}
          defaultOpen={true}
        >
          <NotesCard
            notes={sheet.notes}
            onUpdateNotes={(notes) => updateSheet({ notes })}
          />
        </AccordionSection>
          </>
        )}
      </div>
    </div>
  );
}

export default React.memo(CharacterSheetView);
