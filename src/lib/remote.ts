import type { SupabaseClient } from '@supabase/supabase-js'
import { sanitizeProgress, type Progress } from './storage'
import type { RemoteStore } from './sync'

/** Supabase is optional: without these two env vars the app runs fully offline and hides the login UI. */
export const SUPABASE_URL: string | undefined = import.meta.env.VITE_SUPABASE_URL || undefined
export const SUPABASE_ANON_KEY: string | undefined = import.meta.env.VITE_SUPABASE_ANON_KEY || undefined
export const syncConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

/** One row per user in public.progress (see supabase/migrations). Row-level security limits access to the owner. */
export function supabaseRemote(client: SupabaseClient, userId: string): RemoteStore {
  return {
    async load() {
      const { data, error } = await client.from('progress').select('data').eq('user_id', userId).maybeSingle()
      if (error) throw error
      return data ? sanitizeProgress((data as { data: unknown }).data) : null
    },
    async save(p: Progress) {
      const { error } = await client.from('progress').upsert({ user_id: userId, data: p, updated_at: new Date().toISOString() })
      if (error) throw error
    },
  }
}
