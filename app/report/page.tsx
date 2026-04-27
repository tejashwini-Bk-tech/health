"use client"

import { useState } from "react"
import { Navbar } from "@/components/Navbar"
import { BottomNav } from "@/components/BottomNav"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { symptoms, villages } from "@/lib/data"
import { cn } from "@/lib/utils"
import { CheckCircle, ChevronLeft, ChevronRight, Send, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { submitHealthReport, submitWaterReport } from "@/lib/db"
import { toast } from "sonner"
import { Droplets, Activity, Waves, Search, AlertCircle } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

type ReportType = "health" | "water"
type Severity = "mild" | "moderate" | "severe"
type WaterSource = "well" | "tap" | "river" | "pond" | "other"

const severityMap: Record<Severity, number> = {
  mild: 1,
  moderate: 3,
  severe: 5
}

export default function ReportPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [reportType, setReportType] = useState<ReportType | null>(null)
  const [step, setStep] = useState(0) // Start at step 0 for type selection
  
  // Health Report State
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [severity, setSeverity] = useState<Severity | null>(null)
  
  // Water Report State
  const [waterSource, setWaterSource] = useState<WaterSource | null>(null)
  const [isWaterSafe, setIsWaterSafe] = useState<boolean | null>(null)
  
  // Common State
  const [selectedVillage, setSelectedVillage] = useState<string | null>(null)
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const canProceed = () => {
    if (step === 0) return reportType !== null
    if (reportType === "health") {
      if (step === 1) return selectedSymptoms.length > 0
      if (step === 2) return severity !== null
    } else {
      if (step === 1) return waterSource !== null
      if (step === 2) return isWaterSafe !== null
    }
    if (step === 3) return selectedVillage !== null
    return true
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const village = villages.find(v => v.id === selectedVillage)
    
    let result;
    if (reportType === "health") {
      if (!severity) return
      result = await submitHealthReport({
        symptoms: selectedSymptoms,
        severity: severityMap[severity],
        location: village?.name,
        notes: additionalNotes
      })
    } else {
      if (!waterSource || isWaterSafe === null) return
      result = await submitWaterReport({
        location: village?.name || "Unknown",
        source_type: waterSource,
        safe_to_drink: isWaterSafe,
      })
    }
    
    setIsSubmitting(false)
    
    if (result.success) {
      setIsSubmitted(true)
      toast.success("Report submitted successfully!")
    } else {
      toast.error(result.error || "Failed to submit report")
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-background">
        <Navbar userName="Rahul" role="user" />
        <main className="mx-auto flex min-h-[80vh] max-w-lg flex-col items-center justify-center px-4 py-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-foreground">Report Submitted!</h1>
          <p className="mt-2 text-center text-muted-foreground">
            Thank you for helping keep your community safe. A health officer will review your report.
          </p>
          <div className="mt-8 flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsSubmitted(false)
                setStep(1)
                setSelectedSymptoms([])
                setSeverity(null)
                setSelectedVillage(null)
                setAdditionalNotes("")
              }}
            >
              Submit Another
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => router.push("/dashboard")}
            >
              Go to Dashboard
            </Button>
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-background pb-20">
      <Navbar userName="Rahul" role="user" />

      <main className="mx-auto max-w-lg px-4 py-4">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {[0, 1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                    step >= s
                      ? "bg-emerald-600 text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {s === 0 ? <Search className="h-4 w-4" /> : s}
                </div>
                {s < 4 && (
                  <div
                    className={cn(
                      "h-1 w-8 sm:w-12",
                      step > s ? "bg-emerald-600" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] sm:text-xs text-muted-foreground">
            <span>Type</span>
            <span>Details</span>
            <span>Status</span>
            <span>Location</span>
            <span>Review</span>
          </div>
        </div>

        {/* Step 0: Report Type */}
        {step === 0 && (
          <section className="animate-in fade-in slide-in-from-right-4">
            <h1 className="text-xl font-bold text-foreground">{t.report.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t.report.subtitle}</p>

            <div className="mt-6 space-y-4">
              <button
                onClick={() => setReportType("health")}
                className={cn(
                  "w-full flex items-center gap-4 rounded-2xl border-2 p-6 text-left transition-all",
                  reportType === "health"
                    ? "border-emerald-500 bg-emerald-50 shadow-md"
                    : "border-border bg-card hover:border-emerald-200"
                )}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{t.report.healthSymptoms}</h3>
                  <p className="text-sm text-muted-foreground">{t.report.healthDesc}</p>
                </div>
              </button>

              <button
                onClick={() => setReportType("water")}
                className={cn(
                  "w-full flex items-center gap-4 rounded-2xl border-2 p-6 text-left transition-all",
                  reportType === "water"
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-border bg-card hover:border-blue-200"
                )}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Droplets className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{t.report.waterIssue}</h3>
                  <p className="text-sm text-muted-foreground">{t.report.waterDesc}</p>
                </div>
              </button>
            </div>
          </section>
        )}

        {/* Step 1 Health: Select Symptoms */}
        {step === 1 && reportType === "health" && (
          <section className="animate-in fade-in slide-in-from-right-4">
            <h1 className="text-xl font-bold text-foreground">{t.report.symptomsTitle}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t.report.selectAll}</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {symptoms.map((symptom) => (
                <button
                  key={symptom.id}
                  onClick={() => toggleSymptom(symptom.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all",
                    selectedSymptoms.includes(symptom.id)
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-border bg-card hover:border-emerald-200"
                  )}
                >
                  <span className="text-2xl">{symptom.icon}</span>
                  <span className="text-sm font-medium">{symptom.label}</span>
                  {selectedSymptoms.includes(symptom.id) && (
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Step 1 Water: Source Type */}
        {step === 1 && reportType === "water" && (
          <section className="animate-in fade-in slide-in-from-right-4">
            <h1 className="text-xl font-bold text-foreground">{t.report.waterSourceTitle}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t.report.waterSourceSub}</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { id: "well", label: "Well / Borewell", icon: Waves },
                { id: "tap", label: "Public Tap", icon: Droplets },
                { id: "river", label: "River / Stream", icon: Waves },
                { id: "pond", label: "Pond / Lake", icon: Droplets },
                { id: "other", label: "Other Source", icon: Search },
              ].map((source) => {
                const Icon = source.icon
                return (
                  <button
                    key={source.id}
                    onClick={() => setWaterSource(source.id as WaterSource)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all",
                      waterSource === source.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-border bg-card hover:border-blue-200"
                    )}
                  >
                    <Icon className={cn("h-8 w-8", waterSource === source.id ? "text-blue-600" : "text-muted-foreground")} />
                    <span className="text-sm font-medium">{source.label}</span>
                    {waterSource === source.id && (
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    )}
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* Step 2 Health: Severity */}
        {step === 2 && reportType === "health" && (
          <section className="animate-in fade-in slide-in-from-right-4">
            <h1 className="text-xl font-bold text-foreground">{t.report.severityTitle}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t.report.severitySub}</p>

            <div className="mt-6 space-y-3">
              {[
                {
                  value: "mild" as Severity,
                  label: "Mild",
                  description: "Symptoms are manageable, can continue daily activities",
                  color: "emerald",
                },
                {
                  value: "moderate" as Severity,
                  label: "Moderate",
                  description: "Symptoms are uncomfortable, some difficulty with activities",
                  color: "amber",
                },
                {
                  value: "severe" as Severity,
                  label: "Severe",
                  description: "Symptoms are very uncomfortable, need immediate attention",
                  color: "red",
                },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSeverity(option.value)}
                  className={cn(
                    "w-full rounded-2xl border-2 p-4 text-left transition-all",
                    severity === option.value
                      ? option.color === "emerald"
                        ? "border-emerald-500 bg-emerald-50"
                        : option.color === "amber"
                        ? "border-amber-500 bg-amber-50"
                        : "border-red-500 bg-red-50"
                      : "border-border bg-card hover:border-muted-foreground/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{option.label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                    {severity === option.value && (
                      <CheckCircle
                        className={cn(
                          "h-6 w-6",
                          option.color === "emerald"
                            ? "text-emerald-600"
                            : option.color === "amber"
                            ? "text-amber-600"
                            : "text-red-600"
                        )}
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Step 2 Water: Safety Status */}
        {step === 2 && reportType === "water" && (
          <section className="animate-in fade-in slide-in-from-right-4">
            <h1 className="text-xl font-bold text-foreground">{t.report.isWaterSafe}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Based on your observation</p>

            <div className="mt-6 space-y-4">
              <button
                onClick={() => setIsWaterSafe(true)}
                className={cn(
                  "w-full flex items-center gap-4 rounded-2xl border-2 p-6 text-left transition-all",
                  isWaterSafe === true
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-border bg-card hover:border-emerald-200"
                )}
              >
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", isWaterSafe === true ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-600")}>
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold">Safe to Drink</h3>
                  <p className="text-sm text-muted-foreground">Clear, no smell, used by community without issues.</p>
                </div>
              </button>

              <button
                onClick={() => setIsWaterSafe(false)}
                className={cn(
                  "w-full flex items-center gap-4 rounded-2xl border-2 p-6 text-left transition-all",
                  isWaterSafe === false
                    ? "border-red-500 bg-red-50"
                    : "border-border bg-card hover:border-red-200"
                )}
              >
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", isWaterSafe === false ? "bg-red-500 text-white" : "bg-red-100 text-red-600")}>
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-red-700">Contaminated / Unsafe</h3>
                  <p className="text-sm text-muted-foreground">Cloudy, bad smell, or people are getting sick from it.</p>
                </div>
              </button>
            </div>
          </section>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <section className="animate-in fade-in slide-in-from-right-4">
            <h1 className="text-xl font-bold text-foreground">{t.report.locationTitle}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t.report.locationSub}</p>

            <div className="mt-6 space-y-2">
              {villages.map((village) => (
                <button
                  key={village.id}
                  onClick={() => setSelectedVillage(village.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border-2 p-3 transition-all",
                    selectedVillage === village.id
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-border bg-card hover:border-emerald-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div className="text-left">
                      <p className="font-medium">{village.name}</p>
                      <p className="text-xs text-muted-foreground">{village.district}</p>
                    </div>
                  </div>
                  {selectedVillage === village.id && (
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <section className="animate-in fade-in slide-in-from-right-4">
            <h1 className="text-xl font-bold text-foreground">{t.report.reviewTitle}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t.report.reviewSub}</p>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs font-medium text-muted-foreground">REPORT TYPE</p>
                <p className="mt-1 font-bold capitalize text-lg text-emerald-700">
                  {reportType === "health" ? "Health Condition" : "Water Quality Issue"}
                </p>
              </div>

              {reportType === "health" ? (
                <>
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <p className="text-xs font-medium text-muted-foreground">SYMPTOMS</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedSymptoms.map((id) => {
                        const symptom = symptoms.find((s) => s.id === id)
                        return symptom ? (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700"
                          >
                            {symptom.icon} {symptom.label}
                          </span>
                        ) : null
                      })}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <p className="text-xs font-medium text-muted-foreground">SEVERITY</p>
                    <p className="mt-1 font-medium capitalize">{severity}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <p className="text-xs font-medium text-muted-foreground">WATER SOURCE</p>
                    <p className="mt-1 font-medium capitalize">{waterSource}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <p className="text-xs font-medium text-muted-foreground">SAFETY STATUS</p>
                    <p className={cn("mt-1 font-bold", isWaterSafe ? "text-emerald-600" : "text-red-600")}>
                      {isWaterSafe ? "Safe to use" : "Contaminated / Unsafe"}
                    </p>
                  </div>
                </>
              )}

              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs font-medium text-muted-foreground">LOCATION</p>
                <p className="mt-1 font-medium">
                  {villages.find((v) => v.id === selectedVillage)?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {villages.find((v) => v.id === selectedVillage)?.district}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs font-medium text-muted-foreground">ADDITIONAL NOTES (OPTIONAL)</p>
                <Textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Any other details you&apos;d like to share..."
                  className="mt-2 min-h-[80px] resize-none"
                />
              </div>
            </div>
          </section>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              className="flex-1"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              {t.report.back || "Back"}
            </Button>
          )}
          {step < 4 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {t.report.continue || "Continue"}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t.report.submitting || "Submitting..."}
                </span>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {t.report.submitParams || "Submit Report"}
                </>
              )}
            </Button>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
