import { supabase } from "./supabase"
import type { RiskLevel } from "./data"

// Types matching database schema
export interface DbAlert {
  id: string
  title: string
  description: string
  severity: RiskLevel
  status: "active" | "resolved"
  created_at: string
  affected_areas?: string[]
  type?: "outbreak" | "warning" | "info" | "prevention"
}

export interface DbHealthReport {
  id: string
  symptoms: string[]
  severity: number
  notes?: string
  location?: string
  status: "pending" | "reviewed" | "resolved"
  created_at: string
  user_id: string
}

export interface DbLearnContent {
  id: string
  title: string
  content: string
  category: "disease_prevention" | "hygiene" | "nutrition" | "emergency"
  created_at: string
}

export interface DbWaterReport {
  id: string
  location: string
  source_type: "well" | "tap" | "river" | "pond" | "other"
  safe_to_drink?: boolean
  contamination_detected?: boolean
  created_at: string
}

// Fetch active alerts
export async function fetchAlerts(): Promise<DbAlert[]> {
  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching alerts:", error)
    return []
  }

  return data || []
}

// Fetch health reports for stats
export async function fetchHealthReports(): Promise<DbHealthReport[]> {
  const { data, error } = await supabase
    .from("health_reports")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching health reports:", error)
    return []
  }

  return data || []
}

// Fetch today's report count
export async function fetchTodaysReportsCount(): Promise<number> {
  const today = new Date().toISOString().split("T")[0]
  const { count, error } = await supabase
    .from("health_reports")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today)

  if (error) {
    console.error("Error fetching today's reports:", error)
    return 0
  }

  return count || 0
}

// Fetch educational content
export async function fetchLearnContent(): Promise<DbLearnContent[]> {
  const { data, error } = await supabase
    .from("learn_content")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching learn content:", error)
    return []
  }

  return data || []
}

// Fetch water reports
export async function fetchWaterReports(): Promise<DbWaterReport[]> {
  const { data, error } = await supabase
    .from("water_reports")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching water reports:", error)
    return []
  }

  return data || []
}

// Submit health report
export async function submitHealthReport(report: {
  symptoms: string[]
  severity: number
  location?: string
  notes?: string
}): Promise<{ success: boolean; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const { error } = await supabase.from("health_reports").insert({
    user_id: user.id,
    symptoms: report.symptoms,
    severity: report.severity,
    location: report.location,
    notes: report.notes,
    status: "pending",
  })

  if (error) {
    console.error("Error submitting report:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Submit water report
export async function submitWaterReport(report: {
  location: string
  source_type: "well" | "tap" | "river" | "pond" | "other"
  safe_to_drink: boolean
  contamination_detected?: boolean
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase.from("water_reports").insert({
      location: report.location,
      source_type: report.source_type,
      safe_to_drink: report.safe_to_drink,
      contamination_detected: report.contamination_detected || !report.safe_to_drink,
      reported_by: user?.id,
    })

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error("Error submitting water report:", error)
    return { success: false, error: error.message }
  }
}

// Calculate disease stats from reports
export function calculateDiseaseStats(reports: DbHealthReport[]) {
  const diseaseMap = new Map<string, { cases: number; previousCases: number }>()
  
  // Count symptoms from reports (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

  reports.forEach((report) => {
    const reportDate = new Date(report.created_at)
    
    report.symptoms?.forEach((symptom) => {
      if (!diseaseMap.has(symptom)) {
        diseaseMap.set(symptom, { cases: 0, previousCases: 0 })
      }
      
      const data = diseaseMap.get(symptom)!
      if (reportDate >= sevenDaysAgo) {
        data.cases++
      } else if (reportDate >= fourteenDaysAgo) {
        data.previousCases++
      }
    })
  })

  // Convert to array format matching existing UI
  const stats = Array.from(diseaseMap.entries()).map(([name, data]) => {
    const change = data.previousCases > 0
      ? ((data.cases - data.previousCases) / data.previousCases) * 100
      : data.cases > 0 ? 100 : 0

    let trend: "increasing" | "decreasing" | "stable" = "stable"
    if (change > 5) trend = "increasing"
    else if (change < -5) trend = "decreasing"

    return {
      name: name.charAt(0).toUpperCase() + name.slice(1).replace("_", " "),
      cases: data.cases,
      trend,
      percentChange: Math.round(change),
    }
  })

  return stats.slice(0, 4) // Return top 4
}

// Get overall risk level from reports
export function calculateOverallRisk(reports: DbHealthReport[]): RiskLevel {
  const activeReports = reports.filter((r) => r.status !== "resolved")
  const totalCases = activeReports.length
  
  // Calculate weighted severity
  const totalSeverity = activeReports.reduce((sum, r) => sum + (r.severity || 1), 0)
  const avgSeverity = activeReports.length > 0 ? totalSeverity / activeReports.length : 0

  if (totalCases > 50 || avgSeverity >= 4) return "critical"
  if (totalCases > 20 || avgSeverity >= 3) return "high"
  if (totalCases > 5 || avgSeverity >= 2) return "moderate"
  return "low"
}

// Count high severity cases
export function countHighRiskCases(reports: DbHealthReport[]): number {
  return reports.filter((r) => r.severity >= 4 && r.status !== "resolved").length
}

// Calculate water safety stats
export function calculateWaterStats(waterReports: DbWaterReport[]) {
  const total = waterReports.length
  const safe = waterReports.filter((w) => w.safe_to_drink === true).length
  return { safe, total }
}
