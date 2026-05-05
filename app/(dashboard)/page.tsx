'use client'

import { Package, AlertCircle, Clock, GitBranch } from 'lucide-react'
import { KPICard } from '@/components/dashboard/kpi-card'
import { InventoryByBranchChart } from '@/components/dashboard/inventory-by-branch-chart'
import { StockMovementChart } from '@/components/dashboard/stock-movement-chart'
import { ExpiringProductsTimeline } from '@/components/dashboard/expiring-products-timeline'
import { RecentActivityTable } from '@/components/dashboard/recent-activity-table'
import { mockInventoryItems, mockBranches, mockAlerts } from '@/lib/mock-data'

export default function Dashboard() {
  const totalItems = mockInventoryItems.reduce((sum, item) => sum + item.quantity, 0)
  const lowStockItems = mockInventoryItems.filter((item) => item.status === 'low-stock').length
  const expiringItems = mockInventoryItems.filter((item) => item.status === 'expiring').length
  const activeBranches = mockBranches.filter((branch) => branch.status === 'active').length
  const criticalAlerts = mockAlerts.filter((alert) => alert.severity === 'critical').length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your inventory overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Items"
          value={totalItems.toLocaleString()}
          subtitle="In all branches"
          icon={Package}
          color="primary"
          trend={{ value: 12, label: 'vs last month', positive: true }}
        />
        <KPICard
          title="Low Stock"
          value={lowStockItems}
          subtitle="Need reordering"
          icon={AlertCircle}
          color="warning"
          trend={{ value: 3, label: 'new alerts', positive: false }}
        />
        <KPICard
          title="Expiring Soon"
          value={expiringItems}
          subtitle="Next 30 days"
          icon={Clock}
          color="error"
          trend={{ value: 8, label: 'this month', positive: false }}
        />
        <KPICard
          title="Active Branches"
          value={activeBranches}
          subtitle="Operating locations"
          icon={GitBranch}
          color="success"
          trend={{ value: 0, label: 'unchanged', positive: true }}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryByBranchChart />
        <StockMovementChart />
      </div>

      {/* Charts Row 2 & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ExpiringProductsTimeline />
        </div>
        <div className="lg:col-span-2">
          <RecentActivityTable />
        </div>
      </div>
    </div>
  )
}
