"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, Map, Bell, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/hooks/use-language"

export function BottomNav() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const navItems = [
    { href: "/dashboard", label: t.nav.dashboard, icon: Home },
    { href: "/report", label: t.nav.report, icon: FileText },
    { href: "/map", label: t.nav.map, icon: Map },
    { href: "/alerts", label: t.nav.alerts, icon: Bell },
    { href: "/learn", label: t.nav.learn, icon: BookOpen },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "bg-emerald-100 text-emerald-700"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-emerald-600")} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
