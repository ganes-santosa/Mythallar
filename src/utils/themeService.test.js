import { describe, it, expect, beforeEach } from 'vitest';
import {
  THEMES,
  DEFAULT_THEME_ID,
  getStoredThemeId,
  applyTheme,
  setTheme,
} from './themeService';

describe('themeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.cssText = '';
  });

  it('exposes all active theme palettes', () => {
    expect(THEMES.length).toBe(10);
    const themeIds = THEMES.map((t) => t.id);
    expect(themeIds).toContain('mythallar-classic');
    expect(themeIds).toContain('honeydew-fern');
    expect(themeIds).toContain('floral-juniper');
    expect(themeIds).toContain('chinese-black-brass');
    expect(themeIds).toContain('blood-god');
    expect(themeIds).toContain('bioluminescent-cyan');
    expect(themeIds).toContain('the-weave');
    expect(themeIds).toContain('eerie-sparkle');
    expect(themeIds).toContain('burnt-sienna');
    expect(themeIds).toContain('space-cadet');

    // Deleted themes confirmed absent
    expect(themeIds).not.toContain('delft-sunset');
    expect(themeIds).not.toContain('autumn-canopy');
    expect(themeIds).not.toContain('twilight-violet');
    expect(themeIds).not.toContain('violet-femme');
  });

  it('defaults to mythallar-classic when nothing is stored', () => {
    expect(getStoredThemeId()).toBe(DEFAULT_THEME_ID);
  });

  it('persists selected theme in localStorage and applies CSS variables', () => {
    const applied = setTheme('blood-god');
    expect(applied.id).toBe('blood-god');
    expect(localStorage.getItem('mythallar_theme_id')).toBe('blood-god');
    expect(document.documentElement.getAttribute('data-theme')).toBe('blood-god');
    expect(document.documentElement.style.getPropertyValue('--color-bg')).toBe(applied.colors.bg);
    expect(document.documentElement.style.getPropertyValue('--color-stars')).toBe(applied.colors.gold);

    const weave = setTheme('the-weave');
    expect(document.documentElement.style.getPropertyValue('--color-gold')).toBe('#9d65d8');
    expect(document.documentElement.style.getPropertyValue('--color-stars')).toBe('#fef08a');
  });

  it('falls back to default if invalid theme is requested', () => {
    const applied = setTheme('non-existent-theme');
    expect(applied.id).toBe(DEFAULT_THEME_ID);
  });
});
