import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Singleton browser client so auth state/cookies stay consistent across renders.
let browserClient: ReturnType<typeof createBrowserClient> | undefined

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? (browserClient ??
        (browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            // Auth callback route exchanges the code server-side.
            // Keep this false to avoid duplicate client-side code exchange.
            detectSessionInUrl: false,
            flowType: 'pkce',
            debug: process.env.NODE_ENV === 'development',
          },
        })))
    : null

export type UserRole = 'user' | 'health_officer' | 'local_leader'

export interface UserProfile {
  id: string
  phone: string
  role: UserRole
  full_name?: string
  created_at: string
  updated_at: string
}
