'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const data = [
  { week: 'Week 1', inbound: 450, outbound: 380, net: 70 },
  { week: 'Week 2', inbound: 520, outbound: 420, net: 100 },
  { week: 'Week 3', inbound: 380, outbound: 510, net: -130 },
  { week: 'Week 4', inbound: 610, outbound: 480, net: 130 },
  { week: 'Week 5', inbound: 720, outbound: 590, net: 130 },
  { week: 'Week 6', inbound: 580, outbound: 510, net: 70 },
]

export function StockMovementChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Movement (6 Weeks)</CardTitle>
        <CardDescription>Items in and out by week</CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}
