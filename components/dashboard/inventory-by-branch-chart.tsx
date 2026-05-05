'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const data = [
  { branch: 'Manila', items: 245, value: 18500 },
  { branch: 'Cebu', items: 189, value: 14200 },
  { branch: 'Davao', items: 156, value: 12800 },
]

export function InventoryByBranchChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory by Branch</CardTitle>
        <CardDescription>Total items and value per location</CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}
