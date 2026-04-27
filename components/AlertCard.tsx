import { cn } from "@/lib/utils"
import { type Alert, getRiskBgColor, getRiskBorderColor, getRiskTextColor, formatDate } from "@/lib/data"
import { AlertTriangle, Info, ShieldAlert, Heart } from "lucide-react"

interface AlertCardProps {
  alert: Alert
  onClick?: () => void
  className?: string
}

import { useLanguage } from "@/hooks/use-language"

const typeIcons = {
  outbreak: ShieldAlert,
  warning: AlertTriangle,
  info: Info,
  prevention: Heart,
}

export function AlertCard({ alert, onClick, className }: AlertCardProps) {
  const { t } = useLanguage()
  const Icon = typeIcons[alert.type]

  const typeLabels = {
    outbreak: t.alerts?.outbreak || "Outbreak",
    warning: t.alerts?.warning || "Warning",
    info: t.alerts?.info || "Information",
    prevention: t.alerts?.prevention || "Prevention",
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-2xl border-2 p-4 text-left transition-all hover:shadow-md active:scale-[0.98]",
        getRiskBgColor(alert.severity),
        getRiskBorderColor(alert.severity),
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            alert.severity === "critical" ? "bg-red-500" :
            alert.severity === "high" ? "bg-orange-500" :
            alert.severity === "moderate" ? "bg-amber-500" : "bg-emerald-500"
          )}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-xs font-medium",
                getRiskTextColor(alert.severity)
              )}
            >
              {typeLabels[alert.type]}
            </span>
            {alert.isActive && (
              <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </div>
          <h3 className={cn("mt-1 font-semibold", getRiskTextColor(alert.severity))}>
            {alert.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {alert.description}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {formatDate(alert.createdAt)}
          </p>
        </div>
      </div>
    </button>
  )
}
