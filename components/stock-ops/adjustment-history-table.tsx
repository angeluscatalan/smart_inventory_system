import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { mockStockAdjustments } from '@/lib/mock-data'

const typeConfig = {
  add: 'Added',
  remove: 'Removed',
  transfer: 'Transferred',
}

export function AdjustmentHistoryTable() {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adjustment History</CardTitle>
        <CardDescription>Recent stock adjustments and transfers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockStockAdjustments.map((adj) => (
                <TableRow key={adj.id}>
                  <TableCell className="font-medium">{adj.itemName}</TableCell>
                  <TableCell>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      adj.type === 'add' ? 'bg-status-normal/10 text-status-normal' :
                      adj.type === 'remove' ? 'bg-status-critical/10 text-status-critical' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {typeConfig[adj.type]}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">{adj.quantity}</TableCell>
                  <TableCell className="text-sm">
                    {adj.type === 'transfer' 
                      ? `${adj.fromBranch} → ${adj.toBranch}`
                      : adj.fromBranch
                    }
                  </TableCell>
                  <TableCell className="text-sm">{adj.user}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{adj.reason}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(adj.timestamp)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
