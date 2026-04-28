"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Heart, Mail, Lock, User, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  
  // Auth state
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  
  const [isLoading, setIsLoading] = useState(false)

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        console.log("Login page - already logged in, redirecting to dashboard")
        window.location.href = "/dashboard"
      }
    }
    checkSession()
  }, [router])

  const handleAuth = async () => {
    if (!email.includes("@")) {
      toast.error("Please enter a valid email")
      return
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    if (!isLogin && !fullName.trim()) {
      toast.error("Please enter your full name")
      return
    }

    setIsLoading(true)
    
    try {
      if (isLogin) {
        // Handle Login
        console.log("Login page - attempting sign in...")
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          toast.error(error.message)
          console.error("Sign in error:", error)
        } else {
          toast.success("Welcome back!")
          // Sign-in can succeed even when the immediate response session is null
          // (session hydration races, PKCE flows, etc.). On success, go to dashboard.
          window.location.href = "/dashboard"
        }
      } else {
        // Handle Sign Up
        console.log("Login page - attempting sign up...")
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'user' // Default role
            }
          }
        })

        if (error) {
          toast.error(error.message)
          console.error("Sign up error:", error)
        } else {
          // If auto sign-in occurs immediately (email confirmations disabled)
          if (data.session) {
            toast.success("Account created successfully!")
            setTimeout(() => {
              window.location.href = "/dashboard"
            }, 100)
          } else {
            // If email confirmation is required
            toast.success("Account created! Check your email to verify your account.")
            setIsLogin(true) // Switch to login view
            setPassword("") // Clear password
          }
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDevBypass = () => {
    document.cookie = "dev-bypass=true; path=/; max-age=3600"
    toast.info("Entering developer mode (bypass active)")
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-50 flex flex-col">
      {/* Header */}
      <header className="px-4 pt-8 pb-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Heart className="w-6 h-6 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Neural Nexus</h1>
        <p className="text-sm text-gray-600 mt-1">Community Health Monitoring</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-8 flex items-center justify-center">
        <Card className="w-full max-w-sm rounded-2xl shadow-lg border-emerald-100/50">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">{isLogin ? "Welcome Back" : "Create Account"}</CardTitle>
            <CardDescription>
              {isLogin ? "Sign in to access your dashboard" : "Sign up to join your community network"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12 pl-10 rounded-xl bg-white"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 pl-10 rounded-xl bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                  className="h-12 pl-10 rounded-xl bg-white"
                />
              </div>
            </div>

            <Button
              onClick={handleAuth}
              disabled={isLoading || !email || !password || (!isLogin && !fullName)}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 mt-2 shadow-sm"
            >
              {isLoading ? (
                 <span className="flex items-center gap-2">
                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                   {isLogin ? "Signing in..." : "Creating account..."}
                 </span>
              ) : (
                <span className="flex items-center gap-2 text-base font-semibold">
                  {isLogin ? "Sign In" : "Sign Up"}
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>

            <div className="text-center pt-2">
              <button 
                onClick={() => {
                  setIsLogin(!isLogin)
                  // clear form to prevent accidental submission of wrong state
                  setPassword("")
                  if (!isLogin) setFullName("")
                }}
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer bg-transparent border-none"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="pt-4 border-t border-dashed border-gray-200 mt-4">
                <p className="text-[10px] text-center text-gray-400 mb-2 font-mono uppercase tracking-widest">Dev Tools</p>
                <Button
                  onClick={handleDevBypass}
                  variant="outline"
                  className="w-full h-10 rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs gap-2"
                >
                  Bypass Login (Dev Mode)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="px-4 py-6 text-center mt-auto">
        <p className="text-xs text-gray-400 font-medium tracking-wide">
          Northeast India Health Initiative
        </p>
      </footer>
    </div>
  )
}
