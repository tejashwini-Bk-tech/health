"use client"

import { Bell, User, LogOut, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
  en: "English",
  as: "অসমীয়া",
  mni: "মৈতৈলোন",
  kha: "Khasi",
  brx: "Bodo",
}

export function Navbar({ userName = "User", role = "user", notificationCount = 0 }: NavbarProps) {
  const router = useRouter()
  const { language, setLanguage } = useLanguage()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success("Logged out successfully")
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
            <span className="text-sm font-bold text-white">NN</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">Neural Nexus</span>
            <span className="text-[10px] text-muted-foreground">{roleLabels[role]}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-5 w-5 hover:text-emerald-600 transition-colors" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(languageNames).map(([key, name]) => (
                <DropdownMenuItem 
                  key={key} 
                  onClick={() => setLanguage(key as any)} 
                  className={language === key ? "bg-emerald-50 text-emerald-700 font-medium" : ""}
                >
                  {name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => router.push("/alerts")}
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                  <User className="h-4 w-4 text-emerald-700" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{roleLabels[role]}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
