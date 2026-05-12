'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BranchTable } from '@/components/branches/branch-table'
import { fetchBranches } from '@/lib/api/branches'
import { useAuth } from '@/lib/auth-context'
import type { Branch } from '@/lib/types'

export default function BranchesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/')
    }
  }, [user, router])

  useEffect(() => {
    setIsLoading(true)
    fetchBranches()
      .then((data) => {
        setBranches(data)
      })
      .catch(() => {
        setError(true)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  if (!user || user.role !== 'admin') return null

  const handleAddBranch = (): void => {
    // TODO: open add-branch modal
  }

  const totalBranches = branches.length
  const activeBranches = branches.filter(b => b.status === 'active').length
  const inactiveBranches = branches.filter(b => b.status === 'inactive').length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Branch Management</h1>
          <p className="text-muted-foreground mt-1">View and manage all branch locations</p>
        </div>
        <Button size="sm" onClick={handleAddBranch}>
          <Plus className="w-4 h-4 mr-2" />
          Add Branch
        </Button>
      </div>

      {/* Branch Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-sm font-medium text-muted-foreground">Total Branches</p>
          <p className="text-3xl font-bold text-foreground mt-2">{totalBranches}</p>
        </div>
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-sm font-medium text-muted-foreground">Active Branches</p>
          <p className="text-3xl font-bold text-foreground mt-2">{activeBranches}</p>
        </div>
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-sm font-medium text-muted-foreground">Inactive Branches</p>
          <p className="text-3xl font-bold text-foreground mt-2">{inactiveBranches}</p>
        </div>
      </div>

      {/* Table */}
      <BranchTable branches={branches} />
    </div>
  )
}
