import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseRemote, syncConfigured } from './lib/remote'
import type { RemoteStore } from './lib/sync'

export type AuthError = 'notReady' | 'google' | 'link'

interface AuthCtx {
  configured: boolean
  loading: boolean // true until we know whether someone is signed in
  email: string | null
  remote: RemoteStore | null // non-null exactly when signed in
  signInGoogle(): Promise<AuthError | null> // resolves with an error code (translated by the UI), or null on success (the page then redirects)
  signInEmail(email: string): Promise<AuthError | null>
  signOut(): Promise<void>
}

const C = createContext<AuthCtx | null>(null)

/** Where Supabase sends the user back after Google or an email link. */
const redirectTo = () => window.location.origin + import.meta.env.BASE_URL

export function AuthProvider({ children }: { children: ReactNode }) {
  const client = useRef<SupabaseClient | null>(null)
  const [loading, setLoading] = useState(syncConfigured)
  const [session, setSession] = useState<{ id: string; email: string | null } | null>(null)

  useEffect(() => {
    if (!syncConfigured) return
    let off: (() => void) | undefined
    let dead = false
    // loaded on demand so people without login never download the Supabase client
    import('@supabase/supabase-js').then(({ createClient }) => {
      if (dead) return
      const c = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
      client.current = c
      const { data } = c.auth.onAuthStateChange((_event, s) => {
        setSession(s?.user ? { id: s.user.id, email: s.user.email ?? null } : null)
        setLoading(false)
      })
      off = () => data.subscription.unsubscribe()
    }).catch(() => setLoading(false))
    return () => {
      dead = true
      off?.()
    }
  }, [])

  const signInGoogle = useCallback(async () => {
    const c = client.current
    if (!c) return 'notReady'
    const { error } = await c.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirectTo() } })
    return error ? 'google' : null
  }, [])

  const signInEmail = useCallback(async (email: string) => {
    const c = client.current
    if (!c) return 'notReady'
    const { error } = await c.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo() } })
    return error ? 'link' : null
  }, [])

  const signOut = useCallback(async () => {
    await client.current?.auth.signOut()
  }, [])

  const userId = session?.id
  const remote = useMemo(() => (client.current && userId ? supabaseRemote(client.current, userId) : null), [userId])

  const value = useMemo<AuthCtx>(
    () => ({ configured: syncConfigured, loading, email: session?.email ?? null, remote, signInGoogle, signInEmail, signOut }),
    [loading, session?.email, remote, signInGoogle, signInEmail, signOut],
  )
  return <C.Provider value={value}>{children}</C.Provider>
}

export function useAuth() {
  const v = useContext(C)
  if (!v) throw new Error('useAuth outside AuthProvider')
  return v
}
