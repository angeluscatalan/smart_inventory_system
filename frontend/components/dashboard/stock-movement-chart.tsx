'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { fetchStockMovementData } from '@/lib/api/stock-adjustments'
import type { StockMovementDataPoint } from '@/lib/types'

export function StockMovementChart() {
  const [data, setData] = useState<StockMovementDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStockMovementData()
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
        <CardTitle>Stock Movement (6 Weeks)</CardTitle>
        <CardDescription>Items in and out by week</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : error !== null ? (
          <p className="text-destructive text-sm">{error}</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="week" stroke="var(--muted-foreground)" />
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
              <Line
                type="monotone"
                dataKey="inbound"
                stroke="var(--chart-1)"
                strokeWidth={2}
                name="Inbound"
                dot={{ fill: 'var(--chart-1)' }}
              />
              <Line
                type="monotone"
                dataKey="outbound"
                stroke="var(--chart-3)"
                strokeWidth={2}
                name="Outbound"
                dot={{ fill: 'var(--chart-3)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
