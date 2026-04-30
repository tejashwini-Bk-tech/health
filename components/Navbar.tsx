"use client"

import { Bell, User, LogOut, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useLanguage } from "@/hooks/use-language"

interface NavbarProps {
  userName?: string
  role?: "user" | "health_officer" | "local_leader"
  notificationCount?: number
}

const roleLabels = {
  user: "Community Member",
  health_officer: "Health Officer",
  local_leader: "Local Leader",
}

const languageNames = {
  en: "English", as: "অসমীয়া", mni: "মৈতৈলোন", kha: "Khasi", brx: "Bodo",
}

export function Navbar({ userName = "User", role = "user", notificationCount = 0 }: NavbarProps) {
  const router = useRouter()
  const { language, setLanguage } = useLanguage()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    // Clear local dev bypass so middleware enforces auth again.
    document.cookie = "dev-bypass=; path=/; max-age=0"
    toast.success("Logged out successfully")
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full glass-nav">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-[hsl(160,84%,36%)] opacity-25 blur-md animate-glow-pulse" />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(160,84%,42%)] to-[hsl(160,84%,30%)] shadow-lg">
              <span className="text-sm font-extrabold text-white tracking-tight">AQ</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900 tracking-tight">AquaNexis</span>
            <span className="text-[10px] font-medium text-gray-500">{roleLabels[role]}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-[hsl(160,84%,36%)] hover:bg-gray-100/60 transition-colors rounded-xl">
                <Globe className="h-[18px] w-[18px]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card min-w-[140px]">
              {Object.entries(languageNames).map(([key, name]) => (
                <DropdownMenuItem key={key} onClick={() => setLanguage(key as any)}
                  className={`rounded-lg transition-colors ${language === key ? "bg-[hsl(160,84%,36%,0.1)] text-[hsl(160,84%,32%)] font-semibold" : "text-gray-600 hover:text-gray-900"}`}>
                  {name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-900 hover:bg-gray-100/60 transition-colors rounded-xl"
            onClick={() => router.push("/alerts")}>
            <Bell className="h-[18px] w-[18px]" />
            {notificationCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[hsl(0,85%,56%)] px-1 text-[10px] font-bold text-white shadow-lg shadow-[hsl(0,85%,56%,0.3)] animate-breathe-danger">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full p-0 ml-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(160,84%,42%)] to-[hsl(160,84%,30%)] ring-2 ring-[hsl(160,84%,36%,0.25)] transition-all hover:ring-[hsl(160,84%,36%,0.4)]">
                  <User className="h-4 w-4 text-white" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card w-52">
              <div className="px-3 py-2.5">
                <p className="text-sm font-semibold text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">{roleLabels[role]}</p>
              </div>
              <DropdownMenuSeparator className="bg-gray-200/60" />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
