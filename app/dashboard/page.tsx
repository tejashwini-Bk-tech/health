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
      setDiseaseStats(stats)
      
      setDataLoading(false)
    }
    
    loadData()

    // Real-time subscriptions
    const channel = supabase
      .channel('dashboard-updates')
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

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Note: Auth is now handled by middleware - no client-side redirect needed

  const handleLogout = async () => {
    await logout()
    toast.success("Logged out successfully")
  }

  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-background pb-20">
      <Navbar 
        userName={profile?.full_name || profile?.email || "User"} 
        role={profile?.role || "user"} 
        notificationCount={activeAlerts} 
      />
      
      <main className="mx-auto max-w-lg px-4 py-4">
        {/* Welcome Section */}
        <section className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{greeting}</h1>
            <p className="text-muted-foreground">{t.dashboard.subtitle}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-500"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </section>

        {/* Overall Risk Status */}
        <section className="mb-6">
          <RiskCard
            level={overallRisk}
            title={t.dashboard.areaStatus}
            subtitle={t.dashboard.basedOnNearby}
            value={`${totalCases}`}
          />
        </section>

        {/* Quick Stats */}
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">{t.dashboard.quickStats}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              title={t.dashboard.activeCases}
              value={totalCases}
              subtitle={t.dashboard.inYourRegion}
              trend="increasing"
              trendValue={`+12% ${t.dashboard.thisWeek}`}
              icon={Activity}
              iconColor="text-red-500"
            />
            <StatCard
              title={t.dashboard.villagesAtRisk}
              value={highRiskVillages}
              subtitle={t.dashboard.needAttention}
              icon={MapPin}
              iconColor="text-orange-500"
            />
            <StatCard
              title={t.dashboard.reportsToday}
              value={todaysReports}
              subtitle={t.dashboard.fromCommunity}
              icon={FileText}
              iconColor="text-blue-500"
            />
            <StatCard
              title={t.dashboard.waterSources}
              value={`${waterSafe}/${waterTotal}`}
              subtitle={t.dashboard.safeToUse}
              icon={Droplets}
              iconColor="text-teal-500"
            />
          </div>
        </section>

        {/* Disease Trends */}
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">{t.dashboard.diseaseTrends}</h2>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            {diseaseStats.length > 0 ? (
              <div className="space-y-3">
                {diseaseStats.map((disease) => (
                  <div key={disease.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${
                        disease.trend === "increasing" ? "bg-red-500" :
                        disease.trend === "decreasing" ? "bg-emerald-500" : "bg-amber-500"
                      }`} />
                      <span className="font-medium">
                        {(t.disease as any)?.[disease.name.toLowerCase().replace(' ', '_')] || disease.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{disease.cases} {t.dashboard.cases}</span>
                      <span className={`text-xs font-medium ${
                        disease.trend === "increasing" ? "text-red-600" :
                        disease.trend === "decreasing" ? "text-emerald-600" : "text-amber-600"
                      }`}>
                        {disease.percentChange > 0 ? "+" : ""}{disease.percentChange}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-center text-muted-foreground py-4">{t.dashboard.noRecentData}</p>
            )}
          </div>
        </section>

        {/* Active Alerts */}
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">{t.dashboard.activeAlerts}</h2>
            <Link href="/alerts">
              <Button variant="ghost" size="sm" className="text-emerald-600">
                {t.dashboard.viewAll}
                <ChevronRight className="ml-1 h-4 w-4" />
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
              <p className="text-sm text-center text-muted-foreground py-8 rounded-xl border border-dashed">{t.dashboard.noActiveAlerts}</p>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-6">
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-foreground">{t.dashboard.quickActions}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/report">
              <Button
                variant="outline"
                className="h-auto w-full flex-col gap-2 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 hover:bg-emerald-100"
              >
                <FileText className="h-6 w-6 text-emerald-600" />
                <span className="font-medium text-emerald-700">{t.dashboard.reportSymptoms}</span>
              </Button>
            </Link>
            <Link href="/map">
              <Button
                variant="outline"
                className="h-auto w-full flex-col gap-2 rounded-2xl border-2 border-teal-200 bg-teal-50 p-4 hover:bg-teal-100"
              >
                <MapPin className="h-6 w-6 text-teal-600" />
                <span className="font-medium text-teal-700">{t.dashboard.viewMap}</span>
              </Button>
            </Link>
          </div>
        </section>

        {/* Nearby Villages */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">{t.dashboard.nearbyVillages}</h2>
            <Link href="/map">
              <Button variant="ghost" size="sm" className="text-emerald-600">
                {t.dashboard.seeMap}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {villages.slice(0, 4).map((village) => (
              <div
                key={village.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${
                    village.riskLevel === "critical" ? "bg-red-500" :
                    village.riskLevel === "high" ? "bg-orange-500" :
                    village.riskLevel === "moderate" ? "bg-amber-500" : "bg-emerald-500"
                  }`} />
                  <div>
                    <p className="font-medium">{village.name}</p>
                    <p className="text-xs text-muted-foreground">{village.district}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{village.activeCases} {t.dashboard.cases}</p>
                  <p className="text-xs capitalize text-muted-foreground">{(t.risk as any)[village.riskLevel]} {t.map.risk}</p>
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
