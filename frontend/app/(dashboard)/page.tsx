'use client'

import { Package, AlertCircle, Clock, GitBranch } from 'lucide-react'
import { KPICard } from '@/components/dashboard/kpi-card'
import { InventoryByBranchChart } from '@/components/dashboard/inventory-by-branch-chart'
import { StockMovementChart } from '@/components/dashboard/stock-movement-chart'
import { ExpiringProductsTimeline } from '@/components/dashboard/expiring-products-timeline'
import { RecentActivityTable } from '@/components/dashboard/recent-activity-table'
import { useAuth } from '@/lib/auth-context'
import { canAccessAllBranches } from '@/lib/permissions'
import { useEffect, useState } from 'react'
import { fetchInventoryItems } from '@/lib/api/inventory'
import { fetchBranches } from '@/lib/api/branches'
import type { InventoryItem, Branch } from '@/lib/types'

export default function Dashboard() {
  const { user } = useAuth()
  const isAdmin = user?.role ? canAccessAllBranches(user.role) : false

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [branches, setBranches] = useState<Branch[]>([])

  useEffect(() => {
    fetchInventoryItems(isAdmin ? undefined : { branchId: user?.branch ?? undefined })
      .then(setInventoryItems)
      .catch(() => setInventoryItems([]))
    fetchBranches()
      .then(setBranches)
      .catch(() => setBranches([]))
  }, [isAdmin, user?.branch])

  const filteredBranches = isAdmin
    ? branches
    : branches.filter((b) => b.name === user?.branch)

  const totalItems = inventoryItems.reduce((sum, item) => sum + item.quantity, 0)
  const lowStockItems = inventoryItems.filter((item) => item.status === 'low-stock').length
  const expiringItems = inventoryItems.filter((item) => item.status === 'expiring').length
  const activeBranches = filteredBranches.filter((branch) => branch.status === 'active').length

  const branchLabel = isAdmin ? 'In all branches' : `${user?.branch}`

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Maligayang pagbabalik, {user?.fullName}! Here&apos;s your inventory overview.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Items"
          value={totalItems.toLocaleString()}
          subtitle={branchLabel}
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

      {/* Charts Row 1 - Admin only */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InventoryByBranchChart />
          <StockMovementChart />
        </div>
      )}

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
