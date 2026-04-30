"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { BottomNav } from "@/components/BottomNav"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Droplets, Waves, Search, CheckCircle, AlertCircle, MapPin, Calendar } from "lucide-react"
import { fetchWaterReports, type DbWaterReport } from "@/lib/db"
import { useAuth } from "@/hooks/useAuth"
import { useLanguage } from "@/hooks/use-language"
import { cn } from "@/lib/utils"

export default function WaterReportsPage() {
  const router = useRouter()
  const { profile, isLoading: authLoading } = useAuth()
  const { t } = useLanguage()
  const [reports, setReports] = useState<DbWaterReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true)
      try {
        const data = await fetchWaterReports()
        setReports(data)
      } catch (error) {
        console.error("Failed to load water reports:", error)
        setReports([])
      } finally {
        setLoading(false)
      }
    }
    loadReports()
  }, [])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-3 border-[hsl(210,90%,60%,0.2)] border-t-[hsl(210,90%,60%)] rounded-full animate-spin" />
            <div className="absolute inset-0 w-12 h-12 rounded-full bg-[hsl(210,90%,60%)] opacity-20 blur-xl animate-glow-pulse" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Loading water reports...</p>
        </div>
      </div>
    )
  }

  const safeCount = reports.filter(r => r.safe_to_drink).length
  const unsafeCount = reports.length - safeCount

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "well": return Waves
      case "tap": return Droplets
      case "river": return Waves
      case "pond": return Droplets
      default: return Search
    }
  }

  const getSourceLabel = (type: string) => {
    switch (type) {
      case "well": return "Well / Borewell"
      case "tap": return "Public Tap"
      case "river": return "River / Stream"
      case "pond": return "Pond / Lake"
      default: return "Other Source"
    }
  }

  return (
    <div className="min-h-screen mesh-bg pb-24">
      <Navbar userName={profile?.full_name || "User"} role={profile?.role || "user"} />
      
      <main className="mx-auto max-w-lg px-4 py-5">
        <div className="mb-6 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 shadow-sm"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{t.waterReports.title}</h1>
            <p className="text-sm text-gray-500 font-medium mt-0.5">{t.waterReports.subtitle}</p>
          </div>
          <Button 
            size="sm" 
            onClick={() => router.push('/report')}
            className="rounded-xl glass-button text-white text-xs font-bold px-4"
          >
            Report New
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-2">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-gray-900">{safeCount}</p>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">{t.waterReports.safeSources}</p>
          </div>
          <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center mb-2">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-2xl font-black text-gray-900">{unsafeCount}</p>
            <p className="text-xs font-bold text-red-700 uppercase tracking-wider">{t.waterReports.unsafeSources}</p>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            {t.waterReports.recentSubmissions}
          </h2>
          
          {reports.length > 0 ? (
            reports.map((report, idx) => {
              const Icon = getSourceIcon(report.source_type)
              return (
                <div 
                  key={report.id} 
                  className={cn(
                    "glass-card rounded-2xl p-5 stagger-fade-in transition-all hover:scale-[1.02] active:scale-[0.98]",
                    `stagger-${(idx % 5) + 1}`
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-3 rounded-xl",
                        report.safe_to_drink ? "bg-emerald-100/50" : "bg-red-100/50"
                      )}>
                        <Icon className={cn(
                          "h-6 w-6",
                          report.safe_to_drink ? "text-emerald-600" : "text-red-600"
                        )} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{getSourceLabel(report.source_type)}</h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                          <MapPin className="h-3 w-3" />
                          {report.location}
                        </div>
                      </div>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                      report.safe_to_drink 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : "bg-red-50 text-red-700 border-red-200"
                    )}>
                      {report.safe_to_drink ? t.waterReports.safe : t.waterReports.unsafe}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100/50">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-2 w-2 rounded-full",
                        report.safe_to_drink ? "bg-emerald-500" : "bg-red-500"
                      )} />
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        {report.contamination_detected ? t.waterReports.contamination : t.waterReports.noIssues}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-gray-400">
                      {new Date(report.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="glass-card rounded-2xl py-12 flex flex-col items-center justify-center text-center px-6">
              <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <Droplets className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-gray-900 font-bold text-lg">{t.waterReports.noReports}</p>
              <p className="text-gray-400 text-sm mt-1">{t.waterReports.noReportsDesc}</p>
              <Button 
                onClick={() => router.push('/report')}
                className="mt-6 rounded-xl glass-button text-white font-bold"
              >
                {t.waterReports.submitFirst}
              </Button>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
