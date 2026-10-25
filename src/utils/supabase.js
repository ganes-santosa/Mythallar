import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let clientInstance = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    clientInstance = null;
  }
}

export function isSupabaseConfigured() {
  return Boolean(clientInstance);
}

export function getSupabase() {
  return clientInstance;
}

export async function signInWithGoogle() {
  if (!clientInstance) {
    return { error: new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.') };
  }
  return clientInstance.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
}

export async function signOut() {
  if (!clientInstance) {
    return { error: new Error('Supabase is not configured.') };
  }
  return clientInstance.auth.signOut();
}
