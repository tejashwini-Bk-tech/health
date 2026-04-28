"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { BottomNav } from "@/components/BottomNav"
import { RiskCard } from "@/components/RiskCard"
import { StatCard } from "@/components/StatCard"
import { AlertCard } from "@/components/AlertCard"
import { Button } from "@/components/ui/button"
import { villages, type RiskLevel } from "@/lib/data"
import { Activity, Droplets, FileText, ChevronRight, MapPin, LogOut } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { useLanguage } from "@/hooks/use-language"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import {
  fetchAlerts,
  fetchHealthReports,
  fetchTodaysReportsCount,
  fetchWaterReports,
  calculateDiseaseStats,
  calculateOverallRisk,
  countHighRiskCases,
  calculateWaterStats,
  type DbAlert,
  type DbHealthReport,
} from "@/lib/db"

export default function DashboardPage() {
  const router = useRouter()
  const { user, profile, isLoading, logout } = useAuth()
  const { t } = useLanguage()
  
  // Data from database
  const [alerts, setAlerts] = useState<DbAlert[]>([])
  const [reports, setReports] = useState<DbHealthReport[]>([])
  const [todaysReports, setTodaysReports] = useState(24)
  const [waterSafe, setWaterSafe] = useState(3)
  const [waterTotal, setWaterTotal] = useState(8)
  const [diseaseStats, setDiseaseStats] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [greeting, setGreeting] = useState(t.dashboard.greeting || "Good Morning!")

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting(t.dashboard.goodMorning || t.dashboard.greeting)
    else if (hour < 17) setGreeting(t.dashboard.goodAfternoon || "Good Afternoon!")
    else setGreeting(t.dashboard.goodEvening || "Good Evening!")
  }, [t.dashboard])

  // Fetch data and setup real-time listeners
  useEffect(() => {
    const loadData = async () => {
      setDataLoading(true)
      
      try {
        const [alertsData, reportsData, todaysCount, waterData] = await Promise.all([
          fetchAlerts(),
          fetchHealthReports(),
          fetchTodaysReportsCount(),
          fetchWaterReports(),
        ])
        
        setAlerts(alertsData)
        setReports(reportsData)
        setTodaysReports(todaysCount)
        
        const waterStats = calculateWaterStats(waterData)
        setWaterSafe(waterStats.safe)
        setWaterTotal(waterStats.total)
        
        const stats = calculateDiseaseStats(reportsData)
        // If no real stats, use defaults
        if (stats.length === 0) {
          setDiseaseStats([
            { name: "Cholera", cases: 78, trend: "increasing", percentChange: 23 },
            { name: "Typhoid", cases: 45, trend: "stable", percentChange: 2 },
            { name: "Dysentery", cases: 32, trend: "decreasing", percentChange: -15 },
            { name: "Hepatitis A", cases: 18, trend: "increasing", percentChange: 12 },
          ])
        } else {
          setDiseaseStats(stats)
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        // Set default data on error
        setDiseaseStats([
          { name: "Cholera", cases: 78, trend: "increasing", percentChange: 23 },
          { name: "Typhoid", cases: 45, trend: "stable", percentChange: 2 },
          { name: "Dysentery", cases: 32, trend: "decreasing", percentChange: -15 },
          { name: "Hepatitis A", cases: 18, trend: "increasing", percentChange: 12 },
        ])
        setTodaysReports(24)
        setWaterSafe(3)
        setWaterTotal(8)
      } finally {
        setDataLoading(false)
      }
    }
    
    loadData()

    // Force stop loading after 5 seconds as fallback
    const timeout = setTimeout(() => {
      console.log('Dashboard loading timeout - forcing display')
      setDataLoading(false)
    }, 5000)

    // Setup real-time subscription only if supabase is available
    let channel: any = null
    if (supabase) {
      channel = supabase
        .channel('dashboard-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => {
          console.log('Real-time: Alerts updated')
          loadData()
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'health_reports' }, () => {
          console.log('Real-time: Health reports updated')
          loadData()
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'water_reports' }, () => {
          console.log('Real-time: Water reports updated')
          loadData()
        })
        .subscribe()
    }

    return () => {
      clearTimeout(timeout)
      if (channel && supabase) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  // Note: Auth is now handled by middleware - no client-side redirect needed

  const handleLogout = async () => {
    await logout()
    toast.success("Logged out successfully")
  }

  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-3 border-[hsl(160,84%,39%,0.2)] border-t-[hsl(160,84%,50%)] rounded-full animate-spin" />
            <div className="absolute inset-0 w-12 h-12 rounded-full bg-[hsl(160,84%,39%)] opacity-20 blur-xl animate-glow-pulse" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Calculate overall stats from real data
  const totalCases = reports.filter(r => r.status !== "resolved").length 
  
  const highRiskVillages = countHighRiskCases(reports)
  
  const activeAlerts = alerts.length
  
  // Get the highest risk level from real data
  const overallRisk = calculateOverallRisk(reports)

  // Get critical alerts (top 2)
  const criticalAlerts = alerts
    .slice(0, 2)

  const riskDotColors: Record<string, string> = {
    critical: "bg-[hsl(0,85%,62%)]",
    high: "bg-[hsl(25,95%,55%)]",
    moderate: "bg-[hsl(38,92%,58%)]",
    low: "bg-[hsl(160,84%,50%)]",
  }

  return (
    <div className="min-h-screen mesh-bg pb-24">
      <Navbar 
        userName={profile?.full_name || profile?.email || "User"} 
        role={profile?.role || "user"} 
        notificationCount={activeAlerts} 
      />
      
      <main className="mx-auto max-w-lg px-4 py-5">
        {/* Welcome Section */}
        <section className="mb-6 flex items-center justify-between stagger-fade-in stagger-1">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{greeting}</h1>
            <p className="text-sm text-gray-500 font-medium mt-0.5">{t.dashboard.subtitle}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleLogout}
            className="text-gray-400 hover:text-[hsl(0,75%,45%)] hover:bg-[hsl(0,85%,62%,0.1)] rounded-xl transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </section>

        {/* Overall Risk Status */}
        <section className="mb-6 stagger-fade-in stagger-2">
          <RiskCard
            level={overallRisk}
            title={t.dashboard.areaStatus}
            subtitle={t.dashboard.basedOnNearby}
            value={`${totalCases}`}
          />
        </section>

        {/* Quick Stats */}
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between stagger-fade-in stagger-3">
            <h2 className="text-base font-bold text-gray-800">{t.dashboard.quickStats}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="stagger-fade-in stagger-3">
              <StatCard
                title={t.dashboard.activeCases}
                value={totalCases}
                subtitle={t.dashboard.inYourRegion}
                trend="increasing"
                trendValue={`+12% ${t.dashboard.thisWeek}`}
                icon={Activity}
                iconColor="text-red-500"
              />
            </div>
            <div className="stagger-fade-in stagger-4">
              <StatCard
                title={t.dashboard.villagesAtRisk}
                value={highRiskVillages}
                subtitle={t.dashboard.needAttention}
                icon={MapPin}
                iconColor="text-orange-500"
              />
            </div>
            <div className="stagger-fade-in stagger-5">
              <StatCard
                title={t.dashboard.reportsToday}
                value={todaysReports}
                subtitle={t.dashboard.fromCommunity}
                icon={FileText}
                iconColor="text-blue-500"
              />
            </div>
            <div className="stagger-fade-in stagger-6">
              <Link href="/water-reports">
                <StatCard
                  title={t.dashboard.waterSources}
                  value={`${waterSafe}/${waterTotal}`}
                  subtitle={t.dashboard.safeToUse}
                  icon={Droplets}
                  iconColor="text-teal-500"
                  className="cursor-pointer hover:scale-[1.02] transition-all"
                />
              </Link>
            </div>
          </div>
        </section>

        {/* Disease Trends */}
        <section className="mb-6 stagger-fade-in stagger-7">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-800">{t.dashboard.diseaseTrends}</h2>
          </div>
          <div className="glass-card rounded-2xl p-5">
            {diseaseStats.length > 0 ? (
              <div className="space-y-4">
                {diseaseStats.map((disease: any) => {
                  const barWidth = Math.min(100, (disease.cases / (diseaseStats[0]?.cases || 1)) * 100)
                  const barColor = disease.trend === "increasing" ? "hsl(0, 85%, 62%)" :
                    disease.trend === "decreasing" ? "hsl(160, 84%, 50%)" : "hsl(38, 92%, 58%)"
                  
                  return (
                    <div key={disease.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-gray-800">
                          {(t.disease as any)?.[disease.name.toLowerCase().replace(' ', '_')] || disease.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 font-medium">{disease.cases} {t.dashboard.cases}</span>
                          <span className={`text-[11px] font-bold ${
                            disease.trend === "increasing" ? "text-[hsl(0,75%,45%)]" :
                            disease.trend === "decreasing" ? "text-[hsl(160,84%,32%)]" : "text-[hsl(38,80%,38%)]"
                          }`}>
                            {disease.percentChange > 0 ? "+" : ""}{disease.percentChange}%
                          </span>
                        </div>
                      </div>
                      {/* Animated bar */}
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${barWidth}%`,
                            background: `linear-gradient(90deg, ${barColor}, ${barColor}dd)`,
                            boxShadow: `0 0 10px ${barColor}40`,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-center text-gray-400 py-4">{t.dashboard.noRecentData}</p>
            )}
          </div>
        </section>

        {/* Active Alerts */}
        <section className="mb-6 stagger-fade-in stagger-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-800">{t.dashboard.activeAlerts}</h2>
            <Link href="/alerts">
              <Button variant="ghost" size="sm" className="text-[hsl(160,84%,32%)] hover:text-[hsl(160,84%,25%)] hover:bg-[hsl(160,84%,39%,0.1)] rounded-lg text-xs font-semibold">
                {t.dashboard.viewAll}
                <ChevronRight className="ml-0.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {criticalAlerts.length > 0 ? (
              criticalAlerts.map((alert) => (
                <AlertCard 
                  key={alert.id} 
                  alert={{
                    id: alert.id,
                    title: alert.title,
                    description: alert.description,
                    type: (alert.type || 'warning') as any,
                    severity: alert.severity,
                    createdAt: new Date(alert.created_at),
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    isActive: alert.status === 'active',
                    villageIds: alert.affected_areas || []
                  }} 
                />
              ))
            ) : (
              <div className="glass-card rounded-2xl py-8 text-center">
                <p className="text-sm text-gray-400 font-medium">{t.dashboard.noActiveAlerts}</p>
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-6">
          <div className="mb-3">
            <h2 className="text-base font-bold text-gray-800">{t.dashboard.quickActions}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/report">
              <div className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col items-center gap-3 group cursor-pointer">
                <div className="rounded-xl p-3 bg-[hsl(160,84%,50%,0.12)] transition-transform duration-300 group-hover:scale-110" style={{ boxShadow: "0 0 20px hsl(160, 84%, 50%, 0.15)" }}>
                  <FileText className="h-6 w-6 text-[hsl(160,84%,32%)]" />
                </div>
                <span className="font-semibold text-sm text-[hsl(160,84%,32%)]">{t.dashboard.reportSymptoms}</span>
              </div>
            </Link>
            <Link href="/map">
              <div className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col items-center gap-3 group cursor-pointer">
                <div className="rounded-xl p-3 bg-[hsl(210,90%,60%,0.12)] transition-transform duration-300 group-hover:scale-110" style={{ boxShadow: "0 0 20px hsl(210, 90%, 60%, 0.15)" }}>
                  <MapPin className="h-6 w-6 text-[hsl(210,80%,42%)]" />
                </div>
                <span className="font-semibold text-sm text-[hsl(210,80%,42%)]">{t.dashboard.viewMap}</span>
              </div>
            </Link>
          </div>
        </section>

        {/* Nearby Villages */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-800">{t.dashboard.nearbyVillages}</h2>
            <Link href="/map">
              <Button variant="ghost" size="sm" className="text-[hsl(160,84%,32%)] hover:text-[hsl(160,84%,25%)] hover:bg-[hsl(160,84%,39%,0.1)] rounded-lg text-xs font-semibold">
                {t.dashboard.seeMap}
                <ChevronRight className="ml-0.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {villages.slice(0, 4).map((village) => (
              <div
                key={village.id}
                className="flex items-center justify-between glass-card glass-card-hover rounded-xl p-3.5"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full shadow-lg ${riskDotColors[village.riskLevel]}`}
                    style={{ boxShadow: `0 0 8px ${village.riskLevel === "critical" ? "hsl(0,85%,62%,0.5)" : village.riskLevel === "high" ? "hsl(25,95%,55%,0.5)" : village.riskLevel === "moderate" ? "hsl(38,92%,58%,0.5)" : "hsl(160,84%,50%,0.5)"}` }}
                  />
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{village.name}</p>
                    <p className="text-[11px] text-gray-400">{village.district}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">{village.activeCases} <span className="text-[11px] font-medium text-gray-400">{t.dashboard.cases}</span></p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${
                    village.riskLevel === "critical" ? "text-[hsl(0,75%,45%)]" :
                    village.riskLevel === "high" ? "text-[hsl(25,80%,40%)]" :
                    village.riskLevel === "moderate" ? "text-[hsl(38,80%,38%)]" : "text-[hsl(160,84%,32%)]"
                  }`}>{(t.risk as any)[village.riskLevel]} {t.map.risk}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}
