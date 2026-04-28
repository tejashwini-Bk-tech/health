"use client"

import { useState } from "react"
import { Navbar } from "@/components/Navbar"
import { BottomNav } from "@/components/BottomNav"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { symptoms, villages } from "@/lib/data"
import { cn } from "@/lib/utils"
import { CheckCircle, ChevronLeft, ChevronRight, Send, MapPin, Info, Search, Activity, Droplets, Waves, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { submitHealthReport, submitWaterReport } from "@/lib/db"
import { toast } from "sonner"
import { useLanguage } from "@/hooks/use-language"

type ReportType = "health" | "water"
type Severity = "mild" | "moderate" | "severe"
type WaterSource = "well" | "tap" | "river" | "pond" | "other"
const severityMap: Record<Severity, number> = { mild: 1, moderate: 3, severe: 5 }

export default function ReportPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [reportType, setReportType] = useState<ReportType | null>(null)
  const [step, setStep] = useState(0)
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [severity, setSeverity] = useState<Severity | null>(null)
  const [waterSource, setWaterSource] = useState<WaterSource | null>(null)
  const [isWaterSafe, setIsWaterSafe] = useState<boolean | null>(null)
  const [selectedVillage, setSelectedVillage] = useState<string | null>(null)
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleSymptom = (id: string) => setSelectedSymptoms(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])

  const canProceed = () => {
    if (step === 0) return reportType !== null
    if (reportType === "health") { if (step === 1) return selectedSymptoms.length > 0; if (step === 2) return severity !== null }
    else { if (step === 1) return waterSource !== null; if (step === 2) return isWaterSafe !== null }
    if (step === 3) return selectedVillage !== null
    return true
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const village = villages.find(v => v.id === selectedVillage)
    let result;
    if (reportType === "health") {
      if (!severity) return
      result = await submitHealthReport({ symptoms: selectedSymptoms, severity: severityMap[severity], location: village?.name, notes: additionalNotes })
    } else {
      if (!waterSource || isWaterSafe === null) return
      result = await submitWaterReport({ location: village?.name || "Unknown", source_type: waterSource, safe_to_drink: isWaterSafe })
    }
    setIsSubmitting(false)
    if (result.success) { setIsSubmitted(true); toast.success("Report submitted successfully!") }
    else { toast.error(result.error || "Failed to submit report") }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen mesh-bg">
        <Navbar userName="Rahul" role="user" />
        <main className="mx-auto flex min-h-[80vh] max-w-lg flex-col items-center justify-center px-4 py-8">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[hsl(160,84%,39%)] opacity-30 blur-2xl animate-glow-pulse scale-150" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[hsl(160,84%,50%,0.15)]" style={{boxShadow:"0 0 30px hsl(160,84%,50%,0.2)"}}>
              <CheckCircle className="h-10 w-10 text-[hsl(160,84%,32%)]" />
            </div>
          </div>
          <h1 className="mt-6 text-2xl font-extrabold text-gray-900">Report Submitted!</h1>
          <p className="mt-2 text-center text-gray-500 max-w-xs">Thank you for helping keep your community safe. A health officer will review your report.</p>
          <div className="mt-8 flex gap-3">
            <Button variant="outline" className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-100"
              onClick={() => { setIsSubmitted(false); setStep(0); setReportType(null); setSelectedSymptoms([]); setSeverity(null); setWaterSource(null); setIsWaterSafe(null); setSelectedVillage(null); setAdditionalNotes("") }}>
              Submit Another
            </Button>
            <Button className="rounded-xl glass-button text-white font-bold" onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  const stepColors = { active: "hsl(160,84%,40%)", done: "hsl(160,84%,36%)", pending: "hsl(220,15%,88%)" }

  return (
    <div className="min-h-screen mesh-bg pb-24">
      <Navbar userName="Rahul" role="user" />
      <main className="mx-auto max-w-lg px-4 py-5">
        {/* Progress */}
        <div className="mb-6 stagger-fade-in stagger-1">
          <div className="flex items-center justify-between">
            {[0,1,2,3,4].map(s=>(
              <div key={s} className="flex items-center">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all",
                  step >= s ? "text-white" : "text-gray-400"
                )} style={{background: step >= s ? stepColors.done : stepColors.pending, boxShadow: step === s ? `0 0 15px ${stepColors.active}40` : "none"}}>
                  {s === 0 ? <Search className="h-4 w-4"/> : s}
                </div>
                {s < 4 && <div className="h-[2px] w-8 sm:w-12 rounded-full transition-all" style={{background: step > s ? stepColors.done : stepColors.pending}}/>}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            <span>Type</span><span>Details</span><span>Status</span><span>Location</span><span>Review</span>
          </div>
        </div>

        {/* Step 0: Type */}
        {step === 0 && (
          <section className="slide-up-enter">
            <h1 className="text-xl font-extrabold text-gray-900">{t.report.title}</h1>
            <p className="mt-1 text-sm text-gray-500">{t.report.subtitle}</p>
            <div className="mt-6 space-y-4">
              <button onClick={()=>setReportType("health")} className={cn("w-full flex items-center gap-4 rounded-2xl p-5 text-left transition-all",
                reportType==="health" ? "glass-card border-[hsl(160,84%,39%,0.4)] glow-accent" : "glass-card glass-card-hover")}>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(160,84%,50%,0.12)]" style={{boxShadow:"0 0 15px hsl(160,84%,50%,0.1)"}}>
                  <Activity className="h-6 w-6 text-[hsl(160,84%,32%)]"/>
                </div>
                <div><h3 className="font-bold text-lg text-gray-900">{t.report.healthSymptoms}</h3><p className="text-sm text-gray-500">{t.report.healthDesc}</p></div>
              </button>
              <button onClick={()=>setReportType("water")} className={cn("w-full flex items-center gap-4 rounded-2xl p-5 text-left transition-all",
                reportType==="water" ? "glass-card border-[hsl(210,90%,60%,0.4)] glow-info" : "glass-card glass-card-hover")}>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(210,90%,60%,0.12)]" style={{boxShadow:"0 0 15px hsl(210,90%,60%,0.1)"}}>
                  <Droplets className="h-6 w-6 text-[hsl(210,80%,42%)]"/>
                </div>
                <div><h3 className="font-bold text-lg text-gray-900">{t.report.waterIssue}</h3><p className="text-sm text-gray-500">{t.report.waterDesc}</p></div>
              </button>
            </div>
          </section>
        )}

        {/* Step 1 Health */}
        {step === 1 && reportType === "health" && (
          <section className="slide-up-enter">
            <h1 className="text-xl font-extrabold text-gray-900">{t.report.symptomsTitle}</h1>
            <p className="mt-1 text-sm text-gray-500">{t.report.selectAll}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {symptoms.map(symptom=>(
                <button key={symptom.id} onClick={()=>toggleSymptom(symptom.id)} className={cn("flex flex-col items-center gap-2 rounded-2xl p-4 transition-all",
                  selectedSymptoms.includes(symptom.id) ? "glass-card border-[hsl(160,84%,39%,0.4)] glow-accent" : "glass-card glass-card-hover")}>
                  <span className="text-2xl">{symptom.icon}</span>
                  <span className="text-sm font-semibold text-gray-800">{symptom.label}</span>
                  {selectedSymptoms.includes(symptom.id) && <CheckCircle className="h-4 w-4 text-[hsl(160,84%,32%)]"/>}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Step 1 Water */}
        {step === 1 && reportType === "water" && (
          <section className="slide-up-enter">
            <h1 className="text-xl font-extrabold text-gray-900">{t.report.waterSourceTitle}</h1>
            <p className="mt-1 text-sm text-gray-500">{t.report.waterSourceSub}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[{id:"well",label:"Well / Borewell",icon:Waves},{id:"tap",label:"Public Tap",icon:Droplets},{id:"river",label:"River / Stream",icon:Waves},{id:"pond",label:"Pond / Lake",icon:Droplets},{id:"other",label:"Other Source",icon:Search}].map(source=>{
                const Icon=source.icon;return(
                <button key={source.id} onClick={()=>setWaterSource(source.id as WaterSource)} className={cn("flex flex-col items-center gap-2 rounded-2xl p-4 transition-all",
                  waterSource===source.id ? "glass-card border-[hsl(210,90%,60%,0.4)] glow-info" : "glass-card glass-card-hover")}>
                  <Icon className={cn("h-8 w-8",waterSource===source.id?"text-[hsl(210,80%,42%)]":"text-gray-400")}/>
                  <span className="text-sm font-semibold text-gray-800">{source.label}</span>
                  {waterSource===source.id && <CheckCircle className="h-4 w-4 text-[hsl(210,80%,42%)]"/>}
                </button>)})}
            </div>
          </section>
        )}

        {/* Step 2 Health: Severity */}
        {step === 2 && reportType === "health" && (
          <section className="slide-up-enter">
            <h1 className="text-xl font-extrabold text-gray-900">{t.report.severityTitle}</h1>
            <p className="mt-1 text-sm text-gray-500">{t.report.severitySub}</p>
            <div className="mt-6 space-y-3">
              {([{value:"mild" as Severity,label:"Mild",desc:"Symptoms are manageable",color:"160,84%,50%"},{value:"moderate" as Severity,label:"Moderate",desc:"Symptoms are uncomfortable",color:"38,92%,58%"},{value:"severe" as Severity,label:"Severe",desc:"Need immediate attention",color:"0,85%,62%"}]).map(opt=>(
                <button key={opt.value} onClick={()=>setSeverity(opt.value)} className={cn("w-full rounded-2xl p-4 text-left transition-all",
                  severity===opt.value ? `glass-card border-[hsl(${opt.color},0.4)]` : "glass-card glass-card-hover")}
                  style={severity===opt.value?{boxShadow:`0 0 20px hsl(${opt.color},0.1)`}:{}}>
                  <div className="flex items-center justify-between">
                    <div><p className="font-bold text-gray-800">{opt.label}</p><p className="mt-1 text-sm text-gray-500">{opt.desc}</p></div>
                    {severity===opt.value && <CheckCircle className="h-6 w-6" style={{color:`hsl(${opt.color})`}}/>}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Step 2 Water: Safety */}
        {step === 2 && reportType === "water" && (
          <section className="slide-up-enter">
            <h1 className="text-xl font-extrabold text-gray-900">{t.report.isWaterSafe}</h1>
            <p className="mt-1 text-sm text-gray-500">Based on your observation</p>
            <div className="mt-6 space-y-4">
              <button onClick={()=>setIsWaterSafe(true)} className={cn("w-full flex items-center gap-4 rounded-2xl p-5 text-left transition-all",
                isWaterSafe===true ? "glass-card border-[hsl(160,84%,50%,0.4)] glow-accent" : "glass-card glass-card-hover")}>
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl",isWaterSafe===true?"bg-[hsl(160,84%,50%)] text-white":"bg-[hsl(160,84%,50%,0.12)] text-[hsl(160,84%,32%)]")}>
                  <CheckCircle className="h-6 w-6"/>
                </div>
                <div><h3 className="font-bold text-gray-900">Safe to Drink</h3><p className="text-sm text-gray-500">Clear, no smell, used without issues.</p></div>
              </button>
              <button onClick={()=>setIsWaterSafe(false)} className={cn("w-full flex items-center gap-4 rounded-2xl p-5 text-left transition-all",
                isWaterSafe===false ? "glass-card border-[hsl(0,85%,62%,0.4)] glow-danger" : "glass-card glass-card-hover")}>
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl",isWaterSafe===false?"bg-[hsl(0,85%,62%)] text-white":"bg-[hsl(0,85%,62%,0.12)] text-[hsl(0,75%,45%)]")}>
                  <AlertCircle className="h-6 w-6"/>
                </div>
                <div><h3 className="font-bold text-[hsl(0,75%,42%)]">Contaminated / Unsafe</h3><p className="text-sm text-gray-500">Cloudy, bad smell, or causing sickness.</p></div>
              </button>
            </div>
          </section>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <section className="slide-up-enter">
            <h1 className="text-xl font-extrabold text-gray-900">{t.report.locationTitle}</h1>
            <p className="mt-1 text-sm text-gray-500">{t.report.locationSub}</p>
            <div className="mt-6 space-y-2">
              {villages.map(village=>(
                <button key={village.id} onClick={()=>setSelectedVillage(village.id)} className={cn("flex w-full items-center justify-between rounded-xl p-3.5 transition-all",
                  selectedVillage===village.id ? "glass-card border-[hsl(160,84%,39%,0.4)] glow-accent" : "glass-card glass-card-hover")}>
                  <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-gray-400"/><div className="text-left"><p className="font-semibold text-gray-800">{village.name}</p><p className="text-xs text-gray-400">{village.district}</p></div></div>
                  {selectedVillage===village.id && <CheckCircle className="h-5 w-5 text-[hsl(160,84%,32%)]"/>}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <section className="slide-up-enter">
            <h1 className="text-xl font-extrabold text-gray-900">{t.report.reviewTitle}</h1>
            <p className="mt-1 text-sm text-gray-500">{t.report.reviewSub}</p>
            <div className="mt-6 space-y-4">
              <div className="glass-card rounded-2xl p-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Report Type</p>
                <p className="mt-1 font-bold capitalize text-lg text-[hsl(160,84%,32%)]">{reportType==="health"?"Health Condition":"Water Quality Issue"}</p>
              </div>
              {reportType==="health"?(<>
                <div className="glass-card rounded-2xl p-4"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Symptoms</p><div className="mt-2 flex flex-wrap gap-2">{selectedSymptoms.map(id=>{const s=symptoms.find(s=>s.id===id);return s?<span key={id} className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm bg-[hsl(160,84%,50%,0.12)] text-[hsl(160,84%,32%)] font-medium">{s.icon} {s.label}</span>:null})}</div></div>
                <div className="glass-card rounded-2xl p-4"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Severity</p><p className="mt-1 font-semibold capitalize text-gray-800">{severity}</p></div>
              </>):(<>
                <div className="glass-card rounded-2xl p-4"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Water Source</p><p className="mt-1 font-semibold capitalize text-gray-800">{waterSource}</p></div>
                <div className="glass-card rounded-2xl p-4"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Safety</p><p className={cn("mt-1 font-bold",isWaterSafe?"text-[hsl(160,84%,32%)]":"text-[hsl(0,75%,45%)]")}>{isWaterSafe?"Safe to use":"Contaminated / Unsafe"}</p></div>
              </>)}
              <div className="glass-card rounded-2xl p-4"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</p><p className="mt-1 font-semibold text-gray-800">{villages.find(v=>v.id===selectedVillage)?.name}</p><p className="text-sm text-gray-500">{villages.find(v=>v.id===selectedVillage)?.district}</p></div>
              <div className="glass-card rounded-2xl p-4"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Additional Notes</p><Textarea value={additionalNotes} onChange={e=>setAdditionalNotes(e.target.value)} placeholder="Any other details..." className="mt-2 min-h-[80px] resize-none glass-input rounded-xl text-gray-800 placeholder:text-gray-300 border-0 focus-visible:ring-0"/></div>
            </div>
          </section>
        )}

        {/* Nav Buttons */}
        <div className="mt-8 flex gap-3">
          {step > 0 && <Button variant="outline" onClick={()=>setStep(s=>s-1)} className="flex-1 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-100"><ChevronLeft className="mr-1 h-4 w-4"/>{t.report.back||"Back"}</Button>}
          {step < 4 ? (
            <div className="flex-1 space-y-2">
              <Button onClick={()=>setStep(s=>s+1)} disabled={!canProceed()} className="w-full rounded-xl glass-button text-white font-bold disabled:opacity-30">{t.report.continue||"Continue"}<ChevronRight className="ml-1 h-4 w-4"/></Button>
              {!canProceed() && <p className="text-xs text-[hsl(38,80%,38%)]">Please complete this step.</p>}
            </div>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 rounded-xl glass-button text-white font-bold disabled:opacity-40">
              {isSubmitting ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>{t.report.submitting||"Submitting..."}</span>
              : <><Send className="mr-2 h-4 w-4"/>{t.report.submitParams||"Submit Report"}</>}
            </Button>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
