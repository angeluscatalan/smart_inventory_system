'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2, Mail, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { mockUsers } from '@/lib/mock-data'
import { useAuth } from '@/lib/auth-context'

const roleConfig = {
  admin: { label: 'Admin', color: 'bg-primary/10 text-primary' },
  'branch-manager': { label: 'Branch Manager', color: 'bg-blue-50 text-blue-700' },
  staff: { label: 'Staff', color: 'bg-gray-50 text-gray-700' },
}

export default function UserManagementPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/')
    }
  }, [user, router])

  if (!user || user.role !== 'admin') return null

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const activeUsers = mockUsers.filter(u => u.status === 'active').length
  const inactiveUsers = mockUsers.filter(u => u.status === 'inactive').length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage system users and permissions</p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-sm font-medium text-muted-foreground">Total Users</p>
          <p className="text-3xl font-bold text-foreground mt-2">{mockUsers.length}</p>
        </div>
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-sm font-medium text-muted-foreground">Active Users</p>
          <p className="text-3xl font-bold text-status-normal mt-2">{activeUsers}</p>
        </div>
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-sm font-medium text-muted-foreground">Inactive Users</p>
          <p className="text-3xl font-bold text-status-inactive mt-2">{inactiveUsers}</p>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>All system users and their roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Assigned Branch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers.map((user) => {
                  const role = roleConfig[user.role]
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          {user.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${role.color}`}>
                          {role.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{user.assignedBranch}</TableCell>
                      <TableCell>
                        <span className={`status-badge ${user.status === 'active' ? 'status-normal' : 'status-inactive'
                          }`}>
                          {user.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <LogIn className="w-4 h-4" />
                          {formatDate(user.lastLogin)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
