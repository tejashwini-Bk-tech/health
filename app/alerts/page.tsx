"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/Navbar"
import { BottomNav } from "@/components/BottomNav"
import { AlertCard } from "@/components/AlertCard"
import { Button } from "@/components/ui/button"
import { villages, type Alert, type RiskLevel } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Bell, X, MapPin, Calendar, Clock, ShieldAlert, AlertTriangle, Info, Heart } from "lucide-react"
import { fetchAlerts, type DbAlert } from "@/lib/db"
import { supabase } from "@/lib/supabase"
import { useLanguage } from "@/hooks/use-language"

export default function AlertsPage() {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [filterType, setFilterType] = useState<"all" | "outbreak" | "warning" | "info" | "prevention">("all")
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  // Fetch alerts from database
  useEffect(() => {
    const loadAlerts = async () => {
      const data = await fetchAlerts()
      // Transform DbAlert to Alert format
      const transformed: Alert[] = data.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        type: (a.type || 'warning') as any,
        severity: a.severity,
        createdAt: new Date(a.created_at),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: a.status === 'active',
        villageIds: a.affected_areas || []
      }))
      setAlerts(transformed.length > 0 ? transformed : [])
      setLoading(false)
    }
    
    loadAlerts()

    // Real-time subscription
    const channel = supabase
      .channel('alerts-page-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, (payload) => {
        console.log('Real-time: Alert change detected', payload)
        loadAlerts()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const filteredAlerts = filterType === "all"
    ? alerts
    : alerts.filter((a: Alert) => a.type === filterType)

  const activeAlerts = alerts.filter((a: Alert) => a.isActive)

  const typeIcons = {
    outbreak: ShieldAlert,
    warning: AlertTriangle,
    info: Info,
    prevention: Heart,
  }

  const formatFullDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getRiskBadgeStyle = (risk: RiskLevel) => {
    const styles = {
      low: "bg-emerald-100 text-emerald-700",
      moderate: "bg-amber-100 text-amber-700",
      high: "bg-orange-100 text-orange-700",
      critical: "bg-red-100 text-red-700",
    }
    return styles[risk]
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-background pb-20">
      <Navbar userName="Rahul" role="user" notificationCount={activeAlerts.length} />

      <main className="mx-auto max-w-lg px-4 py-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">{t.alerts.title}</h1>
            <p className="text-sm text-muted-foreground">{t.alerts.subtitle}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <Bell className="h-5 w-5 text-red-600" />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {[
            { value: "all", label: t.alerts.filterAll },
            { value: "outbreak", label: "Outbreaks" },
            { value: "warning", label: "Warnings" },
            { value: "info", label: "Info" },
            { value: "prevention", label: "Prevention" },
          ].map((tab) => (
            <Button
              key={tab.value}
              variant={filterType === tab.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(tab.value as typeof filterType)}
              className={cn(
                "shrink-0 rounded-full",
                filterType === tab.value && "bg-emerald-600 hover:bg-emerald-700"
              )}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Critical Alert Banner */}
        {activeAlerts.some(a => a.severity === "critical") && (
          <div className="mb-4 rounded-2xl bg-red-500 p-4 text-white">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              <span className="font-semibold">Critical Alert Active</span>
            </div>
            <p className="mt-1 text-sm text-red-100">
              There is an active outbreak in your region. Please take necessary precautions.
            </p>
          </div>
        )}

        {/* Alert List */}
        <div className="space-y-3">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onClick={() => setSelectedAlert(alert)}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 font-medium text-muted-foreground">{t.alerts.noAlerts}</p>
            </div>
          )}
        </div>
      </main>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-8 rounded-t-3xl bg-background p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl",
                    selectedAlert.severity === "critical" ? "bg-red-500" :
                    selectedAlert.severity === "high" ? "bg-orange-500" :
                    selectedAlert.severity === "moderate" ? "bg-amber-500" : "bg-emerald-500"
                  )}
                >
                  {(() => {
                    const Icon = typeIcons[selectedAlert.type]
                    return <Icon className="h-6 w-6 text-white" />
                  })()}
                </div>
                <div>
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                    getRiskBadgeStyle(selectedAlert.severity)
                  )}>
                    {(t.risk as any)[selectedAlert.severity]}
                  </span>
                  <h2 className="mt-1 text-lg font-bold">{selectedAlert.title}</h2>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedAlert(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <p className="text-muted-foreground">{selectedAlert.description}</p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  Affected areas: {selectedAlert.villageIds.map(id => 
                    villages.find(v => v.id === id)?.name
                  ).join(", ")}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Issued: {formatFullDate(selectedAlert.createdAt)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Expires: {formatFullDate(selectedAlert.expiresAt)}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedAlert(null)}
              >
                Close
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                Share Alert
              </Button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
