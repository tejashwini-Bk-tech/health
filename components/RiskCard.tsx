import { cn } from "@/lib/utils"
import { type RiskLevel, getRiskColor, getRiskBgColor, getRiskTextColor, getRiskBorderColor } from "@/lib/data"
import { AlertTriangle, CheckCircle, AlertCircle, XCircle } from "lucide-react"

interface RiskCardProps {
  level: RiskLevel
  title: string
  subtitle?: string
  value?: string | number
  className?: string
}

const riskIcons = {
  low: CheckCircle,
  moderate: AlertCircle,
  high: AlertTriangle,
  critical: XCircle,
}

const riskLabels = {
  low: "Low Risk",
  moderate: "Moderate Risk",
  high: "High Risk",
  critical: "Critical",
}

export function RiskCard({ level, title, subtitle, value, className }: RiskCardProps) {
  const Icon = riskIcons[level]

  return (
    <div
      className={cn(
        "rounded-2xl border-2 p-4 transition-all",
        getRiskBgColor(level),
        getRiskBorderColor(level),
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                getRiskColor(level),
                "text-white"
              )}
            >
              <Icon className="h-3 w-3" />
              {riskLabels[level]}
            </span>
          </div>
          <h3 className={cn("mt-2 text-lg font-semibold", getRiskTextColor(level))}>
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {value !== undefined && (
          <div className={cn("text-3xl font-bold", getRiskTextColor(level))}>
            {value}
          </div>
        )}
      </div>
    </div>
  )
}
