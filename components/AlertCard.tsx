import { cn } from "@/lib/utils"
import { type Alert, formatDate } from "@/lib/data"
import { AlertTriangle, Info, ShieldAlert, Heart } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

interface AlertCardProps { alert: Alert; onClick?: () => void; className?: string }
const typeIcons = { outbreak: ShieldAlert, warning: AlertTriangle, info: Info, prevention: Heart }
const severityStyles = {
  low: { accent:"hsl(160,84%,40%)", iconBg:"hsl(160,84%,40%,0.1)", iconText:"hsl(160,70%,32%)", glow:"0 0 15px hsl(160,84%,40%,0.08)" },
  moderate: { accent:"hsl(38,92%,50%)", iconBg:"hsl(38,92%,50%,0.1)", iconText:"hsl(38,80%,35%)", glow:"0 0 15px hsl(38,92%,50%,0.08)" },
  high: { accent:"hsl(25,95%,50%)", iconBg:"hsl(25,95%,50%,0.1)", iconText:"hsl(25,80%,38%)", glow:"0 0 15px hsl(25,95%,50%,0.08)" },
  critical: { accent:"hsl(0,85%,56%)", iconBg:"hsl(0,85%,56%,0.1)", iconText:"hsl(0,75%,42%)", glow:"0 0 15px hsl(0,85%,56%,0.08)" },
}

export function AlertCard({ alert, onClick, className }: AlertCardProps) {
  const { t } = useLanguage()
  const Icon = typeIcons[alert.type]; const styles = severityStyles[alert.severity]
  const typeLabels = { outbreak: t.alerts?.outbreak||"Outbreak", warning: t.alerts?.warning||"Warning", info: t.alerts?.info||"Information", prevention: t.alerts?.prevention||"Prevention" }

  return (
    <button onClick={onClick} className={cn("w-full glass-card glass-card-hover rounded-2xl p-4 text-left relative overflow-hidden", className)}>
      <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background:styles.accent }} />
      <div className="flex items-start gap-3 pl-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background:styles.iconBg, boxShadow:styles.glow }}>
          <Icon className="h-5 w-5" style={{ color:styles.iconText }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color:styles.iconText }}>{typeLabels[alert.type]}</span>
            {alert.isActive && <span className="flex h-2 w-2 rounded-full animate-breathe-danger" style={{ background:styles.accent }} />}
          </div>
          <h3 className="mt-1 font-semibold text-gray-800 text-sm leading-snug">{alert.title}</h3>
          <p className="mt-1 text-[13px] text-gray-500 line-clamp-2 leading-relaxed">{alert.description}</p>
          <p className="mt-2 text-[11px] font-medium text-gray-400">{formatDate(alert.createdAt)}</p>
        </div>
      </div>
    </button>
  )
}
