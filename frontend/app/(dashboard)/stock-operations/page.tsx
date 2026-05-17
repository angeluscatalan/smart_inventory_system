'use client'

import { StockAdjustmentForm } from '@/components/stock-ops/stock-adjustment-form'
import { AdjustmentHistoryTable } from '@/components/stock-ops/adjustment-history-table'
import { useAuth } from '@/lib/auth-context'
import { canTransferStock } from '@/lib/permissions'
import type { StockAdjustmentPayload } from '@/lib/types'

export default function StockOperationsPage() {
  const { user } = useAuth()
  const userCanTransfer = user?.role ? canTransferStock(user.role) : false

  const handleStockAdjustmentSubmit = (payload: StockAdjustmentPayload): void => {
    // TODO: replace with API call
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Stock Operations</h1>
        <p className="text-muted-foreground mt-1">
          {userCanTransfer
            ? 'Add, remove, or transfer inventory items'
            : 'Add or remove inventory items'}
        </p>
      </div>

      {/* Form and History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <StockAdjustmentForm onSubmit={handleStockAdjustmentSubmit} />
        </div>
        <div className="lg:col-span-2">
          <AdjustmentHistoryTable />
        </div>
      </div>
    </div>
  )
}
