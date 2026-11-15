import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const html = readFileSync(resolve(process.cwd(), 'tablet.html'), 'utf8');
const document = new DOMParser().parseFromString(html, 'text/html');

describe('tablet preview harness', () => {
  it('provides the iPad and Galaxy Tab S10 FE viewport presets', () => {
    const presets = [...document.querySelectorAll('[data-width][data-height]')].map((button) => ({
      width: Number(button.dataset.width),
      height: Number(button.dataset.height),
    }));

    expect(presets).toEqual(expect.arrayContaining([
      { width: 820, height: 1180 },
      { width: 834, height: 1194 },
      { width: 823, height: 1141 },
    ]));
    const galaxy = document.querySelector('[data-width="823"][data-height="1141"]');
    expect(galaxy.classList.contains('active')).toBe(true);
    expect(galaxy.dataset.landscapeWidth).toBe('1316');
    expect(galaxy.dataset.landscapeHeight).toBe('648');

    const galaxyPwa = document.querySelector('[data-name="Galaxy Tab S10 FE (Installed PWA)"]');
    expect(galaxyPwa).not.toBeNull();
    expect(galaxyPwa.dataset.width).toBe('823');
    expect(galaxyPwa.dataset.height).toBe('1237');
    expect(galaxyPwa.dataset.landscapeWidth).toBe('1316');
    expect(galaxyPwa.dataset.landscapeHeight).toBe('744');
  });

  it('embeds the live app and offers rotation and responsive scaling', () => {
    expect(document.querySelector('#app-frame').getAttribute('src')).toBe('/');
    expect(document.querySelector('#rotate')).not.toBeNull();
    expect(document.querySelector('#rotate').getAttribute('aria-label')).toBe('Rotate tablet');
    expect(html).toContain('ResizeObserver');
    expect(html).toContain('frame.contentWindow.innerWidth');
    expect(document.querySelector('#viewport-label')).not.toBeNull();
    expect(document.querySelector('#scale-label')).not.toBeNull();
  });
});
