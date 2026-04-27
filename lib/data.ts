// Types
export type RiskLevel = "low" | "moderate" | "high" | "critical"
export type UserRole = "user" | "health_officer" | "local_leader"

export interface Village {
  id: string
  name: string
  district: string
  population: number
  riskLevel: RiskLevel
  activeCases: number
  coordinates: { lat: number; lng: number }
}

export interface SymptomReport {
  id: string
  userId: string
  villageId: string
  symptoms: string[]
  severity: "mild" | "moderate" | "severe"
  timestamp: Date
  status: "pending" | "reviewed" | "escalated"
}

export interface Alert {
  id: string
  title: string
  description: string
  type: "outbreak" | "warning" | "info" | "prevention"
  severity: RiskLevel
  villageIds: string[]
  createdAt: Date
  expiresAt: Date
  isActive: boolean
}

export interface HealthTip {
  id: string
  title: string
  description: string
  category: "prevention" | "treatment" | "hygiene" | "water_safety"
  imageUrl?: string
}

export interface DiseaseStats {
  name: string
  cases: number
  trend: "increasing" | "decreasing" | "stable"
  percentChange: number
}

// Dummy Data - Northeast India Locations
export const villages: Village[] = [
  // Meghalaya (Khasi)
  { id: "v1", name: "Shillong", district: "East Khasi Hills", population: 143229, riskLevel: "low", activeCases: 5, coordinates: { lat: 25.5788, lng: 91.8933 } },
  { id: "v2", name: "Cherrapunji (Sohra)", district: "East Khasi Hills", population: 14816, riskLevel: "moderate", activeCases: 15, coordinates: { lat: 25.2700, lng: 91.7200 } },
  { id: "v3", name: "Mawlynnong", district: "East Khasi Hills", population: 500, riskLevel: "low", activeCases: 0, coordinates: { lat: 25.2000, lng: 91.9167 } },
  { id: "v4", name: "Nongstoin", district: "West Khasi Hills", population: 28742, riskLevel: "moderate", activeCases: 8, coordinates: { lat: 25.5167, lng: 91.2667 } },
  
  // Assam (Assamese & Bodo)
  { id: "v5", name: "Guwahati", district: "Kamrup Metropolitan", population: 957352, riskLevel: "high", activeCases: 120, coordinates: { lat: 26.1445, lng: 91.7362 } },
  { id: "v6", name: "Majuli", district: "Majuli", population: 167304, riskLevel: "high", activeCases: 45, coordinates: { lat: 26.9500, lng: 94.1667 } },
  { id: "v7", name: "Jorhat", district: "Jorhat", population: 153889, riskLevel: "moderate", activeCases: 22, coordinates: { lat: 26.7509, lng: 94.2037 } },
  { id: "v8", name: "Kokrajhar", district: "Kokrajhar (BTR)", population: 34136, riskLevel: "moderate", activeCases: 10, coordinates: { lat: 26.4010, lng: 90.2669 } },
  { id: "v9", name: "Udalguri", district: "Udalguri (BTR)", population: 15279, riskLevel: "low", activeCases: 3, coordinates: { lat: 26.7461, lng: 92.0964 } },
  { id: "v10", name: "Baksa", district: "Baksa (BTR)", population: 950000, riskLevel: "critical", activeCases: 78, coordinates: { lat: 26.5492, lng: 91.5647 } },

  // Manipur (Meitei)
  { id: "v11", name: "Imphal", district: "Imphal West", population: 268243, riskLevel: "critical", activeCases: 95, coordinates: { lat: 24.8170, lng: 93.9368 } },
  { id: "v12", name: "Moirang", district: "Bishnupur", population: 19893, riskLevel: "moderate", activeCases: 12, coordinates: { lat: 24.5000, lng: 93.7667 } },
  { id: "v13", name: "Ukhrul", district: "Ukhrul", population: 74718, riskLevel: "low", activeCases: 2, coordinates: { lat: 25.1167, lng: 94.3667 } },
  { id: "v14", name: "Thoubal", district: "Thoubal", population: 45947, riskLevel: "high", activeCases: 35, coordinates: { lat: 24.6333, lng: 94.0167 } },

  // Arunachal Pradesh
  { id: "v15", name: "Tawang", district: "Tawang", population: 11202, riskLevel: "low", activeCases: 4, coordinates: { lat: 27.5861, lng: 91.8594 } },
  { id: "v16", name: "Ziro", district: "Lower Subansiri", population: 12806, riskLevel: "low", activeCases: 1, coordinates: { lat: 27.5833, lng: 93.8333 } },

  // Nagaland, Mizoram, Tripura
  { id: "v17", name: "Kohima", district: "Kohima", population: 99039, riskLevel: "moderate", activeCases: 18, coordinates: { lat: 25.6700, lng: 94.1100 } },
  { id: "v18", name: "Aizawl", district: "Aizawl", population: 293416, riskLevel: "low", activeCases: 7, coordinates: { lat: 23.7271, lng: 92.7176 } },
  { id: "v19", name: "Agartala", district: "West Tripura", population: 400004, riskLevel: "moderate", activeCases: 25, coordinates: { lat: 23.8315, lng: 91.2868 } }
]

