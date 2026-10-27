/**
 * Strips 5etools custom tag formatting into human readable plain text.
 * Example: {@damage 1d6} -> 1d6, {@condition charmed} -> charmed, {@spell fireball|phb} -> fireball
 */
export function clean5eText(text) {
  if (!text) return '';
  if (typeof text !== 'string') return String(text);

  return text.replace(/\{@([a-zA-Z0-9_-]+)\s+([^}]+)\}/g, (match, tag, body) => {
    const parts = body.split('|');
    
    // Tag-specific rules
    switch (tag.toLowerCase()) {
      case 'dice':
        // {@dice 1d20+4|18} -> 18 if display specified, else 1d20+4
        return parts[1] || parts[0];
      case 'filter':
        // {@filter Large or smaller beast|bestiary|...} -> Large or smaller beast
        return parts[0];
      case 'damage':
      case 'scaledamage':
      case 'd20':
      case 'hit':
        return parts[0];
      case 'spell':
      case 'creature':
      case 'item':
      case 'condition':
      case 'sense':
      case 'skill':
      case 'action':
      case 'hazard':
      case 'object':
      case 'reward':
      case 'race':
      case 'class':
      case 'background':
      case 'feat':
      case 'optfeature':
        return parts[0];
      case 'note':
      case 'b':
      case 'i':
      case 'bold':
      case 'italic':
        return parts[0];
      default:
        // By default return last part if it looks like display text, or first part
        return parts[0];
    }
  });
}

/**
 * Normalizes entry items (which can be strings, lists, tables, or nested entry objects)
 * into an array of clean string paragraphs.
 */
export function parseEntries(entries) {
  if (!entries || !Array.isArray(entries)) return [];
  const result = [];

  for (const entry of entries) {
    if (typeof entry === 'string') {
      result.push(clean5eText(entry));
    } else if (entry && typeof entry === 'object') {
      if (entry.type === 'entries' && Array.isArray(entry.entries)) {
        if (entry.name) {
          const strParts = [];
          const rest = [];
          for (const child of entry.entries) {
            if (typeof child === 'string' && rest.length === 0) strParts.push(child);
            else rest.push(child);
          }
          const head = clean5eText(strParts.join(' '));
          result.push(head ? `${clean5eText(entry.name)}: ${head}` : `${clean5eText(entry.name)}:`);
          if (rest.length > 0) result.push(...parseEntries(rest));
        } else {
          result.push(...parseEntries(entry.entries));
        }
      } else if (entry.type === 'list' && Array.isArray(entry.items)) {
        for (const item of entry.items) {
          if (typeof item === 'string') {
            result.push(`• ${clean5eText(item)}`);
          } else if (item && typeof item === 'object') {
            const body = item.entry
              ? clean5eText(item.entry)
              : parseEntries(item.entries).join(' ');
            const prefix = item.name ? `${clean5eText(item.name)}: ` : '';
            result.push(`• ${prefix}${body}`.trimEnd());
          }
        }
      } else if (entry.type === 'table') {
        const caption = entry.caption ? `${entry.caption}: ` : '';
        result.push(`${caption}[Table]`);
      }
    }
  }

  return result;
}
