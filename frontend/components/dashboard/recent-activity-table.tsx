'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { fetchActivities } from '@/lib/api/activities'
import type { Activity } from '@/lib/types'

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function RecentActivityTable() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchActivities()
      .then((data) => {
        setActivities(data)
      })
      .catch(() => {
        setError(true)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const recentActivities = activities.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest inventory updates and transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No activities found
                  </TableCell>
                </TableRow>
              ) : (
                recentActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.item || '-'}</TableCell>
                    <TableCell>{activity.action}</TableCell>
                    <TableCell className="text-sm">{activity.branch}</TableCell>
                    <TableCell className="text-sm">{activity.user}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(activity.timestamp)}
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
