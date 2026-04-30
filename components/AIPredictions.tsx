import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/hooks/use-language"
import { Progress } from "@/components/ui/progress"
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  Clock, 
  MapPin, 
  Info,
  ChevronRight,
  RefreshCw,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Prediction, PredictionInsight } from "@/lib/ai-predictions"
import { generatePredictions, generateInsightSummary } from "@/lib/ai-predictions"
import { fetchHealthReports, fetchAlerts } from "@/lib/db"
import { toast } from "sonner"

interface AIPredictionsProps {
  className?: string
}

export function AIPredictions({ className }: AIPredictionsProps) {
  const { t } = useLanguage()
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [insight, setInsight] = useState<PredictionInsight | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadPredictions = async () => {
    setLoading(true)
    try {
      const [reports, alerts] = await Promise.all([
        fetchHealthReports(),
        fetchAlerts()
      ])

      const [newPredictions, newInsight] = await Promise.all([
        generatePredictions(reports),
        generateInsightSummary(reports, alerts)
      ])

      setPredictions(newPredictions)
      setInsight(newInsight)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error loading AI predictions:", error)
      toast.error("Failed to load AI predictions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPredictions()
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500 text-white"
      case "high": return "bg-orange-500 text-white"
      case "moderate": return "bg-yellow-500 text-white"
      case "low": return "bg-green-500 text-white"
      default: return "bg-gray-500 text-white"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "disease_outbreak": return AlertTriangle
      case "health_trend": return TrendingUp
      case "risk_assessment": return Shield
      default: return Brain
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return "text-green-600"
    if (confidence >= 70) return "text-yellow-600"
    if (confidence >= 55) return "text-orange-600"
    return "text-red-600"
  }

  const formatTimeframe = (timeframe: string) => {
    return t.aiPredictions.timeframe[timeframe as keyof typeof t.aiPredictions.timeframe] || timeframe
  }

  const translateRecommendations = (recommendations: string[], type: string): string[] => {
    if (recommendations.length === 1 && t.aiPredictions.recommendations[recommendations[0] as keyof typeof t.aiPredictions.recommendations]) {
      return t.aiPredictions.recommendations[recommendations[0] as keyof typeof t.aiPredictions.recommendations] as string[]
    }
    return recommendations
  }

  if (loading && predictions.length === 0) {
    return (
      <Card className={cn("relative overflow-hidden", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-lg">{t.aiPredictions.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
            <span className="ml-2 text-sm text-gray-600">{t.aiPredictions.loading}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* AI Insight Summary */}
      {insight && (
        <Card className="relative overflow-hidden border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-emerald-600" />
                <CardTitle className="text-lg">{t.aiPredictions.insight}</CardTitle>
                <Badge variant="outline" className={getSeverityColor(insight.riskLevel)}>
                  {insight.riskLevel.toUpperCase()} {t.aiPredictions.riskLevel}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadPredictions}
                disabled={loading}
                className="text-emerald-600 hover:text-emerald-700"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-700 leading-relaxed">{insight.summary}</p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-gray-800">{t.aiPredictions.keyFindings}:</span>
              </div>
              <ul className="space-y-1">
                {insight.keyFindings.map((finding, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-emerald-600 mt-0.5">•</span>
                    {finding}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-emerald-200">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{t.aiPredictions.confidence}:</span>
                <span className={cn("text-xs font-medium", getConfidenceColor(insight.confidence))}>
                  {insight.confidence}%
                </span>
              </div>
              {lastUpdated && (
                <span className="text-xs text-gray-500">
                  {t.aiPredictions.updated} {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Predictions List */}
      {predictions.length > 0 && (
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-lg">{t.aiPredictions.predictions}</CardTitle>
              <Badge variant="outline" className="bg-emerald-100 text-emerald-700">
                {predictions.length} {t.aiPredictions.active}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {predictions.slice(0, 3).map((prediction) => {
              const Icon = getTypeIcon(prediction.type)
              return (
                <div
                  key={prediction.id}
                  className="p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      prediction.severity === "critical" ? "bg-red-100" :
                      prediction.severity === "high" ? "bg-orange-100" :
                      prediction.severity === "moderate" ? "bg-yellow-100" : "bg-green-100"
                    )}>
                      <Icon className={cn(
                        "h-4 w-4",
                        prediction.severity === "critical" ? "text-red-600" :
                        prediction.severity === "high" ? "text-orange-600" :
                        prediction.severity === "moderate" ? "text-yellow-600" : "text-green-600"
                      )} />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 text-sm">{prediction.title}</h4>
                        <Badge variant="outline" className={getSeverityColor(prediction.severity)}>
                          {prediction.severity}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-gray-600 leading-relaxed">{prediction.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{formatTimeframe(prediction.timeframe)}</span>
                          </div>
                          {prediction.affectedAreas.length > 0 && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{prediction.affectedAreas[0]}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-xs font-medium", getConfidenceColor(prediction.confidence))}>
                            {prediction.confidence}%
                          </span>
                          <Progress value={prediction.confidence} className="w-12 h-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {predictions.length > 3 && (
              <Button variant="ghost" size="sm" className="w-full text-emerald-600 hover:text-emerald-700">
                {t.aiPredictions.viewAll}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Items */}
      {insight && insight.actionItems.length > 0 && (
        <Card className="relative overflow-hidden border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">{t.aiPredictions.recommendedActions}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {insight.actionItems.map((action, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  {action}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