export const recentReports: SymptomReport[] = [
  {
    id: "r1",
    userId: "u1",
    villageId: "v3",
    symptoms: ["diarrhea", "fever", "vomiting"],
    severity: "severe",
    timestamp: new Date("2024-01-15T08:30:00"),
    status: "escalated"
  },
  {
    id: "r2",
    userId: "u2",
    villageId: "v5",
    symptoms: ["stomach_pain", "nausea"],
    severity: "moderate",
    timestamp: new Date("2024-01-15T10:15:00"),
    status: "reviewed"
  },
  {
    id: "r3",
    userId: "u3",
    villageId: "v2",
    symptoms: ["diarrhea", "dehydration"],
    severity: "mild",
    timestamp: new Date("2024-01-15T12:00:00"),
    status: "pending"
  },
  {
    id: "r4",
    userId: "u4",
    villageId: "v5",
    symptoms: ["fever", "vomiting", "weakness"],
    severity: "severe",
    timestamp: new Date("2024-01-15T14:30:00"),
    status: "escalated"
  },
]

export const alerts: Alert[] = [
  {
    id: "a1",
    title: "Cholera Outbreak Warning",
    description: "Multiple cases of cholera reported in Tawang district. Boil water before drinking and maintain strict hygiene.",
    type: "outbreak",
    severity: "critical",
    villageIds: ["v5"],
    createdAt: new Date("2024-01-14T00:00:00"),
    expiresAt: new Date("2024-01-21T00:00:00"),
    isActive: true
  },
  {
    id: "a2",
    title: "Flood Water Contamination",
    description: "Recent flooding may have contaminated water sources in Majuli. Avoid using river water.",
    type: "warning",
    severity: "high",
    villageIds: ["v3"],
    createdAt: new Date("2024-01-13T00:00:00"),
    expiresAt: new Date("2024-01-20T00:00:00"),
    isActive: true
  },
  {
    id: "a3",
    title: "Typhoid Cases Rising",
    description: "Increase in typhoid cases observed in Cherrapunji. Get vaccinated if not already.",
    type: "warning",
    severity: "moderate",
    villageIds: ["v2"],
    createdAt: new Date("2024-01-12T00:00:00"),
    expiresAt: new Date("2024-01-19T00:00:00"),
    isActive: true
  },
  {
    id: "a4",
    title: "Clean Water Drive",
    description: "Free water purification tablets available at the health center this weekend.",
    type: "info",
    severity: "low",
    villageIds: ["v1", "v2", "v4", "v6"],
    createdAt: new Date("2024-01-15T00:00:00"),
    expiresAt: new Date("2024-01-17T00:00:00"),
    isActive: true
  },
]

export const healthTips: HealthTip[] = [
  {
    id: "t1",
    title: "Boil Your Water",
    description: "Always boil drinking water for at least 1 minute to kill harmful bacteria and parasites.",
    category: "water_safety"
  },
  {
    id: "t2",
    title: "Wash Hands Properly",
    description: "Wash hands with soap for at least 20 seconds before eating and after using the toilet.",
    category: "hygiene"
  },
  {
    id: "t3",
    title: "Recognize Dehydration",
    description: "Signs include dry mouth, dizziness, and dark urine. Drink ORS solution immediately if you notice these.",
    category: "treatment"
  },
  {
    id: "t4",
    title: "Store Water Safely",
    description: "Keep drinking water in clean, covered containers. Never dip hands directly into storage.",
    category: "prevention"
  },
  {
    id: "t5",
    title: "Cook Food Thoroughly",
    description: "Ensure meat and vegetables are cooked properly. Avoid raw or undercooked food during outbreaks.",
    category: "prevention"
  },
  {
    id: "t6",
    title: "ORS Solution Recipe",
    description: "Mix 6 teaspoons sugar + 1/2 teaspoon salt in 1 liter clean water for homemade ORS.",
    category: "treatment"
  },
]

export const diseaseStats: DiseaseStats[] = [
  { name: "Cholera", cases: 78, trend: "increasing", percentChange: 23 },
  { name: "Typhoid", cases: 45, trend: "stable", percentChange: 2 },
  { name: "Dysentery", cases: 32, trend: "decreasing", percentChange: -15 },
  { name: "Hepatitis A", cases: 18, trend: "increasing", percentChange: 12 },
]

export const symptoms = [
  { id: "diarrhea", label: "Diarrhea", icon: "💧" },
  { id: "vomiting", label: "Vomiting", icon: "🤮" },
  { id: "fever", label: "Fever", icon: "🌡️" },
  { id: "stomach_pain", label: "Stomach Pain", icon: "😣" },
  { id: "nausea", label: "Nausea", icon: "😵" },
  { id: "dehydration", label: "Dehydration", icon: "💦" },
  { id: "weakness", label: "Weakness", icon: "😩" },
  { id: "headache", label: "Headache", icon: "🤕" },
]

// Helper functions
export function getRiskColor(risk: RiskLevel): string {
  const colors = {
    low: "bg-emerald-500",
    moderate: "bg-amber-500",
    high: "bg-orange-500",
    critical: "bg-red-500"
  }
  return colors[risk]
}

export function getRiskBgColor(risk: RiskLevel): string {
  const colors = {
    low: "bg-emerald-50",
    moderate: "bg-amber-50",
    high: "bg-orange-50",
    critical: "bg-red-50"
  }
  return colors[risk]
}

export function getRiskTextColor(risk: RiskLevel): string {
  const colors = {
    low: "text-emerald-700",
    moderate: "text-amber-700",
    high: "text-orange-700",
    critical: "text-red-700"
  }
  return colors[risk]
}

export function getRiskBorderColor(risk: RiskLevel): string {
  const colors = {
    low: "border-emerald-200",
    moderate: "border-amber-200",
    high: "border-orange-200",
    critical: "border-red-200"
  }
  return colors[risk]
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
