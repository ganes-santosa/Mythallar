import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('supabase client', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('checks configured status based on environment variables', async () => {
    const { isSupabaseConfigured, getSupabase } = await import('./supabase');
    expect(typeof isSupabaseConfigured()).toBe('boolean');
    if (!isSupabaseConfigured()) {
      expect(getSupabase()).toBeNull();
    } else {
      expect(getSupabase()).not.toBeNull();
    }
  });

  it('signInWithGoogle returns a promise response', async () => {
    const { signInWithGoogle, isSupabaseConfigured } = await import('./supabase');
    if (!isSupabaseConfigured()) {
      const res = await signInWithGoogle();
      expect(res.error).toBeDefined();
    } else {
      expect(typeof signInWithGoogle).toBe('function');
    }
  });

  it('signOut returns a promise response', async () => {
    const { signOut, isSupabaseConfigured } = await import('./supabase');
    if (!isSupabaseConfigured()) {
      const res = await signOut();
      expect(res.error).toBeDefined();
    } else {
      expect(typeof signOut).toBe('function');
    }
  });
});
