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
import { 
  fetchHealthReports, 
  fetchWaterReports 
} from "@/lib/db"
import { ShieldCheck, ShieldAlert } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

const DynamicMap = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse bg-emerald-100/50 flex items-center justify-center">
      <span className="text-emerald-700 font-medium tracking-wide">Loading Map...</span>
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
      console.log('Map - fetching data...')
      const [reports, waterData] = await Promise.all([
        fetchHealthReports(),
        fetchWaterReports()
      ])
      
      console.log('Map - data received:', { reports: reports.length, water: waterData.length })
      setWaterReports(waterData)
      const activeReports = reports.filter(r => r.status !== 'resolved')
      
      // Update active cases for each village based on real reports
      const updatedVillages = initialVillages.map(village => {
        // Find reports matching this village name or location
        const villageCases = activeReports.filter(r => 
          r.location === village.name || 
          r.location?.toLowerCase().includes(village.name.toLowerCase())
        ).length
        
        // Calculate risk level based on case count
        let riskLevel: RiskLevel = 'low'
        if (villageCases > 30) riskLevel = 'critical'
        else if (villageCases > 15) riskLevel = 'high'
        else if (villageCases > 5) riskLevel = 'moderate'
        
        return {
          ...village,
          activeCases: villageCases > 0 ? villageCases : village.activeCases, // fallback to initial only if 0 (optional)
          riskLevel: villageCases > 0 ? riskLevel : village.riskLevel
        }
      })
      
      setVillages(updatedVillages)
      setLoading(false)
    } catch (err) {
      console.error('Map - error loading data:', err)
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMapData()

    // Real-time listener for health reports
    const channel = supabase
      .channel('map-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'health_reports' }, () => {
        console.log('Real-time: Map data updated')
        loadMapData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const filteredVillages = filterRisk === "all" 
    ? villages 
    : villages.filter(v => v.riskLevel === filterRisk)

  const getRiskStyle = (risk: RiskLevel) => {
    const styles = {
      low: "bg-emerald-500 shadow-emerald-500/50",
      moderate: "bg-amber-500 shadow-amber-500/50",
      high: "bg-orange-500 shadow-orange-500/50",
      critical: "bg-red-500 shadow-red-500/50"
    }
    return styles[risk]
  }

  const getRiskBadgeStyle = (risk: RiskLevel) => {
    const styles = {
      low: "bg-emerald-100 text-emerald-700 border-emerald-200",
      moderate: "bg-amber-100 text-amber-700 border-amber-200",
      high: "bg-orange-100 text-orange-700 border-orange-200",
      critical: "bg-red-100 text-red-700 border-red-200"
    }
    return styles[risk]
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar userName="Rahul" role="user" />

      <main className="mx-auto max-w-lg px-4 py-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900">{t.map.title}</h1>
          <p className="text-sm text-slate-500">{t.map.subtitle}</p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Button
            variant={filterRisk === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterRisk("all")}
            className={cn(
              "shrink-0 rounded-full font-medium transition-all shadow-sm",
              filterRisk === "all" ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-white"
            )}
          >
            <Filter className="mr-1.5 h-3.5 w-3.5" />
            {t.risk.all}
          </Button>
          {(["critical", "high", "moderate", "low"] as RiskLevel[]).map((risk) => (
            <Button
              key={risk}
              variant={filterRisk === risk ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterRisk(risk)}
              className={cn(
                "shrink-0 rounded-full font-medium capitalize transition-all shadow-sm",
                filterRisk === risk && (
                  risk === "critical" ? "bg-red-600 hover:bg-red-700 text-white" :
                  risk === "high" ? "bg-orange-500 hover:bg-orange-600 text-white" :
                  risk === "moderate" ? "bg-amber-500 hover:bg-amber-600 text-white" :
                  "bg-emerald-500 hover:bg-emerald-600 text-white"
                ),
                filterRisk !== risk && "bg-white"
              )}
            >
              {t.risk[risk]}
            </Button>
          ))}
        </div>

        {/* Map Container */}
        <div className="relative mb-6 h-96 overflow-hidden rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-slate-100">
          
          <div className="absolute left-4 top-4 z-[400] rounded-lg bg-white/95 px-3 py-1.5 text-sm font-bold text-slate-900 shadow-sm backdrop-blur">
            {t.map.region}
          </div>

          <DynamicMap 
            villages={filteredVillages} 
            selectedVillage={selectedVillage} 
            onSelectVillage={setSelectedVillage} 
          />

          {/* Legend */}
          <div className="absolute bottom-4 right-4 z-[400] rounded-lg bg-white/95 p-2.5 shadow-sm backdrop-blur">
            <p className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.map.riskLevel}</p>
            <div className="space-y-1.5">
              {[
                { level: "critical", color: "bg-red-500" },
                { level: "high", color: "bg-orange-500" },
                { level: "moderate", color: "bg-amber-500" },
                { level: "low", color: "bg-emerald-500" },
              ].map((item) => (
                <div key={item.level} className="flex items-center gap-2">
                  <div className={cn("h-2.5 w-2.5 rounded-full shadow-sm", item.color)} />
                  <span className="text-xs font-medium text-slate-700">{t.risk[item.level as RiskLevel]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Village Details */}
        {selectedVillage && (
          <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden">
             {/* Decorative Background gradient based on risk */}
            <div className={cn(
               "absolute top-0 left-0 w-full h-1", 
               selectedVillage.riskLevel === 'critical' ? 'bg-red-500' :
               selectedVillage.riskLevel === 'high' ? 'bg-orange-500' :
               selectedVillage.riskLevel === 'moderate' ? 'bg-amber-500' : 'bg-emerald-500'
            )} />
            
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-slate-900">{selectedVillage.name}</h3>
                  <span className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    getRiskBadgeStyle(selectedVillage.riskLevel)
                  )}>
                    {t.risk[selectedVillage.riskLevel]}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-500">{selectedVillage.district}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedVillage(null)}
                className="h-8 w-8 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 flex flex-col items-center justify-center text-center transition-colors hover:bg-slate-100">
                <Activity className="mb-1.5 h-5 w-5 text-red-500" />
                <p className="text-2xl font-bold text-slate-900 leading-none">{selectedVillage.activeCases}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">{t.map.activeCases}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 flex flex-col items-center justify-center text-center transition-colors hover:bg-slate-100">
                {(() => {
                  const villageWater = waterReports
                    .filter(w => w.location === selectedVillage.name)
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
                  
                  const isSafe = villageWater ? villageWater.safe_to_drink : true;
                  
                  return (
                    <>
                      {isSafe ? (
                        <ShieldCheck className="mb-1.5 h-5 w-5 text-emerald-500" />
                      ) : (
                        <ShieldAlert className="mb-1.5 h-5 w-5 text-red-500" />
                      )}
                      <p className={cn("text-lg font-bold leading-none", isSafe ? "text-emerald-600" : "text-red-600")}>
                        {isSafe ? t.map.safeWater : t.map.unsafeWater}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">{t.map.waterQuality}</p>
                    </>
                  )
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Village List */}
        <div>
          <h2 className="mb-4 text-lg font-bold text-slate-900">{t.map.allVillages}</h2>
          <div className="space-y-3">
            {filteredVillages.map((village) => (
              <button
                key={village.id}
                onClick={() => setSelectedVillage(village)}
                className={cn(
                  "group flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all shadow-sm",
                  selectedVillage?.id === village.id
                    ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500 ring-offset-1"
                    : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md"
                )}
              >
                <div className="flex items-center gap-3.5">
                  <div className={cn("h-3 w-3 rounded-full shadow-sm", getRiskStyle(village.riskLevel).split(" ")[0])} />
                  <div>
                    <p className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">{village.name}</p>
                    <p className="text-xs font-medium text-slate-500">{village.district}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{village.activeCases} <span className="font-medium text-slate-500 text-xs">{t.map.cases}</span></p>
                  <p className={cn(
                    "text-[10px] font-bold uppercase tracking-wider mt-0.5",
                    village.riskLevel === "critical" ? "text-red-600" :
                    village.riskLevel === "high" ? "text-orange-600" :
                    village.riskLevel === "moderate" ? "text-amber-600" : "text-emerald-600"
                  )}>
                    {t.risk[village.riskLevel]} {t.map.risk}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
