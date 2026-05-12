'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { fetchExpirationTimeline } from '@/lib/api/inventory'
import type { ExpirationTimelineDataPoint } from '@/lib/types'

export function ExpiringProductsTimeline() {
  const [data, setData] = useState<ExpirationTimelineDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchExpirationTimeline()
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
        <CardTitle>Product Expiration Timeline</CardTitle>
        <CardDescription>Items by expiration window</CardDescription>
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
              <XAxis dataKey="period" stroke="var(--muted-foreground)" />
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
              <Bar dataKey="count" fill="var(--chart-2)" name="Total Items" />
              <Bar dataKey="critical" fill="var(--status-critical)" name="Critical" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
