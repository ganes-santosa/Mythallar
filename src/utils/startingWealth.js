/**
 * Starting equipment and starting gold rules for 2014 and 2024 D&D 5e.
 *
 * 2014: starting wealth (rolled by class) replaces ALL class and background equipment.
 * 2024: class and background each choose a package or flat gold, independently.
 */

const WEALTH_DICE_2014 = {
  Monk: { count: 5, sides: 4, multiplier: 1 },
  Druid: { count: 2, sides: 4, multiplier: 10 },
  Barbarian: { count: 2, sides: 4, multiplier: 10 },
  Sorcerer: { count: 3, sides: 4, multiplier: 10 },
  Rogue: { count: 4, sides: 4, multiplier: 10 },
  Warlock: { count: 4, sides: 4, multiplier: 10 },
  Wizard: { count: 4, sides: 4, multiplier: 10 },
};
const DEFAULT_WEALTH_DICE = { count: 5, sides: 4, multiplier: 10 };

export function getWealthDice2014(className) {
  return WEALTH_DICE_2014[className] || DEFAULT_WEALTH_DICE;
}

export function formatWealthDice(dice) {
  return `${dice.count}d${dice.sides}${dice.multiplier > 1 ? ` × ${dice.multiplier}` : ''} gp`;
}

export function rollStartingWealth2014(className, rng = Math.random) {
  const dice = getWealthDice2014(className);
  const rolls = Array.from({ length: dice.count }, () => Math.floor(rng() * dice.sides) + 1);
  const total = rolls.reduce((a, b) => a + b, 0) * dice.multiplier;
  return { rolls, total, dice };
}

/**
 * Parses "Choose A or B: (A) item, item, and 8 GP; or (B) 50 GP" into
 * [{ key, items: string[], gp }]. Returns [] when the text is not structured.
 */
export function parseEquipmentOptions2024(text) {
  if (!text) return [];
  const re = /\(([A-Z])\)\s*([^;]*?)(?=;|$)/g;
  const options = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    let body = m[2].trim();
    let gp = 0;
    const gpMatch = body.match(/(?:,?\s*(?:and\s+)?)(\d+)\s*GP\s*$/i);
    if (gpMatch) {
      gp = Number(gpMatch[1]);
      body = body.slice(0, gpMatch.index).trim();
    }
    const items = body
      .split(',')
      .map((s) => s.trim().replace(/^and\s+/i, '').trim())
      .filter(Boolean);
    options.push({ key: m[1], items, gp });
  }
  return options;
}

export function parseBackgroundGp2014(text) {
  const m = (text || '').match(/containing\s+(\d+)\s*gp/i);
  return m ? Number(m[1]) : 0;
}

export function itemFromString(str, idSeed) {
  const q = str.match(/^(\d+)\s+(.+)$/);
  return {
    id: `item_${idSeed}`,
    name: q ? q[2] : str,
    category: 'Gear',
    quantity: q ? Number(q[1]) : 1,
    weight: 0,
  };
}
