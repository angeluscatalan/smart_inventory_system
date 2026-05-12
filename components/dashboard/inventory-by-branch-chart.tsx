'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { fetchInventoryByBranch } from '@/lib/api/inventory'
import type { InventoryByBranchDataPoint } from '@/lib/types'

export function InventoryByBranchChart() {
  const [data, setData] = useState<InventoryByBranchDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInventoryByBranch()
      .then((result) => {
        setData(result)
      })
      .catch(() => {
        setError('Failed to load chart data. Please try again.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory by Branch</CardTitle>
        <CardDescription>Total items and value per location</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : error ? (
          <p className="text-destructive text-sm">{error}</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="branch" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: `1px solid var(--border)`,
                  borderRadius: '0.5rem',
                }}
                labelStyle={{ color: 'var(--foreground)' }}
              />
              <Legend wrapperStyle={{ color: 'var(--foreground)' }} />
              <Bar dataKey="items" fill="var(--chart-1)" name="Items (Count)" />
              <Bar dataKey="value" fill="var(--chart-2)" name="Value (₱100s)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
