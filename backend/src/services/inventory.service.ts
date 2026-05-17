import { prisma } from '../lib/prisma'
import { ItemStatus } from '@prisma/client'

export interface InventoryFilters {
  branchId?: string
  status?: ItemStatus
  searchQuery?: string
}

export interface InventoryByBranchResult {
  branch: string
  items: number
  value: number
}

export interface ExpirationTimelinePeriod {
  period: string
  count: number
  critical: number
}

/**
 * Retrieve inventory items with optional filters.
 * If the user is a branch-manager, scope results to their assigned branch
 * (branch-managers do not have canAccessAllBranches permission).
 */
export async function getInventoryItems(
  filters: InventoryFilters,
  userRole: string,
  userBranch: string,
) {
  const where: Record<string, unknown> = {}

  // Branch-manager scoping: always restrict to their own branch
  if (userRole === 'branch-manager' || userRole === 'branch_manager') {
    where.branch = userBranch
  } else if (filters.branchId) {
    // Admin/staff can filter by a specific branch
    where.branch = filters.branchId
  }

  if (filters.status) {
    where.status = filters.status
  }

  if (filters.searchQuery) {
    where.OR = [
      { name: { contains: filters.searchQuery } },
      { sku: { contains: filters.searchQuery } },
    ]
  }

  return prisma.inventoryItem.findMany({ where })
}

/**
 * Aggregate inventory quantity (items count) and value (price * quantity) per branch.
 */
export async function getInventoryByBranch(): Promise<InventoryByBranchResult[]> {
  const items = await prisma.inventoryItem.findMany({
    select: {
      branch: true,
      quantity: true,
      price: true,
    },
  })

  const branchMap = new Map<string, { items: number; value: number }>()

  for (const item of items) {
    const existing = branchMap.get(item.branch) ?? { items: 0, value: 0 }
    branchMap.set(item.branch, {
      items: existing.items + item.quantity,
      value: existing.value + item.price * item.quantity,
    })
  }

  return Array.from(branchMap.entries()).map(([branch, agg]) => ({
    branch,
    items: agg.items,
    value: agg.value,
  }))
}

/**
 * Bucket inventory items into expiration time periods.
 * Each item appears in exactly one bucket based on days until expiry from today.
 *
 * Buckets:
 *   "Within 7 days"  — expiryDate between now and now+7 days
 *   "Within 30 days" — expiryDate between now+7 days and now+30 days
 *   "Within 90 days" — expiryDate between now+30 days and now+90 days
 *
 * critical = items with status 'expired' or 'expiring'
 */
export async function getExpirationTimeline(): Promise<ExpirationTimelinePeriod[]> {
  const now = new Date()
  const day7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const day30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const day90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

  const [within7, within30, within90] = await Promise.all([
    prisma.inventoryItem.findMany({
      where: {
        expiryDate: {
          gte: now,
          lt: day7,
        },
      },
      select: { status: true },
    }),
    prisma.inventoryItem.findMany({
      where: {
        expiryDate: {
          gte: day7,
          lt: day30,
        },
      },
      select: { status: true },
    }),
    prisma.inventoryItem.findMany({
      where: {
        expiryDate: {
          gte: day30,
          lt: day90,
        },
      },
      select: { status: true },
    }),
  ])

  const isCritical = (status: ItemStatus) =>
    status === ItemStatus.expired || status === ItemStatus.expiring

  return [
    {
      period: 'Within 7 days',
      count: within7.length,
      critical: within7.filter((i) => isCritical(i.status)).length,
    },
    {
      period: 'Within 30 days',
      count: within30.length,
      critical: within30.filter((i) => isCritical(i.status)).length,
    },
    {
      period: 'Within 90 days',
      count: within90.length,
      critical: within90.filter((i) => isCritical(i.status)).length,
    },
  ]
}
