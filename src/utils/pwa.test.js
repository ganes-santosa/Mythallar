import { describe, it, expect, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { registerServiceWorker } from './pwa';

describe('PWA standalone configuration', () => {
  it('provides a valid manifest.webmanifest with standalone display and 192/512 icons', () => {
    const manifestPath = path.resolve(process.cwd(), 'public/manifest.webmanifest');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    expect(manifest.name).toBe('Mythallar - DnD 5e Spellbook');
    expect(manifest.short_name).toBe('Mythallar');
    expect(manifest.display).toBe('standalone');
    expect(manifest.background_color).toBe('#1E1E29');
    expect(manifest.theme_color).toBe('#1E1E29');
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }),
        expect.objectContaining({ src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' }),
      ])
    );
    expect(fs.existsSync(path.resolve(process.cwd(), 'public/pwa-192x192.png'))).toBe(true);
    expect(fs.existsSync(path.resolve(process.cwd(), 'public/pwa-512x512.png'))).toBe(true);

    // Verify PWA icon background is opaque #1E1E29 (not transparent white on Android/iPad/Chrome)
    function checkCornerPixel(iconFile) {
      const buf = fs.readFileSync(path.resolve(process.cwd(), iconFile));
      const idats = [];
      let offset = 8;
      let width = 0;
      while (offset < buf.length) {
        const len = buf.readUInt32BE(offset);
        const type = buf.toString('ascii', offset + 4, offset + 8);
        if (type === 'IHDR') width = buf.readUInt32BE(offset + 8);
        if (type === 'IDAT') idats.push(buf.subarray(offset + 8, offset + 8 + len));
        offset += 12 + len;
      }
      const decomp = zlib.inflateSync(Buffer.concat(idats));
      // First pixel after filter byte
      const r = decomp[1];
      const g = decomp[2];
      const b = decomp[3];
      const a = decomp[4];
      return { r, g, b, a };
    }
    expect(checkCornerPixel('public/pwa-192x192.png')).toEqual({ r: 0x1e, g: 0x1e, b: 0x29, a: 0xff });
    expect(checkCornerPixel('public/pwa-512x512.png')).toEqual({ r: 0x1e, g: 0x1e, b: 0x29, a: 0xff });
  });

  it('links manifest and standalone meta tags in index.html', () => {
    const html = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8');
    expect(html).toContain('rel="manifest" href="/manifest.webmanifest"');
    expect(html).toContain('rel="icon" type="image/png" href="/mythallar_logo.png"');
    expect(html).toContain('name="apple-mobile-web-app-capable" content="yes"');
    expect(html).toContain('name="mobile-web-app-capable" content="yes"');
    expect(html).toContain('name="theme-color" content="#1E1E29"');
    expect(html).toContain('rel="apple-touch-icon" href="/pwa-192x192.png"');
  });

  it('registers /sw.js when serviceWorker is supported and swallows rejections', async () => {
    const registerMock = vi.fn().mockRejectedValueOnce(new Error('blocked'));
    await expect(registerServiceWorker({ serviceWorker: { register: registerMock } })).resolves.toBeUndefined();
    expect(registerMock).toHaveBeenCalledWith('/sw.js');
    await expect(registerServiceWorker({})).resolves.toBeUndefined();
  });
});
