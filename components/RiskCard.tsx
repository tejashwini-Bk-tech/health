import { cn } from "@/lib/utils"
import { type RiskLevel } from "@/lib/data"
import { AlertTriangle, CheckCircle, AlertCircle, XCircle } from "lucide-react"

interface RiskCardProps { level: RiskLevel; title: string; subtitle?: string; value?: string | number; className?: string }
const riskIcons = { low: CheckCircle, moderate: AlertCircle, high: AlertTriangle, critical: XCircle }
const riskLabels = { low: "Low Risk", moderate: "Moderate Risk", high: "High Risk", critical: "Critical" }
const riskColors = {
  low: { accent:"hsl(160,84%,40%)", bg:"hsl(160,84%,40%,0.06)", border:"hsl(160,84%,40%,0.18)", glow:"hsl(160,84%,40%,0.1)", badge:"hsl(160,84%,40%,0.12)", text:"hsl(160,84%,30%)" },
  moderate: { accent:"hsl(38,92%,50%)", bg:"hsl(38,92%,50%,0.06)", border:"hsl(38,92%,50%,0.18)", glow:"hsl(38,92%,50%,0.1)", badge:"hsl(38,92%,50%,0.12)", text:"hsl(38,80%,35%)" },
  high: { accent:"hsl(25,95%,50%)", bg:"hsl(25,95%,50%,0.06)", border:"hsl(25,95%,50%,0.18)", glow:"hsl(25,95%,50%,0.1)", badge:"hsl(25,95%,50%,0.12)", text:"hsl(25,80%,38%)" },
  critical: { accent:"hsl(0,85%,56%)", bg:"hsl(0,85%,56%,0.06)", border:"hsl(0,85%,56%,0.2)", glow:"hsl(0,85%,56%,0.12)", badge:"hsl(0,85%,56%,0.12)", text:"hsl(0,75%,42%)" },
}

export function RiskCard({ level, title, subtitle, value, className }: RiskCardProps) {
  const Icon = riskIcons[level]; const colors = riskColors[level]
  return (
    <div className={cn("relative overflow-hidden rounded-2xl p-5 glass-card transition-all", className)}
      style={{ background:`linear-gradient(135deg, ${colors.bg}, hsl(0 0% 100% / 0.7))`, borderColor:colors.border, boxShadow:`0 0 25px ${colors.glow}, 0 4px 20px hsl(220 25% 12% / 0.04), inset 0 1px 0 hsl(0 0% 100% / 0.5)` }}>
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20" style={{ background: colors.accent }} />
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold tracking-wide" style={{ background:colors.badge, color:colors.text }}>
              <Icon className="h-3 w-3" />{riskLabels[level]}
            </span>
            {level === "critical" && <span className="h-2 w-2 rounded-full animate-breathe-danger" style={{ background:colors.accent }} />}
          </div>
          <h3 className="mt-3 text-lg font-bold" style={{ color:colors.text }}>{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
        {value !== undefined && <div className="text-4xl font-black tracking-tight" style={{ color:colors.text }}>{value}</div>}
      </div>
    </div>
  )
}
