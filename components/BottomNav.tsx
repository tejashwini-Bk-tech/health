"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, Map, Bell, BookOpen } from "lucide-react"
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
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md">
      <div className="glass-nav rounded-2xl px-2 py-2 flex items-center justify-around shadow-xl shadow-gray-200/50">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}
              className={`relative flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-2 text-[10px] font-semibold transition-all duration-300 ${
                isActive ? "text-[hsl(160,84%,32%)]" : "text-gray-400 hover:text-gray-600"
              }`}>
              {isActive && <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-[3px] w-6 rounded-full bg-[hsl(160,84%,36%)] shadow-[0_0_8px_hsl(160,84%,36%,0.5)]" />}
              <div className={`relative transition-transform duration-300 ${isActive ? "scale-110" : ""}`}>
                {isActive && <div className="absolute inset-0 rounded-full bg-[hsl(160,84%,36%)] opacity-15 blur-md scale-150" />}
                <Icon className={`relative h-5 w-5 transition-all duration-300 ${isActive ? "drop-shadow-[0_0_4px_hsl(160,84%,36%,0.4)]" : ""}`} />
              </div>
              <span className="tracking-wide">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
