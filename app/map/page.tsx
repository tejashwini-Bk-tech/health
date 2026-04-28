"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Navbar } from "@/components/Navbar"
import { BottomNav } from "@/components/BottomNav"
import { Button } from "@/components/ui/button"
import { villages as initialVillages, type Village, type RiskLevel } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Filter, X, Activity } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { fetchHealthReports, fetchWaterReports } from "@/lib/db"
import { ShieldCheck, ShieldAlert } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

const DynamicMap = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[hsl(160,84%,39%,0.3)] border-t-[hsl(160,84%,50%)] rounded-full animate-spin"/>
        <span className="text-gray-500 text-sm font-medium">Loading Map...</span>
      </div>
    </div>
  )
})

export default function MapPage() {
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null)
  const [filterRisk, setFilterRisk] = useState<RiskLevel | "all">("all")
  const [villages, setVillages] = useState<Village[]>(initialVillages)
  const [waterReports, setWaterReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  const loadMapData = async () => {
    try {
      const [reports, waterData] = await Promise.all([fetchHealthReports(), fetchWaterReports()])
      setWaterReports(waterData)
      const activeReports = reports.filter(r => r.status !== 'resolved')
      const updatedVillages = initialVillages.map(village => {
        const villageCases = activeReports.filter(r => r.location === village.name || r.location?.toLowerCase().includes(village.name.toLowerCase())).length
        let riskLevel: RiskLevel = 'low'
        if (villageCases > 30) riskLevel = 'critical'
        else if (villageCases > 15) riskLevel = 'high'
        else if (villageCases > 5) riskLevel = 'moderate'
        return { ...village, activeCases: villageCases > 0 ? villageCases : village.activeCases, riskLevel: villageCases > 0 ? riskLevel : village.riskLevel }
      })
      setVillages(updatedVillages)
      setLoading(false)
    } catch { setLoading(false) }
  }

  useEffect(() => {
    loadMapData()
    const channel = supabase.channel('map-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'health_reports' }, () => loadMapData())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const filteredVillages = filterRisk === "all" ? villages : villages.filter(v => v.riskLevel === filterRisk)

  const riskDotColor: Record<string, string> = {
    low: "hsl(160,84%,50%)", moderate: "hsl(38,92%,58%)", high: "hsl(25,95%,55%)", critical: "hsl(0,85%,62%)"
  }
  const riskTextColor: Record<string, string> = {
    low: "text-[hsl(160,84%,32%)]", moderate: "text-[hsl(38,80%,38%)]", high: "text-[hsl(25,80%,40%)]", critical: "text-[hsl(0,75%,42%)]"
  }

  return (
    <div className="min-h-screen mesh-bg pb-24">
      <Navbar userName="Rahul" role="user" />
      <main className="mx-auto max-w-lg px-4 py-5">
        <div className="mb-4 stagger-fade-in stagger-1">
          <h1 className="text-2xl font-extrabold text-gray-900">{t.map.title}</h1>
          <p className="text-sm text-gray-500">{t.map.subtitle}</p>
        </div>

        {/* Filters */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-none stagger-fade-in stagger-2">
          <button onClick={()=>setFilterRisk("all")} className={cn("shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5",
            filterRisk==="all"?"bg-gray-900 text-white shadow-lg":"glass-card text-gray-500")}>
            <Filter className="h-3.5 w-3.5"/>{t.risk.all}
          </button>
          {(["critical","high","moderate","low"] as RiskLevel[]).map(risk=>(
            <button key={risk} onClick={()=>setFilterRisk(risk)} className={cn("shrink-0 rounded-xl px-4 py-2 text-xs font-bold capitalize transition-all",
              filterRisk===risk ? "text-white shadow-lg" : "glass-card text-gray-500")}
              style={filterRisk===risk?{background:riskDotColor[risk],boxShadow:`0 4px 15px ${riskDotColor[risk]}40`}:{}}>
              {t.risk[risk]}
            </button>
          ))}
        </div>

        {/* Map */}
        <div className="relative mb-6 h-96 overflow-hidden rounded-2xl glass-card stagger-fade-in stagger-3">
          <div className="absolute left-4 top-4 z-[400] rounded-lg px-3 py-1.5 text-sm font-bold text-gray-900 glass-nav">{t.map.region}</div>
          <DynamicMap villages={filteredVillages} selectedVillage={selectedVillage} onSelectVillage={setSelectedVillage} />
          <div className="absolute bottom-4 right-4 z-[400] rounded-xl p-3 glass-nav">
            <p className="mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.map.riskLevel}</p>
            <div className="space-y-1.5">
              {[{level:"critical",color:"hsl(0,85%,62%)"},{level:"high",color:"hsl(25,95%,55%)"},{level:"moderate",color:"hsl(38,92%,58%)"},{level:"low",color:"hsl(160,84%,50%)"}].map(item=>(
                <div key={item.level} className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{background:item.color,boxShadow:`0 0 6px ${item.color}60`}}/>
                  <span className="text-xs font-medium text-gray-600">{t.risk[item.level as RiskLevel]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Village */}
        {selectedVillage && (
          <div className="mb-6 slide-up-enter glass-card rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] rounded-full" style={{background:riskDotColor[selectedVillage.riskLevel]}}/>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-extrabold text-gray-900">{selectedVillage.name}</h3>
                  <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",riskTextColor[selectedVillage.riskLevel])}
                    style={{background:`${riskDotColor[selectedVillage.riskLevel]}15`}}>{t.risk[selectedVillage.riskLevel]}</span>
                </div>
                <p className="text-sm text-gray-500">{selectedVillage.district}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={()=>setSelectedVillage(null)} className="h-8 w-8 text-gray-400 hover:text-gray-800 rounded-full hover:bg-gray-100"><X className="h-4 w-4"/></Button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="glass-card rounded-xl p-3.5 flex flex-col items-center text-center">
                <Activity className="mb-1.5 h-5 w-5 text-[hsl(0,75%,45%)]"/>
                <p className="text-2xl font-extrabold text-gray-900">{selectedVillage.activeCases}</p>
                <p className="mt-1 text-[11px] font-medium text-gray-400">{t.map.activeCases}</p>
              </div>
              <div className="glass-card rounded-xl p-3.5 flex flex-col items-center text-center">
                {(()=>{
                  const villageWater = waterReports.filter(w=>w.location===selectedVillage.name).sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime())[0]
                  const isSafe = villageWater ? villageWater.safe_to_drink : true
                  return(<>
                    {isSafe?<ShieldCheck className="mb-1.5 h-5 w-5 text-[hsl(160,84%,32%)]"/>:<ShieldAlert className="mb-1.5 h-5 w-5 text-[hsl(0,75%,45%)]"/>}
                    <p className={cn("text-lg font-bold",isSafe?"text-[hsl(160,84%,32%)]":"text-[hsl(0,75%,45%)]")}>{isSafe?t.map.safeWater:t.map.unsafeWater}</p>
                    <p className="mt-1 text-[11px] font-medium text-gray-400">{t.map.waterQuality}</p>
                  </>)
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Village List */}
        <div>
          <h2 className="mb-4 text-lg font-bold text-gray-800">{t.map.allVillages}</h2>
          {filteredVillages.length===0?(
            <div className="glass-card rounded-xl p-6 text-center"><p className="font-medium text-gray-500">No villages match this filter.</p></div>
          ):(
            <div className="space-y-2">
              {filteredVillages.map(village=>(
                <button key={village.id} onClick={()=>setSelectedVillage(village)}
                  className={cn("group flex w-full items-center justify-between rounded-xl p-4 text-left transition-all",
                    selectedVillage?.id===village.id?"glass-card border-[hsl(160,84%,39%,0.4)] glow-accent":"glass-card glass-card-hover")}>
                  <div className="flex items-center gap-3.5">
                    <div className="h-3 w-3 rounded-full" style={{background:riskDotColor[village.riskLevel],boxShadow:`0 0 8px ${riskDotColor[village.riskLevel]}50`}}/>
                    <div><p className="font-semibold text-gray-800 group-hover:text-[hsl(160,84%,32%)] transition-colors">{village.name}</p><p className="text-xs text-gray-400">{village.district}</p></div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">{village.activeCases} <span className="text-xs font-medium text-gray-400">{t.map.cases}</span></p>
                    <p className={cn("text-[10px] font-bold uppercase tracking-wider mt-0.5",riskTextColor[village.riskLevel])}>{t.risk[village.riskLevel]} {t.map.risk}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
