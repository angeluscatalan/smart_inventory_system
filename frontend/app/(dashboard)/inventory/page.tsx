'use client'

import { useState, useEffect } from 'react'
import { Plus, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchFilterBar } from '@/components/inventory/search-filter-bar'
import { InventoryTable } from '@/components/inventory/inventory-table'
import { fetchInventoryItems } from '@/lib/api/inventory'
import { fetchBranches } from '@/lib/api/branches'
import { useAuth } from '@/lib/auth-context'
import { canAccessAllBranches } from '@/lib/permissions'
import type { InventoryItem, Branch } from '@/lib/types'

export default function InventoryPage() {
  const { user } = useAuth()
  const isAdmin = user?.role ? canAccessAllBranches(user.role) : false

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBranch, setSelectedBranch] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [items, setItems] = useState<InventoryItem[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    setError(false)
    Promise.all([fetchInventoryItems(), fetchBranches()])
      .then(([inventoryData, branchData]) => {
        setItems(inventoryData)
        setBranches(branchData)
      })
      .catch(() => {
        setError(true)
        setItems([])
        setBranches([])
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  function handleAddItem(): void {
    // TODO: open add-item modal or navigate to add-item form
  }

  function handleExportInventory(): void {
    // TODO: call export API and trigger file download
  }

  // Non-admin users only see their branch items
  const branchFilteredItems = isAdmin
    ? items
    : items.filter((item) => item.branch === user?.branch)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin
              ? 'View and manage all inventory items across branches'
              : `Manage inventory items for ${user?.branch}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportInventory}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={handleAddItem}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchFilterBar
        onSearch={setSearchQuery}
        onBranchChange={setSelectedBranch}
        onStatusChange={setSelectedStatus}
        onClear={() => {
          setSearchQuery('')
          setSelectedBranch('all')
          setSelectedStatus('all')
        }}
        showBranchFilter={isAdmin}
        branches={branches}
      />

      {/* Table */}
      <InventoryTable
        items={branchFilteredItems}
        searchQuery={searchQuery}
        selectedBranch={selectedBranch}
        selectedStatus={selectedStatus}
      />
    </div>
  )
}
