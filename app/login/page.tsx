"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Heart, Mail, Lock, User, ArrowRight, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
              role: 'user'
            }
          }
        })

        if (error) {
          toast.error(error.message)
          console.error("Sign up error:", error)
        } else {
          if (data.session) {
            toast.success("Account created successfully!")
            setTimeout(() => {
              window.location.href = "/dashboard"
            }, 100)
          } else {
            toast.success("Account created! Check your email to verify your account.")
            setIsLogin(true)
            setPassword("")
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
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[hsl(160,84%,39%)] opacity-[0.04] blur-[100px] animate-float-orb" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[hsl(210,90%,60%)] opacity-[0.03] blur-[120px] animate-float-orb" style={{ animationDelay: '-7s' }} />
      <div className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full bg-[hsl(160,60%,50%)] opacity-[0.05] blur-[80px] animate-float-orb" style={{ animationDelay: '-14s' }} />

      {/* Logo Section */}
      <div className="stagger-fade-in stagger-1 mb-8 text-center">
        <div className="relative inline-flex mb-4">
          {/* Animated glow ring */}
          <div className="absolute inset-0 rounded-2xl bg-[hsl(160,84%,39%)] opacity-40 blur-xl animate-glow-pulse scale-150" />
          <div className="absolute -inset-2 rounded-3xl border border-[hsl(160,84%,39%,0.2)] animate-ring-pulse" />
          <div className="relative w-16 h-16 bg-gradient-to-br from-[hsl(160,84%,50%)] to-[hsl(160,84%,30%)] rounded-2xl flex items-center justify-center shadow-2xl shadow-[hsl(160,84%,39%,0.3)]">
            <Heart className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">AquaNexis</h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">Community Health Monitoring</p>
      </div>

      {/* Login Card */}
      <div className="stagger-fade-in stagger-2 w-full max-w-sm">
        <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
          {/* Top accent glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-[hsl(160,84%,50%,0.5)] to-transparent" />

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isLogin ? "Sign in to access your dashboard" : "Sign up to join your community network"}
            </p>
          </div>
          
          <div className="space-y-4">
            {!isLogin && (
              <div className="space-y-2 stagger-fade-in stagger-1">
                <Label htmlFor="fullName" className="text-gray-600 text-xs font-semibold uppercase tracking-wider">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12 pl-10 rounded-xl glass-input text-gray-900 placeholder:text-gray-300 focus-visible:ring-0"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-600 text-xs font-semibold uppercase tracking-wider">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 pl-10 rounded-xl glass-input text-gray-900 placeholder:text-gray-300 focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-600 text-xs font-semibold uppercase tracking-wider">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                  className="h-12 pl-10 rounded-xl glass-input text-gray-900 placeholder:text-gray-300 focus-visible:ring-0"
                />
              </div>
            </div>

            <Button
              onClick={handleAuth}
              disabled={isLoading || !email || !password || (!isLogin && !fullName)}
              className="w-full h-12 rounded-xl glass-button text-white font-bold text-base mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                 <span className="flex items-center gap-2">
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   {isLogin ? "Signing in..." : "Creating account..."}
                 </span>
              ) : (
                <span className="flex items-center gap-2">
                  {isLogin ? "Sign In" : "Sign Up"}
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>

            <div className="text-center pt-2">
              <button 
                onClick={() => {
                  setIsLogin(!isLogin)
                  setPassword("")
                  if (!isLogin) setFullName("")
                }}
                className="text-sm font-medium text-[hsl(160,84%,32%)] hover:text-[hsl(160,84%,25%)] transition-colors cursor-pointer bg-transparent border-none"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="pt-4 border-t border-gray-200 mt-4">
                <p className="text-[10px] text-center text-gray-300 mb-2 font-mono uppercase tracking-widest">Dev Tools</p>
                <Button
                  onClick={handleDevBypass}
                  variant="outline"
                  className="w-full h-10 rounded-xl border-gray-200 text-gray-500 hover:bg-gray-100/60 hover:text-[hsl(160,84%,32%)] text-xs gap-2"
                >
                  <Shield className="h-3 w-3" />
                  Bypass Login (Dev Mode)
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="stagger-fade-in stagger-3 mt-8 text-center">
        <p className="text-[11px] text-gray-300 font-medium tracking-widest uppercase">
          Northeast India Health Initiative
        </p>
      </footer>
    </div>
  )
}
