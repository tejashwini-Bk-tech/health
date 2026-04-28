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
  const [filterType, setFilterType] = useState<"all"|"outbreak"|"warning"|"info"|"prevention">("all")
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    const loadAlerts = async () => {
      const data = await fetchAlerts()
      const transformed: Alert[] = data.map(a => ({
        id: a.id, title: a.title, description: a.description,
        type: (a.type || 'warning') as any, severity: a.severity,
        createdAt: new Date(a.created_at),
        expiresAt: new Date(Date.now() + 7*24*60*60*1000),
        isActive: a.status === 'active', villageIds: a.affected_areas || []
      }))
      setAlerts(transformed.length > 0 ? transformed : [])
      setLoading(false)
    }
    loadAlerts()
    const channel = supabase.channel('alerts-page-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => loadAlerts())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const filteredAlerts = filterType === "all" ? alerts : alerts.filter(a => a.type === filterType)
  const activeAlerts = alerts.filter(a => a.isActive)
  const typeIcons = { outbreak: ShieldAlert, warning: AlertTriangle, info: Info, prevention: Heart }

  const formatFullDate = (date: Date) => new Intl.DateTimeFormat('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(date)

  const sevColors: Record<string,{bg:string,text:string,icon:string}> = {
    critical: { bg:"hsl(0,85%,62%,0.15)", text:"hsl(0,85%,68%)", icon:"hsl(0,85%,62%)" },
    high: { bg:"hsl(25,95%,55%,0.15)", text:"hsl(25,95%,65%)", icon:"hsl(25,95%,55%)" },
    moderate: { bg:"hsl(38,92%,58%,0.15)", text:"hsl(38,92%,65%)", icon:"hsl(38,92%,58%)" },
    low: { bg:"hsl(160,84%,50%,0.15)", text:"hsl(160,84%,55%)", icon:"hsl(160,84%,50%)" },
  }

  return (
    <div className="min-h-screen mesh-bg pb-24">
      <Navbar userName="Rahul" role="user" notificationCount={activeAlerts.length} />
      <main className="mx-auto max-w-lg px-4 py-5">
        <div className="mb-5 flex items-center justify-between stagger-fade-in stagger-1">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{t.alerts.title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{t.alerts.subtitle}</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(0,85%,62%,0.12)]" style={{boxShadow:"0 0 20px hsl(0,85%,62%,0.15)"}}>
            <Bell className="h-5 w-5 text-[hsl(0,75%,45%)]" />
          </div>
        </div>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-2 scrollbar-none stagger-fade-in stagger-2">
          {[{value:"all",label:t.alerts.filterAll},{value:"outbreak",label:"Outbreaks"},{value:"warning",label:"Warnings"},{value:"info",label:"Info"},{value:"prevention",label:"Prevention"}].map(tab=>(
            <button key={tab.value} onClick={()=>setFilterType(tab.value as any)}
              className={cn("shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all",
                filterType===tab.value ? "bg-[hsl(160,84%,39%)] text-white shadow-lg shadow-[hsl(160,84%,39%,0.3)]"
                : "glass-card text-gray-500 hover:text-gray-800"
              )}>{tab.label}</button>
          ))}
        </div>

        {activeAlerts.some(a=>a.severity==="critical") && (
          <div className="mb-5 rounded-2xl p-4 relative overflow-hidden" style={{background:"linear-gradient(135deg,hsl(0,85%,62%,0.15),hsl(0,85%,50%,0.08))",border:"1px solid hsl(0,85%,62%,0.25)",boxShadow:"0 0 30px hsl(0,85%,62%,0.1)"}}>
            <div className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-[hsl(0,75%,42%)]" /><span className="font-bold text-[hsl(0,75%,42%)]">Critical Alert Active</span></div>
            <p className="mt-1 text-sm text-[hsl(0,60%,55%)]">There is an active outbreak in your region. Please take necessary precautions.</p>
          </div>
        )}

        <div className="space-y-3">
          {filteredAlerts.length > 0 ? filteredAlerts.map((alert,i)=>(
            <div key={alert.id} className="stagger-fade-in" style={{animationDelay:`${0.05*i}s`}}>
              <AlertCard alert={alert} onClick={()=>setSelectedAlert(alert)} />
            </div>
          )) : (
            <div className="glass-card rounded-2xl p-10 text-center">
              <Bell className="mx-auto h-8 w-8 text-gray-300 mb-3" />
              <p className="font-semibold text-gray-500">{t.alerts.noAlerts}</p>
            </div>
          )}
        </div>
      </main>

      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm p-4" onClick={()=>setSelectedAlert(null)}>
          <div className="w-full max-w-lg slide-up-enter rounded-t-3xl p-6 glass-card" style={{background:"hsl(0,0%,100%,0.97)"}} onClick={e=>e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{background:sevColors[selectedAlert.severity].bg}}>
                  {(()=>{const Icon=typeIcons[selectedAlert.type];return <Icon className="h-6 w-6" style={{color:sevColors[selectedAlert.severity].icon}}/>})()}
                </div>
                <div>
                  <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider" style={{background:sevColors[selectedAlert.severity].bg,color:sevColors[selectedAlert.severity].text}}>{(t.risk as any)[selectedAlert.severity]}</span>
                  <h2 className="mt-1 text-lg font-bold text-gray-900">{selectedAlert.title}</h2>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={()=>setSelectedAlert(null)} className="text-gray-400 hover:text-gray-800 rounded-xl"><X className="h-5 w-5"/></Button>
            </div>
            <p className="text-gray-600 leading-relaxed">{selectedAlert.description}</p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm"><MapPin className="h-4 w-4 text-gray-400"/><span className="text-gray-600">Affected: {selectedAlert.villageIds.map(id=>villages.find(v=>v.id===id)?.name).join(", ")}</span></div>
              <div className="flex items-center gap-3 text-sm"><Calendar className="h-4 w-4 text-gray-400"/><span className="text-gray-600">Issued: {formatFullDate(selectedAlert.createdAt)}</span></div>
              <div className="flex items-center gap-3 text-sm"><Clock className="h-4 w-4 text-gray-400"/><span className="text-gray-600">Expires: {formatFullDate(selectedAlert.expiresAt)}</span></div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-100" onClick={()=>setSelectedAlert(null)}>Close</Button>
              <Button className="flex-1 rounded-xl glass-button text-white font-bold">Share Alert</Button>
            </div>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  )
}
