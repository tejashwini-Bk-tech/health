"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase, type UserRole } from "@/lib/supabase"
import type { User, Session } from "@supabase/supabase-js"

interface UserProfile {
  id: string
  email: string
  role: UserRole
  full_name?: string
}

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      if (!supabase) {
        console.log('useAuth - supabase not available')
        setIsLoading(false)
        return
      }

      console.log('useAuth - getting session...')
      const { data: { session } } = await supabase.auth.getSession()
      console.log('useAuth - session retrieved:', !!session, 'user:', !!session?.user)
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        console.log('useAuth - fetching profile for user:', session.user.id)
        // Fetch user profile (don't wait for it to complete loading)
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (error) {
            console.log('useAuth - profile not found or error:', error.message)
            // Create a basic profile from user metadata
            setProfile({
              id: session.user.id,
              email: session.user.email || '',
              role: session.user.user_metadata?.role || 'user',
              full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0]
            })
          } else {
            console.log('useAuth - profile data:', !!profileData)
            setProfile(profileData)
          }
        } catch (error) {
          console.error('useAuth - error fetching profile:', error)
          // Set basic profile even if there's an error
          setProfile({
            id: session.user.id,
            email: session.user.email || '',
            role: 'user',
            full_name: session.user.email?.split('@')[0]
          })
        }
      }
      
      setIsLoading(false)
    }

    // Force stop loading after 3 seconds as fallback
    const timeout = setTimeout(() => {
      console.log('useAuth loading timeout - forcing stop')
      setIsLoading(false)
    }, 3000)

    getSession()

    // Listen for auth changes
    let subscription: any = null
    if (supabase) {
      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
        async (event: any, session: any) => {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            try {
              const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()
              
              if (error) {
                // Create basic profile from user metadata
                setProfile({
                  id: session.user.id,
                  email: session.user.email || '',
                  role: session.user.user_metadata?.role || 'user',
                  full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0]
                })
              } else {
                setProfile(profileData)
              }
            } catch (error) {
              setProfile({
                id: session.user.id,
                email: session.user.email || '',
                role: 'user',
                full_name: session.user.email?.split('@')[0]
              })
            }
          } else {
            setProfile(null)
          }
          
          setIsLoading(false)
        }
      )
      subscription = sub
    }

    return () => {
      clearTimeout(timeout)
      if (subscription) subscription.unsubscribe()
    }
  }, [])

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    router.push("/login")
    router.refresh()
  }

  return {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: !!user,
    role: profile?.role || user?.user_metadata?.role || null,
    logout,
  }
}
