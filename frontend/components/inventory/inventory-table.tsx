'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { InventoryItem } from '@/lib/types'

interface InventoryTableProps {
  items: InventoryItem[]
  searchQuery: string
  selectedBranch: string
  selectedStatus: string
}

const statusConfig = {
  normal: { label: 'Normal', color: 'status-normal' },
  'low-stock': { label: 'Low Stock', color: 'status-warning' },
  expiring: { label: 'Expiring', color: 'status-critical' },
  expired: { label: 'Expired', color: 'status-critical' },
}

export function InventoryTable({
  items,
  searchQuery,
  selectedBranch,
  selectedStatus,
}: InventoryTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof InventoryItem
    direction: 'asc' | 'desc'
  } | null>(null)

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.sku.toLowerCase().includes(query) ||
          item.supplier.toLowerCase().includes(query)
      )
    }

    // Apply branch filter
    if (selectedBranch !== 'all') {
      filtered = filtered.filter((item) => item.branch === selectedBranch)
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((item) => item.status === selectedStatus)
    }

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue)
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
        }

        return 0
      })
    }

    return filtered
  }, [items, searchQuery, selectedBranch, selectedStatus, sortConfig])

  const handleSort = (key: keyof InventoryItem) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        }
      }
      return { key, direction: 'asc' }
    })
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Items</CardTitle>
        <CardDescription>{filteredAndSortedItems.length} items found</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSort('name')}
                >
                  Item Name
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSort('sku')}
                >
                  SKU
                </TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:bg-muted"
                  onClick={() => handleSort('quantity')}
                >
                  Quantity
                </TableHead>
                <TableHead>Reorder Level</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSort('expiryDate')}
                >
                  Expiry Date
                </TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No items found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.sku}</TableCell>
                    <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                    <TableCell className="text-sm">{item.reorderLevel}</TableCell>
                    <TableCell className="text-sm">{formatDate(item.expiryDate)}</TableCell>
                    <TableCell className="text-sm">{item.supplier}</TableCell>
                    <TableCell className="text-sm">{item.branch}</TableCell>
                    <TableCell>
                      <span className={`status-badge ${statusConfig[item.status]?.color}`}>
                        {statusConfig[item.status]?.label}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
