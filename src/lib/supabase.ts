import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface DatabaseParticipant {
  id: string; // UUID
  nim: string;
  name: string;
  ministry: string | null;
  status: 'PASSED' | 'FAILED' | 'PENDING';
  announcement_date: string | null;
  created_at: string;
  updated_at: string;
}

// Safely access environment variables with Vite fallback
const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const envAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  envUrl &&
  envAnonKey &&
  envUrl !== 'https://your-project.supabase.co' &&
  !envUrl.includes('placeholder')
);

// Fallback dummy URL to prevent createClient crashes if env vars are empty on initial run
const activeUrl = isSupabaseConfigured ? envUrl : 'https://placeholder-fhub.supabase.co';
const activeAnonKey = isSupabaseConfigured ? envAnonKey : 'placeholder-anon-key';

// Centralized Supabase Client Instance (Single Source of Truth)
export const supabase: SupabaseClient = createClient(activeUrl, activeAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
