'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { mockInventoryItems, mockBranches } from '@/lib/mock-data'
import { useAuth } from '@/lib/auth-context'
import { canTransferStock as checkCanTransfer, canAccessAllBranches } from '@/lib/permissions'

interface StockAdjustmentFormProps {
  onSubmit?: (data: any) => void
}

export function StockAdjustmentForm({ onSubmit }: StockAdjustmentFormProps) {
  const { user } = useAuth()
  const userCanTransfer = user?.role ? checkCanTransfer(user.role) : false
  const isAdmin = user?.role ? canAccessAllBranches(user.role) : false

  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove' | 'transfer'>('add')
  const [selectedItem, setSelectedItem] = useState('')
  const [quantity, setQuantity] = useState('')
  const [fromBranch, setFromBranch] = useState(isAdmin ? '' : (user?.branch || ''))
  const [toBranch, setToBranch] = useState('')
  const [reason, setReason] = useState('')

  // Filter items based on user branch
  const availableItems = isAdmin
    ? mockInventoryItems
    : mockInventoryItems.filter((item) => item.branch === user?.branch)

  const adjustmentTypes = userCanTransfer
    ? (['add', 'remove', 'transfer'] as const)
    : (['add', 'remove'] as const)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedItem || !quantity || !reason) {
      alert('Please fill in all required fields')
      return
    }

    if (adjustmentType === 'transfer' && (!fromBranch || !toBranch)) {
      alert('Please select both source and destination branches')
      return
    }

    if (adjustmentType !== 'transfer' && !fromBranch) {
      alert('Please select a branch')
      return
    }

    const formData = {
      adjustmentType,
      selectedItem,
      quantity: parseInt(quantity),
      fromBranch: adjustmentType === 'transfer' ? fromBranch : fromBranch,
      toBranch: adjustmentType === 'transfer' ? toBranch : undefined,
      reason,
    }

    onSubmit?.(formData)
    resetForm()
  }

  const resetForm = () => {
    setAdjustmentType('add')
    setSelectedItem('')
    setQuantity('')
    setFromBranch(isAdmin ? '' : (user?.branch || ''))
    setToBranch('')
    setReason('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Adjustment</CardTitle>
        <CardDescription>
          {userCanTransfer
            ? 'Add, remove, or transfer inventory items'
            : 'Add or remove inventory items'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Adjustment Type */}
          <div>
            <label className="text-sm font-medium">Adjustment Type</label>
            <div className={`grid gap-3 mt-2 ${userCanTransfer ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {adjustmentTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAdjustmentType(type)}
                  className={`p-3 rounded-lg border-2 transition-colors capitalize ${adjustmentType === type
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Item Selection */}
          <div>
            <label className="text-sm font-medium block mb-2">Select Item *</label>
            <Select value={selectedItem} onValueChange={setSelectedItem}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an item..." />
              </SelectTrigger>
              <SelectContent>
                {availableItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} ({item.sku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div>
            <label className="text-sm font-medium block mb-2">Quantity *</label>
            <Input
              type="number"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
            />
          </div>

          {/* Branch Selection - Only for admin */}
          {adjustmentType !== 'transfer' && (
            <div>
              <label className="text-sm font-medium block mb-2">Branch *</label>
              {isAdmin ? (
                <Select value={fromBranch} onValueChange={setFromBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockBranches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.name}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={user?.branch || ''} disabled className="bg-muted" />
              )}
            </div>
          )}

          {/* Transfer Branches */}
          {adjustmentType === 'transfer' && (
            <>
              <div>
                <label className="text-sm font-medium block mb-2">From Branch *</label>
                {isAdmin ? (
                  <Select value={fromBranch} onValueChange={setFromBranch}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source branch..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockBranches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.name}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={user?.branch || ''} disabled className="bg-muted" />
                )}
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">To Branch *</label>
                <Select value={toBranch} onValueChange={setToBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination branch..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockBranches
                      .filter((branch) => branch.name !== (isAdmin ? fromBranch : user?.branch))
                      .map((branch) => (
                        <SelectItem key={branch.id} value={branch.name}>
                          {branch.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Reason */}
          <div>
            <label className="text-sm font-medium block mb-2">Reason *</label>
            <Textarea
              placeholder="Enter reason for adjustment..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button type="submit" className="flex-1">
              Submit Adjustment
            </Button>
            <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
