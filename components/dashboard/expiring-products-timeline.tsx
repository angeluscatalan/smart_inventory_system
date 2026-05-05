'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const data = [
  { period: 'Next 7 Days', count: 12, critical: 3 },
  { period: '8-14 Days', count: 8, critical: 1 },
  { period: '15-30 Days', count: 24, critical: 0 },
  { period: '31-60 Days', count: 45, critical: 0 },
  { period: '60+ Days', count: 156, critical: 0 },
]

export function ExpiringProductsTimeline() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Expiration Timeline</CardTitle>
        <CardDescription>Items by expiration window</CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}
