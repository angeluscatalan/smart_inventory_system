'use client'

import { useState } from 'react'
import { AlertCircle, Clock, CheckCircle, Zap, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert } from '@/lib/types'

interface AlertListProps {
  alerts: Alert[]
}

const typeIcons = {
  'low-stock': AlertCircle,
  expiring: Clock,
  expired: AlertCircle,
  system: Zap,
}

export function AlertList({ alerts }: AlertListProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([])

  const handleDismiss = (id: string) => {
    setDismissedAlerts([...dismissedAlerts, id])
  }

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.includes(alert.id))

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-l-4 border-l-status-critical bg-status-critical/5'
      case 'warning':
        return 'border-l-4 border-l-status-warning bg-status-warning/5'
      default:
        return 'border-l-4 border-l-primary bg-primary/5'
    }
  }

  return (
    <div className="space-y-4">
      {visibleAlerts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-12 h-12 text-status-normal mx-auto mb-3" />
            <p className="text-foreground font-medium">All caught up!</p>
            <p className="text-muted-foreground text-sm">You have no notifications at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        visibleAlerts.map((alert) => {
          const Icon = typeIcons[alert.type] || AlertCircle
          return (
            <div
              key={alert.id}
              className={`rounded-lg p-4 flex items-start justify-between gap-4 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start gap-3 flex-1">
                <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{alert.message}</p>
                  {alert.item && (
                    <p className="text-sm text-muted-foreground mt-1">
                      <span className="font-medium">{alert.item}</span>
                      {alert.branch && ` • ${alert.branch}`}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDate(alert.timestamp)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="flex-shrink-0"
                onClick={() => handleDismiss(alert.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )
        })
      )}
    </div>
  )
}
