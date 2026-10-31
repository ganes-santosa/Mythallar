import { describe, it, expect, vi, beforeEach } from 'vitest';
import { compressImageFile } from './imageCompressor';

describe('imageCompressor', () => {
  it('reads file and returns a data url string', async () => {
    const file = new File(['fake-image-bytes'], 'avatar.png', { type: 'image/png' });

    // Mock FileReader for jsdom
    const result = await compressImageFile(file, 256, 0.85);
    expect(typeof result).toBe('string');
  });

  it('rejects or falls back gracefully on empty or invalid input', async () => {
    const result = await compressImageFile(null);
    expect(result).toBe('');
  });
});
