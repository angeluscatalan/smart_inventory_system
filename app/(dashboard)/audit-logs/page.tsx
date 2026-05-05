'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { mockActivities } from '@/lib/mock-data'
import { useAuth } from '@/lib/auth-context'

const actionTypeColors = {
  Restocked: 'bg-status-normal/10 text-status-normal',
  Transferred: 'bg-primary/10 text-primary',
  Removed: 'bg-status-critical/10 text-status-critical',
  Created: 'bg-blue-50 text-blue-700',
  Updated: 'bg-yellow-50 text-yellow-700',
}

export default function AuditLogsPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/')
    }
  }, [user, router])

  if (!user || user.role !== 'admin') return null

  const [searchUser, setSearchUser] = useState('')
  const [filterAction, setFilterAction] = useState('all')

  const filteredActivities = mockActivities.filter(activity => {
    const userMatch = searchUser === '' || activity.user.toLowerCase().includes(searchUser.toLowerCase())
    const actionMatch = filterAction === 'all' || activity.action === filterAction
    return userMatch && actionMatch
  })

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const uniqueActions = [...new Set(mockActivities.map(a => a.action))]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">View all system activities and user actions</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium block mb-2">Search by User</label>
              <Input
                placeholder="Enter user name..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
              />
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium block mb-2">Filter by Action</label>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {uniqueActions.map(action => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground">Total Activities</p>
          <p className="text-2xl font-bold text-foreground mt-1">{mockActivities.length}</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground">Last 24 Hours</p>
          <p className="text-2xl font-bold text-foreground mt-1">5</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground">Last Week</p>
          <p className="text-2xl font-bold text-foreground mt-1">18</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground">Active Users</p>
          <p className="text-2xl font-bold text-foreground mt-1">4</p>
        </div>
      </div>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>{filteredActivities.length} records found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Item/Subject</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Date & Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No activities found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium">{activity.user}</TableCell>
                      <TableCell>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${actionTypeColors[activity.action as keyof typeof actionTypeColors] || 'bg-gray-50 text-gray-700'
                          }`}>
                          {activity.action}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{activity.item || '-'}</TableCell>
                      <TableCell className="text-sm">{activity.branch}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{activity.details}</TableCell>
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
    </div>
  )
}
