import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSupabase, isSupabaseConfigured, signInWithGoogle, signOut } from './supabase';

describe('supabase client', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('reports not configured if env vars missing', () => {
    expect(isSupabaseConfigured()).toBe(false);
    expect(getSupabase()).toBeNull();
  });

  it('signInWithGoogle returns error when not configured', async () => {
    const res = await signInWithGoogle();
    expect(res.error).toBeDefined();
    expect(res.error.message).toMatch(/not configured/i);
  });

  it('signOut returns error when not configured', async () => {
    const res = await signOut();
    expect(res.error).toBeDefined();
    expect(res.error.message).toMatch(/not configured/i);
  });
});
