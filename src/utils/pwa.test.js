import { describe, it, expect, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { registerServiceWorker } from './pwa';

describe('PWA standalone configuration', () => {
  it('provides a valid manifest.webmanifest with standalone display and 192/512 icons', () => {
    const manifestPath = path.resolve(process.cwd(), 'public/manifest.webmanifest');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    expect(manifest.name).toBe('Mythallar - DnD 5e Spellbook');
    expect(manifest.short_name).toBe('Mythallar');
    expect(manifest.display).toBe('standalone');
    expect(manifest.background_color).toBe('#17181B');
    expect(manifest.theme_color).toBe('#17181B');
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }),
        expect.objectContaining({ src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' }),
      ])
    );
    expect(fs.existsSync(path.resolve(process.cwd(), 'public/pwa-192x192.png'))).toBe(true);
    expect(fs.existsSync(path.resolve(process.cwd(), 'public/pwa-512x512.png'))).toBe(true);
  });

  it('links manifest and standalone meta tags in index.html', () => {
    const html = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8');
    expect(html).toContain('rel="manifest" href="/manifest.webmanifest"');
    expect(html).toContain('name="apple-mobile-web-app-capable" content="yes"');
    expect(html).toContain('name="mobile-web-app-capable" content="yes"');
    expect(html).toContain('name="theme-color" content="#17181B"');
    expect(html).toContain('rel="apple-touch-icon" href="/pwa-192x192.png"');
  });

  it('registers /sw.js when serviceWorker is supported and swallows rejections', async () => {
    const registerMock = vi.fn().mockRejectedValueOnce(new Error('blocked'));
    await expect(registerServiceWorker({ serviceWorker: { register: registerMock } })).resolves.toBeUndefined();
    expect(registerMock).toHaveBeenCalledWith('/sw.js');
    await expect(registerServiceWorker({})).resolves.toBeUndefined();
  });
});
