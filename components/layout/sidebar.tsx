'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  GitBranch,
  Bell,
  BarChart3,
  Users,
  LogOut,
  ArrowLeftRight,
  FileText,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getPagePermissions, PagePermissions } from '@/lib/permissions'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permissionKey: keyof PagePermissions
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard, permissionKey: 'dashboard' },
  { label: 'Inventory', href: '/inventory', icon: Package, permissionKey: 'inventory' },
  { label: 'Stock Operations', href: '/stock-operations', icon: ArrowLeftRight, permissionKey: 'stockOperations' },
  { label: 'Branches', href: '/branches', icon: GitBranch, permissionKey: 'branches' },
  { label: 'Notifications', href: '/notifications', icon: Bell, permissionKey: 'notifications' },
  { label: 'Reports', href: '/reports', icon: BarChart3, permissionKey: 'reports' },
  { label: 'User Management', href: '/user-management', icon: Users, permissionKey: 'userManagement' },
  { label: 'Audit Logs', href: '/audit-logs', icon: FileText, permissionKey: 'auditLogs' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const userRole = user?.role || 'staff'
  const permissions = getPagePermissions(userRole)

  const visibleItems = navItems.filter((item) => permissions[item.permissionKey])

  return (
    <div className="dashboard-sidebar">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">InvSys PH</h1>
        <p className="text-xs text-sidebar-foreground/60 mt-1">Smart Inventory System</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 space-y-2 border-t border-sidebar-border">
        {user && (
          <div className="px-4 py-2 mb-2">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.fullName}</p>
            <p className="text-xs text-sidebar-foreground/60 capitalize">{user.role.replace('-', ' ')}</p>
            {user.branch !== 'all' && (
              <p className="text-xs text-sidebar-foreground/50">{user.branch}</p>
            )}
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}
