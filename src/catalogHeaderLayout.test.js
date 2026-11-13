import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

const css = readFileSync('src/index.css', 'utf-8');

/** Return the body of the `{ ... }` block that starts at `marker` inside `src`. */
function block(src, marker) {
  const start = src.indexOf(marker);
  if (start === -1) return null;
  let i = src.indexOf('{', start);
  const bodyStart = i + 1;
  let depth = 0;
  for (; i < src.length; i += 1) {
    if (src[i] === '{') depth += 1;
    else if (src[i] === '}') {
      depth -= 1;
      if (depth === 0) return src.slice(bodyStart, i);
    }
  }
  return null;
}

/** Return the declarations of `selector { ... }` inside `body`. */
function rule(body, selector) {
  const start = body.indexOf(`${selector} {`);
  if (start === -1) return null;
  const open = body.indexOf('{', start);
  return body.slice(open + 1, body.indexOf('}', open));
}

const mobile = block(css, '@media (max-width: 767px)');
const desktop = block(css, '@media (min-width: 768px)');

describe('catalog header on mobile (below md)', () => {
  it('has a mobile-only block', () => {
    expect(mobile).not.toBeNull();
  });

  it('puts the switcher on its own full-width row', () => {
    const narrow = block(mobile, '@container (max-width: 565px)');
    expect(narrow).not.toBeNull();
    const decls = rule(narrow, '.catalog-header-switcher');
    expect(decls).toMatch(/grid-column:\s*1\s*\/\s*-1/);
    expect(decls).toMatch(/grid-row:\s*2/);
    expect(decls).toMatch(/justify-self:\s*stretch/);
    expect(decls).toMatch(/width:\s*100%/);
  });

  it('never hides the branding subtitle', () => {
    expect(mobile).not.toMatch(/\.catalog-header-subtitle/);
  });
});

describe('catalog header on a desktop pane (md and up)', () => {
  it('has a desktop-only block', () => {
    expect(desktop).not.toBeNull();
  });

  it('shortens the sign-in label and hides the subtitle to free room', () => {
    const narrow = block(desktop, '@container (max-width: 580px)');
    expect(narrow).not.toBeNull();
    expect(narrow).toMatch(/\.auth-label-long\s*\{\s*display:\s*none/);
    expect(narrow).toMatch(/\.auth-label-short\s*\{\s*display:\s*inline/);
    expect(narrow).toMatch(/\.catalog-header-subtitle\s*\{\s*display:\s*none/);
  });

  it('keeps the switcher on the header row until the pane really is too narrow', () => {
    const narrow = block(desktop, '@container (max-width: 580px)');
    expect(narrow).not.toMatch(/grid-row:\s*2/);
  });

  it('drops the switcher to its own row, same right-hand position, on a very narrow pane', () => {
    const tight = block(desktop, '@container (max-width: 420px)');
    expect(tight).not.toBeNull();
    const decls = rule(tight, '.catalog-header-switcher');
    expect(decls).toMatch(/grid-row:\s*2/);
    expect(decls).toMatch(/justify-self:\s*end/);
    expect(decls).not.toMatch(/justify-self:\s*stretch/);
    expect(decls).not.toMatch(/width:\s*100%/);
  });

  it('keeps the switcher offset untouched', () => {
    expect(css).not.toMatch(/\.catalog-header-switcher\s*>\s*div/);
  });
});
