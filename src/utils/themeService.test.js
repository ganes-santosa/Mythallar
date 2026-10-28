import { describe, it, expect, beforeEach } from 'vitest';
import {
  THEMES,
  DEFAULT_THEME_ID,
  getStoredThemeId,
  applyTheme,
  setTheme,
  getActiveTheme,
  getCustomThemeConfig,
  saveCustomThemeConfig,
} from './themeService';

describe('themeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.cssText = '';
  });

  it('exposes the updated theme roster in the requested order with textures', () => {
    const themeIds = THEMES.map((t) => t.id);

    // 1st is Mythallar Classic (no texture), 2nd is The Weave (celestial), last is Custom
    expect(themeIds[0]).toBe('mythallar-classic');
    expect(themeIds[1]).toBe('the-weave');
    expect(themeIds[themeIds.length - 1]).toBe('custom');

    // Present themes
    expect(themeIds).toContain('space-cadet');
    expect(themeIds).toContain('underdark');
    expect(themeIds).toContain('desert-dunes');
    expect(themeIds).toContain('earthy-olive');
    expect(themeIds).toContain('monochrome-slate');
    expect(themeIds).toContain('blood-god');

    // Deleted / replaced themes confirmed absent
    expect(themeIds).not.toContain('honeydew-fern');
    expect(themeIds).not.toContain('floral-juniper');
    expect(themeIds).not.toContain('chinese-black-brass');
    expect(themeIds).not.toContain('eerie-sparkle');
    expect(themeIds).not.toContain('burnt-sienna');
    expect(themeIds).not.toContain('bioluminescent-cyan');

    // Textures per theme requirement
    expect(THEMES.find((t) => t.id === 'mythallar-classic').texture).toBe('none');
    expect(THEMES.find((t) => t.id === 'the-weave').texture).toBe('celestial');
    expect(THEMES.find((t) => t.id === 'space-cadet').texture).toBe('stars');
    expect(THEMES.find((t) => t.id === 'underdark').texture).toBe('limewash');
    expect(THEMES.find((t) => t.id === 'desert-dunes').texture).toBe('limewash');
    expect(THEMES.find((t) => t.id === 'earthy-olive').texture).toBe('limewash');

    // Underdark has darker background than legacy #141817
    const underdark = THEMES.find((t) => t.id === 'underdark');
    expect(underdark.name).toBe('Underdark');
    expect(underdark.colors.bg).toBe('#0a0d0c');

    // Desert Dunes uses pale dune sand (#D5C3B0), taupe (#726A66), and warm charcoal basalt
    const desert = THEMES.find((t) => t.id === 'desert-dunes');
    expect(desert.colors.bg).toBe('#1c1b1a');
    expect(desert.colors.panel).toBe('#272625');
    expect(desert.colors.card).toBe('#353230');
    expect(desert.colors.gold).toBe('#D5C3B0');
    expect(desert.colors.ivory).toBe('#F3F2F0');
  });

  it('defaults to mythallar-classic when nothing is stored and migrates bioluminescent-cyan to underdark', () => {
    expect(getStoredThemeId()).toBe(DEFAULT_THEME_ID);
    localStorage.setItem('mythallar_theme_id', 'bioluminescent-cyan');
    expect(getStoredThemeId()).toBe('underdark');
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

  it('supports saving and applying user-defined custom theme colors and texture', () => {
    const updated = saveCustomThemeConfig({
      colors: { bg: '#101218', gold: '#ff8844' },
      texture: 'stars',
    });
    expect(updated.colors.bg).toBe('#101218');
    expect(updated.colors.gold).toBe('#ff8844');
    expect(updated.texture).toBe('stars');

    const applied = setTheme('custom');
    expect(applied.id).toBe('custom');
    expect(applied.texture).toBe('stars');
    expect(document.documentElement.style.getPropertyValue('--color-bg')).toBe('#101218');
    expect(document.documentElement.style.getPropertyValue('--color-gold')).toBe('#ff8844');
    expect(getActiveTheme('custom').colors.gold).toBe('#ff8844');
    expect(getCustomThemeConfig().texture).toBe('stars');
  });

  it('falls back to default if invalid theme is requested', () => {
    const applied = setTheme('non-existent-theme');
    expect(applied.id).toBe(DEFAULT_THEME_ID);
  });
});
