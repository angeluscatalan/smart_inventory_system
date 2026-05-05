export type UserRole = 'admin' | 'branch-manager' | 'staff'

export interface InventoryItem {
  id: string
  name: string
  sku: string
  quantity: number
  price: number
  reorderLevel: number
  expiryDate: Date
  supplier: string
  branch: string
  status: 'normal' | 'low-stock' | 'expiring' | 'expired'
  lastRestocked: Date
}

export interface Branch {
  id: string
  name: string
  address: string
  city: string
  manager: string
  contact: string
  email: string
  status: 'active' | 'inactive'
}

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'branch-manager' | 'staff'
  assignedBranch: string
  status: 'active' | 'inactive'
  lastLogin: Date
}

export interface Activity {
  id: string
  user: string
  action: string
  item?: string
  branch: string
  timestamp: Date
  details?: string
}

export interface StockAdjustment {
  id: string
  itemId: string
  itemName: string
  type: 'add' | 'remove' | 'transfer'
  quantity: number
  fromBranch?: string
  toBranch?: string
  reason: string
  user: string
  timestamp: Date
}

export interface Alert {
  id: string
  type: 'low-stock' | 'expiring' | 'expired' | 'system'
  item?: string
  branch?: string
  message: string
  severity: 'info' | 'warning' | 'critical'
  timestamp: Date
  read: boolean
}
