import type { DbHealthReport, DbAlert } from "./db"

export interface Prediction {
  id: string
  type: "disease_outbreak" | "water_contamination" | "health_trend" | "risk_assessment"
  title: string
  description: string
  confidence: number // 0-100
  severity: "low" | "moderate" | "high" | "critical"
  affectedAreas: string[]
  timeframe: "immediate" | "1-3_days" | "1_week" | "2_weeks"
  recommendations: string[]
  dataSource: "symptoms" | "water_reports" | "combined"
  createdAt: Date
  factors: {
    symptomPatterns: string[]
    locationClusters: string[]
    severityTrend: "increasing" | "stable" | "decreasing"
    reportVolume: number
    timeSpan: number // in days
  }
}

export interface PredictionInsight {
  summary: string
  keyFindings: string[]
  riskLevel: "low" | "moderate" | "high" | "critical"
  actionItems: string[]
  confidence: number
}

// AI Prediction Engine
export class AIPredictionEngine {
  private static readonly DISEASE_PATTERNS: Record<string, string[]> = {
    cholera: ["diarrhea", "vomiting", "dehydration", "stomach cramps"],
    typhoid: ["fever", "headache", "stomach pain", "constipation"],
    dysentery: ["bloody diarrhea", "abdominal pain", "fever"],
    hepatitis: ["jaundice", "fatigue", "abdominal pain", "dark urine"],
    malaria: ["fever", "chills", "headache", "body aches"],
    dengue: ["high fever", "headache", "joint pain", "rash"]
  }

  private static readonly SEVERITY_WEIGHTS: Record<string, number> = {
    mild: 1,
    moderate: 3,
    severe: 5
  }

  private static readonly LOCATION_WEIGHTS = {
    "same_village": 3,
    "nearby_village": 2,
    "same_district": 1.5,
    "different_district": 1
  }

  static async analyzeHealthReports(reports: DbHealthReport[]): Promise<Prediction[]> {
    if (reports.length === 0) return []

    const predictions: Prediction[] = []
    const now = new Date()

    // Group reports by location and time
    const locationGroups = AIPredictionEngine.groupReportsByLocation(reports)
    const timeGroups = AIPredictionEngine.groupReportsByTime(reports)

    // Analyze for disease outbreaks
    const outbreakPredictions = AIPredictionEngine.predictDiseaseOutbreaks(locationGroups, timeGroups, now)
    predictions.push(...outbreakPredictions)

    // Analyze health trends
    const trendPredictions = AIPredictionEngine.predictHealthTrends(reports, timeGroups, now)
    predictions.push(...trendPredictions)

    // Analyze risk assessments
    const riskPredictions = AIPredictionEngine.predictRiskAssessments(locationGroups, now)
    predictions.push(...riskPredictions)

    return predictions.sort((a, b) => b.confidence - a.confidence)
  }

