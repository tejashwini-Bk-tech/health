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
      console.log('useAuth - getting session...')
      const { data: { session } } = await supabase.auth.getSession()
      console.log('useAuth - session retrieved:', !!session, 'user:', !!session?.user)
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        console.log('useAuth - fetching profile for user:', session.user.id)
        // Fetch user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        console.log('useAuth - profile data:', !!profileData)
        setProfile(profileData)
      }
      
      setIsLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          setProfile(profileData)
        } else {
          setProfile(null)
        }
        
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
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
