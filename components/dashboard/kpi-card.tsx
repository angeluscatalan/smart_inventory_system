import { LucideIcon } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    label: string
    positive: boolean
  }
  color?: 'primary' | 'success' | 'warning' | 'error'
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'primary',
}: KPICardProps) {
  const colorClasses = {
    primary: 'text-primary',
    success: 'text-status-normal',
    warning: 'text-status-warning',
    error: 'text-status-critical',
  }

  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold text-foreground mt-2">{value}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          {trend && (
            <div className="mt-3 flex items-center gap-1">
              <span
                className={`text-xs font-semibold ${
                  trend.positive ? 'text-status-normal' : 'text-status-critical'
                }`}
              >
                {trend.positive ? '↑' : '↓'} {trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-secondary ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}
