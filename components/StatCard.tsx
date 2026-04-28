import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react"

interface StatCardProps { title: string; value: string | number; subtitle?: string; trend?: "increasing"|"decreasing"|"stable"; trendValue?: string; icon?: LucideIcon; iconColor?: string; className?: string }

const iconColorMap: Record<string, { bg: string; text: string; glow: string }> = {
  "text-red-500": { bg:"hsl(0,85%,56%,0.08)", text:"hsl(0,75%,45%)", glow:"0 0 15px hsl(0,85%,56%,0.1)" },
  "text-orange-500": { bg:"hsl(25,95%,50%,0.08)", text:"hsl(25,80%,40%)", glow:"0 0 15px hsl(25,95%,50%,0.1)" },
  "text-blue-500": { bg:"hsl(210,90%,52%,0.08)", text:"hsl(210,80%,42%)", glow:"0 0 15px hsl(210,90%,52%,0.1)" },
  "text-teal-500": { bg:"hsl(160,84%,36%,0.08)", text:"hsl(160,70%,30%)", glow:"0 0 15px hsl(160,84%,36%,0.1)" },
  "text-emerald-600": { bg:"hsl(160,84%,36%,0.08)", text:"hsl(160,70%,30%)", glow:"0 0 15px hsl(160,84%,36%,0.1)" },
}

export function StatCard({ title, value, subtitle, trend, trendValue, icon: Icon, iconColor = "text-emerald-600", className }: StatCardProps) {
  const TrendIcon = trend === "increasing" ? TrendingUp : trend === "decreasing" ? TrendingDown : Minus
  const trendColor = trend === "increasing" ? "text-red-600" : trend === "decreasing" ? "text-emerald-600" : "text-gray-500"
  const colors = iconColorMap[iconColor] || iconColorMap["text-emerald-600"]

  return (
    <div className={cn("glass-card glass-card-hover rounded-2xl p-4 relative overflow-hidden group", className)}>
      <div className="absolute top-0 left-4 right-4 h-px opacity-40" style={{ background:`linear-gradient(90deg, transparent, ${colors.text}40, transparent)` }} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{title}</p>
          <p className="mt-1.5 text-2xl font-extrabold text-gray-900 tracking-tight">{value}</p>
          {subtitle && <p className="mt-0.5 text-[11px] text-gray-500">{subtitle}</p>}
          {trend && trendValue && <div className={cn("mt-2 flex items-center gap-1 text-xs font-semibold", trendColor)}><TrendIcon className="h-3 w-3" /><span>{trendValue}</span></div>}
        </div>
        {Icon && <div className="rounded-xl p-2.5 transition-transform duration-300 group-hover:scale-110" style={{ background:colors.bg, boxShadow:colors.glow }}><Icon className="h-5 w-5" style={{ color:colors.text }} /></div>}
      </div>
    </div>
  )
}
