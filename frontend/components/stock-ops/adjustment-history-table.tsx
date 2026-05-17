'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { fetchStockAdjustments } from '@/lib/api/stock-adjustments'
import type { StockAdjustment } from '@/lib/types'

const typeConfig = {
  add: 'Added',
  remove: 'Removed',
  transfer: 'Transferred',
}

export function AdjustmentHistoryTable() {
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchStockAdjustments()
      .then((data) => {
        setAdjustments(data)
      })
      .catch(() => {
        setError(true)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adjustment History</CardTitle>
        <CardDescription>Recent stock adjustments and transfers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adjustments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    {isLoading ? 'Loading...' : 'No adjustments found.'}
                  </TableCell>
                </TableRow>
              ) : (
                adjustments.map((adj) => (
                  <TableRow key={adj.id}>
                    <TableCell className="font-medium">{adj.itemName}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        adj.type === 'add' ? 'bg-status-normal/10 text-status-normal' :
                        adj.type === 'remove' ? 'bg-status-critical/10 text-status-critical' :
                        'bg-primary/10 text-primary'
                      }`}>
                        {typeConfig[adj.type]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">{adj.quantity}</TableCell>
                    <TableCell className="text-sm">
                      {adj.type === 'transfer'
                        ? `${adj.fromBranch} → ${adj.toBranch}`
                        : adj.fromBranch
                      }
                    </TableCell>
                    <TableCell className="text-sm">{adj.user}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{adj.reason}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(adj.timestamp)}
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
