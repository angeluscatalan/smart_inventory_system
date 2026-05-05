'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertList } from '@/components/notifications/alert-list'
import { mockAlerts } from '@/lib/mock-data'
import { useAuth } from '@/lib/auth-context'

export default function NotificationsPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/')
    }
  }, [user, router])

  if (!user || user.role !== 'admin') return null

  const criticalCount = mockAlerts.filter(a => a.severity === 'critical').length
  const warningCount = mockAlerts.filter(a => a.severity === 'warning').length
  const infoCount = mockAlerts.filter(a => a.severity === 'info').length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground mt-1">Stay updated with system alerts and inventory notifications</p>
      </div>

      {/* Alert Counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground">Critical Alerts</p>
          <p className="text-2xl font-bold text-status-critical mt-1">{criticalCount}</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground">Warnings</p>
          <p className="text-2xl font-bold text-status-warning mt-1">{warningCount}</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground">Info</p>
          <p className="text-2xl font-bold text-primary mt-1">{infoCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Select defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="low-stock">Low Stock</SelectItem>
            <SelectItem value="expiring">Expiring</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Alert List */}
      <AlertList alerts={mockAlerts} />
    </div>
  )
}