  static async generateInsightSummary(reports: DbHealthReport[], alerts: DbAlert[]): Promise<PredictionInsight> {
    const totalReports = reports.length
    const recentReports = reports.filter(r => 
      new Date(r.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    )

    const severityDistribution = AIPredictionEngine.calculateSeverityDistribution(reports)
    const locationHotspots = AIPredictionEngine.identifyLocationHotspots(reports)
    const symptomPatterns = AIPredictionEngine.identifySymptomPatterns(reports)

    // Calculate overall risk level
    const riskScore = AIPredictionEngine.calculateOverallRiskScore(reports, alerts)
    const riskLevel = AIPredictionEngine.getRiskLevelFromScore(riskScore)

    return {
      summary: `Based on ${totalReports} health reports with ${recentReports.length} in the last week, the current health situation shows ${riskLevel} risk level. ${locationHotspots.length > 0 ? `Hotspots identified in ${locationHotspots.join(", ")}.` : ""}`,
      keyFindings: [
        `${recentReports.length} new reports in the past 7 days`,
        `Most common symptoms: ${symptomPatterns.slice(0, 3).join(", ")}`,
        severityDistribution.severe > 0 ? `${severityDistribution.severe} severe cases reported` : "No severe cases reported",
        locationHotspots.length > 0 ? `${locationHotspots.length} locations showing increased activity` : "No significant location clusters"
      ],
      riskLevel,
      actionItems: AIPredictionEngine.generateActionItems(riskLevel, symptomPatterns, locationHotspots),
      confidence: Math.min(95, 60 + (recentReports.length * 5))
    }
  }

  private static groupReportsByLocation(reports: DbHealthReport[]): Map<string, DbHealthReport[]> {
    const groups = new Map<string, DbHealthReport[]>()
    
    reports.forEach(report => {
      const location = report.location || "unknown"
      if (!groups.has(location)) {
        groups.set(location, [])
      }
      groups.get(location)!.push(report)
    })
    
    return groups
  }

  private static groupReportsByTime(reports: DbHealthReport[]): Map<string, DbHealthReport[]> {
    const groups = new Map<string, DbHealthReport[]>()
    const now = new Date()
    
    reports.forEach(report => {
      const reportDate = new Date(report.created_at)
      const daysAgo = Math.floor((now.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24))
      const timeKey = daysAgo <= 1 ? "today" : daysAgo <= 7 ? "week" : "older"
      
      if (!groups.has(timeKey)) {
        groups.set(timeKey, [])
      }
      groups.get(timeKey)!.push(report)
    })
    
    return groups
  }

  private static predictDiseaseOutbreaks(
    locationGroups: Map<string, DbHealthReport[]>,
    timeGroups: Map<string, DbHealthReport[]>,
    now: Date
  ): Prediction[] {
    const predictions: Prediction[] = []

    locationGroups.forEach((reports, location) => {
      if (reports.length < 3) return // Need minimum reports for prediction

      const symptomPatterns = AIPredictionEngine.identifySymptomPatterns(reports)
      const potentialDiseases = AIPredictionEngine.identifyPotentialDiseases(symptomPatterns)
      
      potentialDiseases.forEach(disease => {
        const confidence = AIPredictionEngine.calculateDiseaseConfidence(reports, disease)
        
        if (confidence > 60) {
          predictions.push({
            id: `outbreak_${location}_${disease}_${Date.now()}`,
            type: "disease_outbreak",
            title: `Potential ${disease.charAt(0).toUpperCase() + disease.slice(1)} Outbreak`,
            description: `Increased reporting of symptoms consistent with ${disease} detected in ${location}. ${reports.length} cases reported in recent days.`,
            confidence,
            severity: AIPredictionEngine.getSeverityFromConfidence(confidence),
            affectedAreas: [location],
            timeframe: AIPredictionEngine.getPredictionTimeframe(confidence),
            recommendations: AIPredictionEngine.getDiseaseRecommendations(disease),
            dataSource: "symptoms",
            createdAt: now,
            factors: {
              symptomPatterns,
              locationClusters: [location],
              severityTrend: AIPredictionEngine.calculateTrend(reports),
              reportVolume: reports.length,
              timeSpan: AIPredictionEngine.calculateTimeSpan(reports)
            }
          })
        }
      })
    })

    return predictions
  }

  private static predictHealthTrends(
    reports: DbHealthReport[],
    timeGroups: Map<string, DbHealthReport[]>,
    now: Date
  ): Prediction[] {
    const predictions: Prediction[] = []
    
    const todayReports = timeGroups.get("today") || []
    const weekReports = timeGroups.get("week") || []
    
    if (weekReports.length > 5) {
      const trend = AIPredictionEngine.calculateTrend(reports)
      const confidence = AIPredictionEngine.calculateTrendConfidence(todayReports, weekReports)
      
      predictions.push({
        id: `trend_${trend}_${Date.now()}`,
        type: "health_trend",
        title: `Health Reporting Trend: ${trend.charAt(0).toUpperCase() + trend.slice(1)}`,
        description: `Health reports showing ${trend} pattern with ${weekReports.length} reports this week and ${todayReports.length} today.`,
        confidence,
        severity: trend === "increasing" ? "moderate" : "low",
        affectedAreas: [...new Set(reports.map(r => r.location).filter((loc): loc is string => Boolean(loc)))],
        timeframe: "1_week",
        recommendations: AIPredictionEngine.getTrendRecommendations(trend),
        dataSource: "combined",
        createdAt: now,
        factors: {
          symptomPatterns: AIPredictionEngine.identifySymptomPatterns(reports),
          locationClusters: [...new Set(reports.map(r => r.location).filter((loc): loc is string => Boolean(loc)))],
          severityTrend: trend,
          reportVolume: weekReports.length,
          timeSpan: 7
        }
      })
    }

    return predictions
  }

  private static predictRiskAssessments(
    locationGroups: Map<string, DbHealthReport[]>,
    now: Date
  ): Prediction[] {
    const predictions: Prediction[] = []

    locationGroups.forEach((reports, location) => {
      const riskScore = AIPredictionEngine.calculateLocationRiskScore(reports)
      const confidence = Math.min(95, 50 + (reports.length * 10))
      
      if (riskScore > 5) {
        predictions.push({
          id: `risk_${location}_${Date.now()}`,
          type: "risk_assessment",
          title: `Health Risk Assessment: ${location}`,
          description: `${location} showing elevated health risk score of ${riskScore}/10 based on recent reporting patterns.`,
          confidence,
          severity: AIPredictionEngine.getSeverityFromRiskScore(riskScore),
          affectedAreas: [location],
          timeframe: "1-3_days",
          recommendations: AIPredictionEngine.getRiskRecommendations(riskScore),
          dataSource: "combined",
          createdAt: now,
          factors: {
            symptomPatterns: AIPredictionEngine.identifySymptomPatterns(reports),
            locationClusters: [location],
            severityTrend: AIPredictionEngine.calculateTrend(reports),
            reportVolume: reports.length,
            timeSpan: AIPredictionEngine.calculateTimeSpan(reports)
          }
        })
      }
    })

    return predictions
  }

  private static identifySymptomPatterns(reports: DbHealthReport[]): string[] {
    const symptomCounts = new Map<string, number>()
    
    reports.forEach(report => {
      report.symptoms.forEach(symptom => {
        symptomCounts.set(symptom, (symptomCounts.get(symptom) || 0) + 1)
      })
    })
    
    return Array.from(symptomCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([symptom]) => symptom)
  }

  private static identifyPotentialDiseases(symptoms: string[]): string[] {
    const matches = new Map<string, number>()
    
    Object.entries(AIPredictionEngine.DISEASE_PATTERNS).forEach(([disease, diseaseSymptoms]) => {
      const matchCount = diseaseSymptoms.filter((diseaseSymptom: string) => 
        symptoms.some(reportSymptom => 
          reportSymptom.toLowerCase().includes(diseaseSymptom.toLowerCase())
        )
      ).length
      
      if (matchCount > 0) {
        matches.set(disease, matchCount)
      }
    })
    
    return Array.from(matches.entries())
      .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
      .map(([disease]: [string, number]) => disease)
  }

  private static calculateDiseaseConfidence(reports: DbHealthReport[], disease: string): number {
    const diseaseSymptoms = AIPredictionEngine.DISEASE_PATTERNS[disease] || []
    const matchingSymptoms = reports.filter(report =>
      report.symptoms.some(symptom =>
        diseaseSymptoms.some(diseaseSymptom =>
          symptom.toLowerCase().includes(diseaseSymptom.toLowerCase())
        )
      )
    ).length
    
    const baseConfidence = (matchingSymptoms / reports.length) * 100
    const severityBonus = reports.reduce((sum, report) => 
      sum + (this.SEVERITY_WEIGHTS[report.severity] || 0), 0
    ) / reports.length
    
    return Math.min(95, baseConfidence + severityBonus * 5)
  }

  private static calculateTrend(reports: DbHealthReport[]): "increasing" | "stable" | "decreasing" {
    if (reports.length < 2) return "stable"
    
    const sortedReports = reports.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    
    const midpoint = Math.floor(sortedReports.length / 2)
    const firstHalf = sortedReports.slice(0, midpoint)
    const secondHalf = sortedReports.slice(midpoint)
    
    const firstHalfAvgSeverity = firstHalf.reduce((sum, r) => 
      sum + (AIPredictionEngine.SEVERITY_WEIGHTS[String(r.severity)] || 0), 0
    ) / firstHalf.length
    
    const secondHalfAvgSeverity = secondHalf.reduce((sum, r) => 
      sum + (AIPredictionEngine.SEVERITY_WEIGHTS[String(r.severity)] || 0), 0
    ) / secondHalf.length
    
    if (secondHalfAvgSeverity > firstHalfAvgSeverity * 1.2) return "increasing"
    if (secondHalfAvgSeverity < firstHalfAvgSeverity * 0.8) return "decreasing"
    return "stable"
  }

  private static calculateSeverityDistribution(reports: DbHealthReport[]) {
    return reports.reduce((dist, report) => {
      const severity = String(report.severity)
      dist[severity] = (dist[severity] || 0) + 1
      return dist
    }, {} as Record<string, number>)
  }

  private static identifyLocationHotspots(reports: DbHealthReport[]): string[] {
    const locationCounts = new Map<string, number>()
    
    reports.forEach(report => {
      const location = report.location || "unknown"
      locationCounts.set(location, (locationCounts.get(location) || 0) + 1)
    })
    
    return Array.from(locationCounts.entries())
      .filter(([_, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .map(([location]) => location)
  }

  private static calculateOverallRiskScore(reports: DbHealthReport[], alerts: DbAlert[]): number {
    const reportScore = reports.reduce((score, report) => 
      score + (AIPredictionEngine.SEVERITY_WEIGHTS[String(report.severity)] || 0), 0
    )
    
    const alertScore = alerts.reduce((score, alert) => {
      const severityWeight = alert.severity === "critical" ? 5 : 
                           alert.severity === "high" ? 3 : 
                           alert.severity === "moderate" ? 2 : 1
      return score + severityWeight
    }, 0)
    
    const locationFactor = new Set(reports.map(r => r.location)).size
    const recencyFactor = reports.filter(r => 
      new Date(r.created_at) > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    ).length
    
    return Math.min(10, (reportScore + alertScore) / Math.max(1, locationFactor) * (1 + recencyFactor * 0.1))
  }

  private static getRiskLevelFromScore(score: number): "low" | "moderate" | "high" | "critical" {
    if (score >= 8) return "critical"
    if (score >= 6) return "high"
    if (score >= 4) return "moderate"
    return "low"
  }

  private static getSeverityFromConfidence(confidence: number): "low" | "moderate" | "high" | "critical" {
    if (confidence >= 85) return "critical"
    if (confidence >= 70) return "high"
    if (confidence >= 55) return "moderate"
    return "low"
  }

  private static getSeverityFromRiskScore(score: number): "low" | "moderate" | "high" | "critical" {
    if (score >= 8) return "critical"
    if (score >= 6) return "high"
    if (score >= 4) return "moderate"
    return "low"
  }

  private static getPredictionTimeframe(confidence: number): "immediate" | "1-3_days" | "1_week" | "2_weeks" {
    if (confidence >= 85) return "immediate"
    if (confidence >= 70) return "1-3_days"
    if (confidence >= 55) return "1_week"
    return "2_weeks"
  }

  private static getDiseaseRecommendations(disease: string): string[] {
    // This will be handled by the component using translations
    // Return disease type for translation lookup
    return [disease]
  }

  private static getTrendRecommendations(trend: string): string[] {
    // Return trend type for translation lookup
    return [trend]
  }

  private static getRiskRecommendations(riskScore: number): string[] {
    // Return risk level for translation lookup
    if (riskScore >= 8) return ["critical"]
    if (riskScore >= 6) return ["high"]
    return ["moderate"]
  }

  private static generateActionItems(
    riskLevel: string,
    symptoms: string[],
    locations: string[]
  ): string[] {
    const actions = [
      "Continue monitoring health reports"
    ]
    
    if (riskLevel === "high" || riskLevel === "critical") {
      actions.push("Activate emergency response protocols")
      actions.push("Increase medical resource availability")
    }
    
    if (symptoms.length > 0) {
      actions.push(`Focus on ${symptoms.slice(0, 2).join(" and ")} symptoms`)
    }
    
    if (locations.length > 0) {
      actions.push(`Prioritize ${locations.slice(0, 2).join(" and ")} areas`)
    }
    
    return actions
  }

  private static calculateTrendConfidence(todayReports: DbHealthReport[], weekReports: DbHealthReport[]): number {
    if (weekReports.length === 0) return 0
    
    const todayRatio = todayReports.length / weekReports.length
    const baseConfidence = Math.min(80, weekReports.length * 10)
    
    return Math.min(95, baseConfidence + (todayRatio > 0.3 ? 15 : 0))
  }

  private static calculateLocationRiskScore(reports: DbHealthReport[]): number {
    if (reports.length === 0) return 0
    
    const severityScore = reports.reduce((sum, report) => 
      sum + (AIPredictionEngine.SEVERITY_WEIGHTS[String(report.severity)] || 0), 0
    )
    
    const recencyBonus = reports.filter(r => 
      new Date(r.created_at) > new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    ).length * 2
    
    return Math.min(10, (severityScore / reports.length) + recencyBonus)
  }

  private static calculateTimeSpan(reports: DbHealthReport[]): number {
    if (reports.length === 0) return 0
    
    const dates = reports.map(r => new Date(r.created_at).getTime())
    const minDate = Math.min(...dates)
    const maxDate = Math.max(...dates)
    
    return Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24))
  }
}

// Export convenience functions
export const generatePredictions = AIPredictionEngine.analyzeHealthReports
export const generateInsightSummary = AIPredictionEngine.generateInsightSummary
