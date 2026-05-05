'use client'

import { useState } from 'react'
import { Download, Filter, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { mockInventoryItems, mockBranches } from '@/lib/mock-data'

export default function ReportsPage() {
  const [reportType, setReportType] = useState('inventory')
  const [selectedBranch, setSelectedBranch] = useState('all')

  // Calculate some report metrics
  const totalValue = mockInventoryItems.reduce((sum, item) => sum + (item.quantity * 150), 0)
  const lowStockValue = mockInventoryItems
    .filter(i => i.status === 'low-stock')
    .reduce((sum, item) => sum + (item.quantity * 150), 0)
  const expiringValue = mockInventoryItems
    .filter(i => i.status === 'expiring')
    .reduce((sum, item) => sum + (item.quantity * 150), 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground mt-1">Generate and export inventory reports</p>
      </div>

      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium block mb-2">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inventory">Inventory Report</SelectItem>
                  <SelectItem value="movement">Stock Movement</SelectItem>
                  <SelectItem value="expiring">Expiring Products</SelectItem>
                  <SelectItem value="branch">Branch Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Branch</label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {mockBranches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Start Date</label>
              <Input type="date" />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">End Date</label>
              <Input type="date" />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button>
              <Filter className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export to Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${(totalValue / 1000).toFixed(1)}K</p>
            <p className="text-xs text-muted-foreground mt-1">All items combined</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-status-warning">${(lowStockValue / 1000).toFixed(1)}K</p>
            <p className="text-xs text-muted-foreground mt-1">Needs reordering</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">At Risk Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-status-critical">${(expiringValue / 1000).toFixed(1)}K</p>
            <p className="text-xs text-muted-foreground mt-1">Expiring soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Sample Report Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Report Preview</CardTitle>
          <CardDescription>Sample data from current filters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Estimated Value</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockInventoryItems.slice(0, 5).map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-sm">{item.sku}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${(item.quantity * 150).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span className={`status-badge ${
                        item.status === 'normal' ? 'status-normal' :
                        item.status === 'low-stock' ? 'status-warning' :
                        'status-critical'
                      }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
