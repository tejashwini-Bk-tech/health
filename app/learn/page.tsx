"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/Navbar"
import { BottomNav } from "@/components/BottomNav"
import { Button } from "@/components/ui/button"
import { healthTips as defaultTips, type HealthTip } from "@/lib/data"
import { cn } from "@/lib/utils"
import { BookOpen, Droplets, Heart, Shield, Stethoscope, ChevronRight, X } from "lucide-react"
import { fetchLearnContent, type DbLearnContent } from "@/lib/db"
import { supabase } from "@/lib/supabase"
import { useLanguage } from "@/hooks/use-language"

export default function LearnPage() {
  const { t } = useLanguage()

  // Dynamically translate categories
  const categories = [
    { id: "all", label: t.learn.allTips, icon: BookOpen },
    { id: "water_safety", label: t.learn.waterSafety, icon: Droplets },
    { id: "hygiene", label: t.learn.hygiene, icon: Shield },
    { id: "prevention", label: t.learn.prevention, icon: Heart },
    { id: "treatment", label: t.learn.treatment, icon: Stethoscope },
  ]

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  water_safety: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  hygiene: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  prevention: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  treatment: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
}

const categoryIcons: Record<string, typeof Droplets> = {
  water_safety: Droplets,
  hygiene: Shield,
  prevention: Heart,
  treatment: Stethoscope,
}

// Map DB category to UI category
const categoryMap: Record<string, string> = {
  disease_prevention: "prevention",
  hygiene: "hygiene",
  nutrition: "water_safety",
  emergency: "treatment"
}

  const [activeCategory, setActiveCategory] = useState("all")
  const [selectedTip, setSelectedTip] = useState<HealthTip | null>(null)
  const [healthTips, setHealthTips] = useState<HealthTip[]>(defaultTips)

  // Fetch content from database
  useEffect(() => {
    const loadContent = async () => {
      const data = await fetchLearnContent()
      if (data.length > 0) {
        const transformed: HealthTip[] = data.map((item: DbLearnContent) => ({
          id: item.id,
          title: item.title,
          description: item.content,
          category: (categoryMap[item.category] || "prevention") as any,
        }))
        setHealthTips(transformed)
      }
    }
    
    loadContent()

    // Real-time subscription
    const channel = supabase
      .channel('learn-content-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'learn_content' }, () => {
        console.log('Real-time: Learn content updated')
        loadContent()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const filteredTips = activeCategory === "all"
    ? healthTips
    : healthTips.filter(t => t.category === activeCategory)

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-background pb-20">
      <Navbar userName="Rahul" role="user" />

      <main className="mx-auto max-w-lg px-4 py-4">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-foreground">{t.learn.title}</h1>
          <p className="text-sm text-muted-foreground">{t.learn.subtitle}</p>
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "shrink-0 rounded-full",
                  activeCategory === cat.id && "bg-emerald-600 hover:bg-emerald-700"
                )}
              >
                <Icon className="mr-1 h-3 w-3" />
                {cat.label}
              </Button>
            )
          })}
        </div>

        {/* Featured Tip */}
        <section className="mb-6">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
                <Droplets className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-medium text-emerald-100">{t.learn.tipOfTheDay}</span>
                <h3 className="mt-1 text-lg font-semibold">{t.learn.boilWaterTitle}</h3>
                <p className="mt-2 text-sm text-emerald-100">
                  {t.learn.boilWaterDesc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Facts */}
        <section className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">{t.learn.quickFacts}</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-3xl font-bold text-emerald-600">80%</p>
              <p className="mt-1 text-sm text-muted-foreground">of diseases in rural areas are waterborne</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-3xl font-bold text-blue-600">20 sec</p>
              <p className="mt-1 text-sm text-muted-foreground">minimum handwashing time needed</p>
            </div>
          </div>
        </section>

        {/* Health Tips Grid */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">{t.learn.healthTips}</h2>
          <div className="space-y-3">
            {filteredTips.map((tip) => {
              const colors = categoryColors[tip.category]
              const Icon = categoryIcons[tip.category]
              return (
                <button
                  key={tip.id}
                  onClick={() => setSelectedTip(tip)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all hover:shadow-md active:scale-[0.98]",
                    colors.bg,
                    colors.border
                  )}
                >
                  <div className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                    tip.category === "water_safety" ? "bg-blue-500" :
                    tip.category === "hygiene" ? "bg-purple-500" :
                    tip.category === "prevention" ? "bg-emerald-500" : "bg-amber-500"
                  )}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className={cn("font-semibold", colors.text)}>{tip.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {tip.description}
                    </p>
                  </div>
                  <ChevronRight className={cn("h-5 w-5 shrink-0", colors.text)} />
                </button>
              )
            })}
          </div>
        </section>

        {/* Emergency Contact */}
        <section className="mt-6">
          <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-4">
            <h3 className="font-semibold text-red-700">{t.learn.emergencyContact}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t.learn.emergencyDesc}
            </p>
            <Button className="mt-3 w-full bg-red-600 hover:bg-red-700">
              {t.learn.callCenter}
            </Button>
          </div>
        </section>
      </main>

      {/* Tip Detail Modal */}
      {selectedTip && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-8 rounded-t-3xl bg-background p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl",
                  selectedTip.category === "water_safety" ? "bg-blue-500" :
                  selectedTip.category === "hygiene" ? "bg-purple-500" :
                  selectedTip.category === "prevention" ? "bg-emerald-500" : "bg-amber-500"
                )}>
                  {(() => {
                    const Icon = categoryIcons[selectedTip.category]
                    return <Icon className="h-6 w-6 text-white" />
                  })()}
                </div>
                <div>
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                    categoryColors[selectedTip.category].bg,
                    categoryColors[selectedTip.category].text
                  )}>
                    {(t.learn as any)[
                      selectedTip.category === "water_safety" ? "waterSafety" : selectedTip.category
                    ]}
                  </span>
                  <h2 className="mt-1 text-lg font-bold">{selectedTip.title}</h2>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedTip(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <p className="text-muted-foreground">{selectedTip.description}</p>

            <div className="mt-6 rounded-xl bg-muted p-4">
              <h4 className="font-medium">{t.learn.remember}</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                {t.learn.rememberDesc}
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedTip(null)}
              >
                {t.learn.close}
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {t.learn.shareTip}
              </Button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
