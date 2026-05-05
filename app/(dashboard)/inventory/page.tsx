'use client'

import { useState } from 'react'
import { Plus, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchFilterBar } from '@/components/inventory/search-filter-bar'
import { InventoryTable } from '@/components/inventory/inventory-table'
import { mockInventoryItems } from '@/lib/mock-data'

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBranch, setSelectedBranch] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">View and manage all inventory items across branches</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
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
      />

      {/* Table */}
      <InventoryTable
        items={mockInventoryItems}
        searchQuery={searchQuery}
        selectedBranch={selectedBranch}
        selectedStatus={selectedStatus}
      />
    </div>
  )
}
