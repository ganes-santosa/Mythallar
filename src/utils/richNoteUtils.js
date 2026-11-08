/**
 * Sanitizes rich text HTML for character notes:
 * - Preserves semantic formatting: <b>, <strong>, <i>, <em>, <u>, <br>, <div>, <p>
 * - Converts styled spans (font-weight: bold, font-style: italic) to <b>/<i>
 * - Strips all unsafe tags, scripts, images, iframes, styles, classes, and on* attributes
 */
export function sanitizeRichNoteHtml(html) {
  if (!html || typeof html !== 'string') return '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  function cleanNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return document.createTextNode(node.textContent);
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }

    const tagName = node.tagName.toLowerCase();

    // Disallow dangerous elements entirely
    if (['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta'].includes(tagName)) {
      return null;
    }

    let isBold = ['b', 'strong'].includes(tagName);
    let isItalic = ['i', 'em'].includes(tagName);
    const preservesStrong = tagName === 'strong';
    const preservesEm = tagName === 'em';
    let isUnderline = tagName === 'u';
    let isStrike = ['s', 'strike', 'del'].includes(tagName);
    const preservesDel = tagName === 'del';
    const isBr = tagName === 'br';
    const isBlock = ['div', 'p', 'li', 'ul', 'ol', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName);

    // Check inline styles if present
    const styleAttr = node.getAttribute('style') || '';
    if (/\bfont-weight\s*:\s*(bold|[6-9]00)\b/i.test(styleAttr)) {
      isBold = true;
    }
    if (/\bfont-style\s*:\s*italic\b/i.test(styleAttr)) {
      isItalic = true;
    }
    if (/\btext-decoration\s*:\s*underline\b/i.test(styleAttr)) {
      isUnderline = true;
    }
    if (/\btext-decoration\s*:\s*line-through\b/i.test(styleAttr)) {
      isStrike = true;
    }

    const frag = document.createDocumentFragment();

    // Recurse children
    for (const child of Array.from(node.childNodes)) {
      const cleanedChild = cleanNode(child);
      if (cleanedChild) {
        frag.appendChild(cleanedChild);
      }
    }

    if (isBr) {
      return document.createElement('br');
    }

    // Wrap with formatting tags
    let currentContainer = frag;
    if (isStrike) {
      const sTag = document.createElement(preservesDel ? 'del' : 's');
      sTag.appendChild(currentContainer);
      currentContainer = sTag;
    }
    if (isUnderline) {
      const u = document.createElement('u');
      u.appendChild(currentContainer);
      currentContainer = u;
    }
    if (isItalic) {
      const iTag = document.createElement(preservesEm ? 'em' : 'i');
      iTag.appendChild(currentContainer);
      currentContainer = iTag;
    }
    if (isBold) {
      const bTag = document.createElement(preservesStrong ? 'strong' : 'b');
      bTag.appendChild(currentContainer);
      currentContainer = bTag;
    }

    if (isBlock) {
      const div = document.createElement('div');
      div.appendChild(currentContainer);
      return div;
    }

    return currentContainer;
  }

  const container = document.createElement('div');
  for (const child of Array.from(doc.body.childNodes)) {
    const cleaned = cleanNode(child);
    if (cleaned) {
      container.appendChild(cleaned);
    }
  }

  return container.innerHTML;
}

/**
 * Extracts clean, readable plain text from HTML, collapsing tags and spacing for search queries and card snippets.
 */
export function extractPlainTextFromHtml(html) {
  if (!html || typeof html !== 'string') return '';
  if (!html.includes('<')) return html.trim();

  // Replace block tags and br tags with a space before getting textContent
  const normalized = html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(div|p|li|h[1-6])>/gi, ' ');

  const parser = new DOMParser();
  const doc = parser.parseFromString(normalized, 'text/html');
  const text = doc.body.textContent || '';
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Checks whether note content is actually empty (handling <br>, empty tags, whitespace).
 */
export function isNoteContentEmpty(htmlOrText) {
  if (!htmlOrText || typeof htmlOrText !== 'string') return true;
  const stripped = extractPlainTextFromHtml(htmlOrText);
  return stripped.length === 0;
}
