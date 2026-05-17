import { prisma } from '../lib/prisma'

export type AlertType = 'low_stock' | 'expiring' | 'expired' | 'system'
export type AlertSeverity = 'info' | 'warning' | 'critical'

export interface GeneratedAlert {
  id: string
  type: AlertType
  item?: string
  branch?: string
  message: string
  severity: AlertSeverity
  timestamp: Date
  read: boolean
}

export interface AlertFilters {
  type?: AlertType
  severity?: AlertSeverity
}

export async function getAlerts(filters: AlertFilters): Promise<GeneratedAlert[]> {
  const now = new Date()
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const items = await prisma.inventoryItem.findMany()
  const alerts: GeneratedAlert[] = []

  for (const item of items) {
    const isExpired = item.expiryDate < now
    const isExpiring = !isExpired && item.expiryDate <= in30Days
    const isLowStock = item.quantity <= item.reorderLevel

    if (isExpired) {
      alerts.push({
        id: `expired-${item.id}`,
        type: 'expired',
        item: item.name,
        branch: item.branch,
        message: `${item.name} has expired`,
        severity: 'critical',
        timestamp: item.expiryDate,
        read: false,
      })
    } else if (isExpiring) {
      const daysLeft = Math.ceil(
        (item.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      )
      alerts.push({
        id: `expiring-${item.id}`,
        type: 'expiring',
        item: item.name,
        branch: item.branch,
        message: `${item.name} expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
        severity: daysLeft <= 7 ? 'critical' : 'warning',
        timestamp: now,
        read: false,
      })
    }

    if (isLowStock) {
      alerts.push({
        id: `low-stock-${item.id}`,
        type: 'low_stock',
        item: item.name,
        branch: item.branch,
        message: `${item.name} stock level (${item.quantity}) is at or below reorder level (${item.reorderLevel})`,
        severity: item.quantity === 0 ? 'critical' : 'warning',
        timestamp: now,
        read: false,
      })
    }
  }

  // Apply filters
  return alerts.filter((alert) => {
    if (filters.type && alert.type !== filters.type) return false
    if (filters.severity && alert.severity !== filters.severity) return false
    return true
  })
}
