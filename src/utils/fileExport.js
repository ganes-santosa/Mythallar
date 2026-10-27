/**
 * Validates and normalizes raw JSON string for an imported character profile.
 */
export function validateAndImportCharacterJSON(jsonString) {
  try {
    const data = JSON.parse(jsonString);

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return { error: 'Invalid JSON: Expected a character profile object.' };
    }

    if (!data.name || !data.className) {
      return { error: 'Missing required character fields (name, className).' };
    }

    const normalized = {
      id: data.id || `char_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: String(data.name).trim() || 'Imported Character',
      className: String(data.className).trim() || 'Wizard',
      level: Math.min(20, Math.max(1, Number(data.level) || 1)),
      spells: Array.isArray(data.spells)
        ? data.spells.map((s) => ({
            id: s.id,
            prepared: Boolean(s.prepared),
            copying: Boolean(s.copying),
          }))
        : [],
      slotsUsed: typeof data.slotsUsed === 'object' && data.slotsUsed !== null ? data.slotsUsed : {},
      customSlots: typeof data.customSlots === 'object' && data.customSlots !== null ? data.customSlots : {},
    };

    return { character: normalized };
  } catch (err) {
    return { error: `Invalid JSON format: ${err.message}` };
  }
}

/**
 * Triggers a browser download of the character profile as a .json file.
 */
export function exportCharacterJSON(character) {
  if (!character) return;

  const jsonStr = JSON.stringify(character, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const sanitizedName = (character.name || 'character')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-');
  const filename = `${sanitizedName}-spellbook.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
