import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { clean5eText, parseEntries } from '../src/utils/textCleaner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/main/data';
const OUTPUT_FILE = path.resolve(__dirname, '../public/data/classes.json');

const CORE_CLASSES = [
  'barbarian',
  'bard',
  'cleric',
  'druid',
  'fighter',
  'monk',
  'paladin',
  'ranger',
  'rogue',
  'sorcerer',
  'warlock',
  'wizard',
  'artificer',
];

const SKILL_CHOICES_BY_CLASS = {
  Barbarian: { count: 2, from: ['animalHandling', 'athletics', 'intimidation', 'nature', 'perception', 'survival'] },
  Bard: { count: 3, from: 'all' },
  Cleric: { count: 2, from: ['history', 'insight', 'medicine', 'persuasion', 'religion'] },
  Druid: { count: 2, from: ['arcana', 'animalHandling', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'] },
  Fighter: { count: 2, from: ['acrobatics', 'animalHandling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'] },
  Monk: { count: 2, from: ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth'] },
  Paladin: { count: 2, from: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'] },
  Ranger: { count: 3, from: ['animalHandling', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival'] },
  Rogue: { count: 4, from: ['acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'perception', 'performance', 'persuasion', 'sleightOfHand', 'stealth'] },
  Sorcerer: { count: 2, from: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'] },
  Warlock: { count: 2, from: ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion'] },
  Wizard: { count: 2, from: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'religion'] },
  Artificer: { count: 2, from: ['arcana', 'history', 'investigation', 'medicine', 'nature', 'perception', 'sleightOfHand'] },
};

const CLASS_DESCRIPTIONS = {
  Barbarian: 'A fierce warrior of primitive background who can enter a battle rage.',
  Bard: 'An inspiring magician whose power echoes the music of creation.',
  Cleric: 'A priestly champion who wields divine magic in service of a higher power.',
  Druid: 'A priest of the Old Faith, wielding the powers of nature and adopting animal forms.',
  Fighter: 'A master of martial combat, skilled with a variety of weapons and armor.',
  Monk: 'A master of martial arts, harnessing the power of the body in pursuit of physical and spiritual perfection.',
  Paladin: 'A holy warrior bound to a sacred oath.',
  Ranger: 'A warrior who combats threats on the edges of civilization.',
  Rogue: 'A scoundrel who uses stealth and trickery to overcome obstacles and enemies.',
  Sorcerer: 'A spellcaster who draws on inherent magic from a gift or bloodline.',
  Warlock: 'A wielder of magic that is derived from a bargain with an extraplanar entity.',
  Wizard: 'A scholarly magic-user capable of manipulating the structures of reality.',
  Artificer: 'A master of invention, utilizing ingenuity and magic to unlock wondrous capabilities in objects.',
};

const ALLOWED_SUBCLASS_SOURCES = new Set([
  'XPHB', 'PHB', 'DMG', 'SCAG', 'XGE', 'TCE', 'BGG', 'VRGR', 'EGW', 'FTD', 'DSotDQ', 'PSA', 'PSK',
]);

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.json();
}

async function run() {
  console.log('Fetching comprehensive class data from 5etools mirror (main branch)...');
  const results = [];

  for (const slug of CORE_CLASSES) {
    try {
      const data = await fetchJSON(`${BASE_URL}/class/class-${slug}.json`);
      const rawClasses = data.class || [];
      const rawFeatures = data.classFeature || [];
      const rawSubclasses = data.subclass || [];
      const rawSubclassFeatures = data.subclassFeature || [];

      // Look for 2024 (XPHB) and 2014 (PHB/TCE)
      for (const cls of rawClasses) {
        if (cls.source !== 'XPHB' && cls.source !== 'PHB' && !(slug === 'artificer' && cls.source === 'TCE')) continue;
        const edition = cls.source === 'XPHB' ? '2024' : '2014';
        const hitDie = cls.hd?.faces || 8;
        const className = cls.name;

        // Level 1 features
        const lvl1Features = rawFeatures
          .filter((f) => f.className === className && f.level === 1 && (f.source === cls.source || (cls.source === 'TCE' && f.source === 'TCE')))
          .map((f) => ({
            name: clean5eText(f.name),
            description: clean5eText(parseEntries(f.entries).join('\n\n')),
          }));

        // Starting equipment description
        const eqEntries = cls.startingEquipment?.entries || [];
        const cleanEquipmentText = clean5eText(parseEntries(eqEntries).join('\n\n'));

        // Proficiencies
        const savingThrows = (cls.proficiency || []).map((s) => s.toLowerCase());
        const startingProf = cls.startingProficiencies || {};
        const armor = Array.isArray(startingProf.armor)
          ? startingProf.armor
              .map((a) => (typeof a === 'string' ? clean5eText(a).toLowerCase() : (a?.proficiency ? clean5eText(a.proficiency).toLowerCase() : '')))
              .filter(Boolean)
          : [];
        const weapons = Array.isArray(startingProf.weapons)
          ? startingProf.weapons
              .map((w) => (typeof w === 'string' ? clean5eText(w).toLowerCase() : (w?.proficiency ? clean5eText(w.proficiency).toLowerCase() : '')))
              .filter(Boolean)
          : [];

        const primaryAbility = (cls.primaryAbility || [])
          .map((p) => (typeof p === 'string' ? p.toLowerCase() : Object.keys(p)[0]?.toLowerCase()))
          .filter(Boolean);

        // Filter subclasses appropriate for this class and edition from official sources
        const targetClassSource = edition === '2024'
          ? (slug === 'artificer' ? 'TCE' : 'XPHB')
          : (slug === 'artificer' ? 'TCE' : 'PHB');

        const classSubs = [];
        const seenSubsForEdition = new Set();
        for (const s of rawSubclasses) {
          if (!s.name || !ALLOWED_SUBCLASS_SOURCES.has(s.source)) continue;
          if (s.classSource !== targetClassSource) continue;
          const key = `${s.name}|${s.source}`;
          if (seenSubsForEdition.has(key)) continue;
          seenSubsForEdition.add(key);

          const subFeatures = rawSubclassFeatures
            .filter((f) => {
              if (f.subclassShortName !== s.shortName) return false;
              if (f.subclassSource && f.subclassSource !== s.source) return false;
              if (!f.subclassSource && s.source !== 'PHB') return false;
              if (f.isClassFeatureVariant) return false;
              return true;
            })
            .map((f) => ({
              name: clean5eText(f.name),
              level: f.level,
              description: clean5eText(parseEntries(f.entries).join('\n\n')),
            }))
            .filter((f) => f.description.trim().length > 0);

          classSubs.push({
            id: `${slug}-${s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${s.source.toLowerCase()}`,
            name: clean5eText(s.name),
            shortName: s.shortName ? clean5eText(s.shortName) : clean5eText(s.name),
            source: s.source,
            edition: s.source === 'XPHB' ? '2024' : '2014',
            isLegacy: s.source !== 'XPHB',
            spellcastingAbility: s.spellcastingAbility?.toLowerCase() || null,
            casterProgression: s.casterProgression || null,
            features: subFeatures,
          });
        }

        // Sort: modern (2024 / XPHB) first if 2024 edition, then alphabetical by name
        classSubs.sort((a, b) => {
          if (edition === '2024') {
            if (a.source === 'XPHB' && b.source !== 'XPHB') return -1;
            if (b.source === 'XPHB' && a.source !== 'XPHB') return 1;
          }
          return a.name.localeCompare(b.name);
        });

        const classRecord = {
          id: `${className.toLowerCase()}-${edition}`,
          name: className,
          edition,
          source: cls.source,
          hitDie,
          hitDieString: `d${hitDie}`,
          primaryAbility: primaryAbility.length > 0 ? primaryAbility : (cls.spellcastingAbility ? [cls.spellcastingAbility.toLowerCase()] : ['str']),
          savingThrows,
          armorProficiencies: armor,
          weaponProficiencies: weapons,
          skillChoices: SKILL_CHOICES_BY_CLASS[className] || { count: 2, from: [] },
          spellcastingAbility: cls.spellcastingAbility?.toLowerCase() || null,
          hasSpellcasting: Boolean(cls.spellcastingAbility),
          level1Features: lvl1Features.length > 0 ? lvl1Features : [{ name: `${className} Training`, description: `Core Level 1 ${className} traits.` }],
          subclasses: classSubs,
          equipmentText: cleanEquipmentText || 'Standard class starting equipment or starting wealth.',
          description: CLASS_DESCRIPTIONS[className] || `${className} class for D&D 5e.`,
        };

        results.push(classRecord);

        // If Artificer (TCE), ALSO produce a 2024-compatible class entry so 2024 builder users can play Artificer!
        if (slug === 'artificer' && edition === '2014') {
          results.push({
            ...classRecord,
            id: 'artificer-2024',
            edition: '2024',
          });
        }
      }
    } catch (err) {
      console.warn(`Failed to process class ${slug}:`, err.message);
    }
  }

  // Sort by name then edition descending (2024 first)
  results.sort((a, b) => a.name.localeCompare(b.name) || b.edition.localeCompare(a.edition));

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`Saved ${results.length} classes with subclasses to ${OUTPUT_FILE}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
