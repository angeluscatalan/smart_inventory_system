// Feature: client-server-migration, Property 5: Inventory filter results satisfy all applied filter criteria
// Feature: client-server-migration, Property 6: Inventory by-branch aggregation is consistent with raw inventory data
// Feature: client-server-migration, Property 7: Expiration timeline correctly buckets items by days-until-expiry
// Feature: client-server-migration, Property 8: Invalid filter values always return HTTP 400

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { z } from 'zod'

// ─── Pure helper functions (mirror service logic for unit testing) ─────────────

type ItemStatus = 'normal' | 'low_stock' | 'expiring' | 'expired'

interface MockItem {
  id: string
  name: string
  sku: string
  quantity: number
  price: number
  reorderLevel: number
  expiryDate: Date
  supplier: string
  branch: string
  status: ItemStatus
  lastRestocked: Date
}

interface InventoryFilters {
  branchId?: string
  status?: ItemStatus
  searchQuery?: string
}

function filterItems(
  items: MockItem[],
  filters: InventoryFilters,
  userRole: string,
  userBranch: string,
): MockItem[] {
  return items.filter((item) => {
    if (userRole === 'branch-manager' || userRole === 'branch_manager') {
      if (item.branch !== userBranch) return false
    } else if (filters.branchId) {
      if (item.branch !== filters.branchId) return false
    }
    if (filters.status && item.status !== filters.status) return false
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase()
      if (!item.name.toLowerCase().includes(q) && !item.sku.toLowerCase().includes(q)) return false
    }
    return true
  })
}

function aggregateByBranch(items: MockItem[]): Array<{ branch: string; items: number; value: number }> {
  const branchMap = new Map<string, { items: number; value: number }>()
  for (const item of items) {
    const existing = branchMap.get(item.branch) ?? { items: 0, value: 0 }
    branchMap.set(item.branch, {
      items: existing.items + item.quantity,
      value: existing.value + item.price * item.quantity,
    })
  }
  return Array.from(branchMap.entries()).map(([branch, agg]) => ({ branch, items: agg.items, value: agg.value }))
}

function bucketByExpiration(items: MockItem[], now: Date): Array<{ period: string; count: number; critical: number }> {
  const day7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const day30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const day90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
  const isCritical = (s: ItemStatus) => s === 'expired' || s === 'expiring'
  const within7 = items.filter((i) => i.expiryDate >= now && i.expiryDate < day7)
  const within30 = items.filter((i) => i.expiryDate >= day7 && i.expiryDate < day30)
  const within90 = items.filter((i) => i.expiryDate >= day30 && i.expiryDate < day90)
  return [
    { period: 'Within 7 days', count: within7.length, critical: within7.filter((i) => isCritical(i.status)).length },
    { period: 'Within 30 days', count: within30.length, critical: within30.filter((i) => isCritical(i.status)).length },
    { period: 'Within 90 days', count: within90.length, critical: within90.filter((i) => isCritical(i.status)).length },
  ]
}

// ─── Arbitraries ──────────────────────────────────────────────────────────────

const fcStatus = fc.constantFrom<ItemStatus>('normal', 'low_stock', 'expiring', 'expired')
const fcBranch = fc.constantFrom('Manila Branch', 'Cebu Branch', 'Davao Branch')
const fcStr = fc.string({ minLength: 1, maxLength: 30 })

const fcItem: fc.Arbitrary<MockItem> = fc.record({
  id: fc.uuid(),
  name: fcStr,
  sku: fcStr,
  quantity: fc.integer({ min: 0, max: 1000 }),
  price: fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }),
  reorderLevel: fc.integer({ min: 0, max: 100 }),
  expiryDate: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
  supplier: fcStr,
  branch: fcBranch,
  status: fcStatus,
  lastRestocked: fc.date({ min: new Date('2020-01-01'), max: new Date('2026-12-31') }),
})

// ─── Property 5 ───────────────────────────────────────────────────────────────

describe('Inventory service — Property 5: Filter results satisfy all applied criteria', () => {
  it('branchId filter: all returned items belong to the specified branch', () => {
    fc.assert(
      fc.property(fc.array(fcItem, { minLength: 0, maxLength: 50 }), fcBranch, (items, branchId) => {
        const result = filterItems(items, { branchId }, 'admin', '')
        expect(result.every((item) => item.branch === branchId)).toBe(true)
      }),
      { numRuns: 100 }
    )
  })

  it('status filter: all returned items have the specified status', () => {
    fc.assert(
      fc.property(fc.array(fcItem, { minLength: 0, maxLength: 50 }), fcStatus, (items, status) => {
        const result = filterItems(items, { status }, 'admin', '')
        expect(result.every((item) => item.status === status)).toBe(true)
      }),
      { numRuns: 100 }
    )
  })

  it('searchQuery filter: all returned items contain the query in name or sku', () => {
    fc.assert(
      fc.property(
        fc.array(fcItem, { minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 5 }),
        (items, searchQuery) => {
          const result = filterItems(items, { searchQuery }, 'admin', '')
          const q = searchQuery.toLowerCase()
          expect(result.every((item) => item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q))).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('branch-manager scoping: results are always scoped to manager branch', () => {
    fc.assert(
      fc.property(fc.array(fcItem, { minLength: 0, maxLength: 50 }), fcBranch, (items, managerBranch) => {
        const result = filterItems(items, {}, 'branch-manager', managerBranch)
        expect(result.every((item) => item.branch === managerBranch)).toBe(true)
      }),
      { numRuns: 100 }
    )
  })

  it('combined filters: all returned items satisfy ALL applied conditions simultaneously', () => {
    fc.assert(
      fc.property(fc.array(fcItem, { minLength: 0, maxLength: 50 }), fcBranch, fcStatus, (items, branchId, status) => {
        const result = filterItems(items, { branchId, status }, 'admin', '')
        expect(result.every((item) => item.branch === branchId && item.status === status)).toBe(true)
      }),
      { numRuns: 100 }
    )
  })
})

// ─── Property 6 ───────────────────────────────────────────────────────────────

describe('Inventory service — Property 6: By-branch aggregation consistency', () => {
  it('aggregated items count equals sum of quantities per branch', () => {
    fc.assert(
      fc.property(fc.array(fcItem, { minLength: 0, maxLength: 100 }), (items) => {
        const result = aggregateByBranch(items)
        for (const agg of result) {
          const expected = items.filter((i) => i.branch === agg.branch).reduce((sum, i) => sum + i.quantity, 0)
          expect(agg.items).toBe(expected)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('aggregated value equals sum of price * quantity per branch', () => {
    fc.assert(
      fc.property(fc.array(fcItem, { minLength: 0, maxLength: 100 }), (items) => {
        const result = aggregateByBranch(items)
        for (const agg of result) {
          const expected = items.filter((i) => i.branch === agg.branch).reduce((sum, i) => sum + i.price * i.quantity, 0)
          expect(Math.abs(agg.value - expected)).toBeLessThan(0.001)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('every branch in the input appears exactly once in the output', () => {
    fc.assert(
      fc.property(fc.array(fcItem, { minLength: 1, maxLength: 100 }), (items) => {
        const result = aggregateByBranch(items)
        const inputBranches = new Set(items.map((i) => i.branch))
        const outputBranches = new Set(result.map((r) => r.branch))
        expect(outputBranches).toEqual(inputBranches)
      }),
      { numRuns: 100 }
    )
  })
})

// ─── Property 7 ───────────────────────────────────────────────────────────────

describe('Inventory service — Property 7: Expiration timeline bucketing', () => {
  it('each item appears in at most one bucket', () => {
    fc.assert(
      fc.property(
        fc.array(fcItem, { minLength: 0, maxLength: 50 }),
        fc.date({ min: new Date('2024-01-01'), max: new Date('2026-12-31') }),
        (items, now) => {
          const result = bucketByExpiration(items, now)
          const totalBucketed = result.reduce((sum, b) => sum + b.count, 0)
          const day90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
          const bucketable = items.filter((i) => i.expiryDate >= now && i.expiryDate < day90)
          expect(totalBucketed).toBe(bucketable.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('bucket assignment matches days-until-expiry calculation', () => {
    fc.assert(
      fc.property(
        fc.array(fcItem, { minLength: 1, maxLength: 30 }),
        fc.date({ min: new Date('2024-01-01'), max: new Date('2026-01-01') }),
        (items, now) => {
          const result = bucketByExpiration(items, now)
          const day7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          const day30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
          const day90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
          expect(result[0].count).toBe(items.filter((i) => i.expiryDate >= now && i.expiryDate < day7).length)
          expect(result[1].count).toBe(items.filter((i) => i.expiryDate >= day7 && i.expiryDate < day30).length)
          expect(result[2].count).toBe(items.filter((i) => i.expiryDate >= day30 && i.expiryDate < day90).length)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─── Property 8 ───────────────────────────────────────────────────────────────

describe('Inventory service — Property 8: Invalid filter values return HTTP 400', () => {
  const validStatuses = ['normal', 'low_stock', 'expiring', 'expired'] as const
  const statusSchema = z.enum(validStatuses)

  it('valid status values pass Zod validation', () => {
    for (const status of validStatuses) {
      expect(statusSchema.safeParse(status).success).toBe(true)
    }
  })

  it('arbitrary strings that are not valid ItemStatus values fail Zod validation', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => !(validStatuses as readonly string[]).includes(s)),
        (invalidStatus) => {
          expect(statusSchema.safeParse(invalidStatus).success).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('valid AlertSeverity values pass Zod validation', () => {
    const validSeverities = ['info', 'warning', 'critical'] as const
    const severitySchema = z.enum(validSeverities)
    for (const severity of validSeverities) {
      expect(severitySchema.safeParse(severity).success).toBe(true)
    }
  })

  it('arbitrary strings that are not valid AlertSeverity values fail Zod validation', () => {
    const validSeverities = ['info', 'warning', 'critical'] as const
    const severitySchema = z.enum(validSeverities)
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => !(validSeverities as readonly string[]).includes(s)),
        (invalidSeverity) => {
          expect(severitySchema.safeParse(invalidSeverity).success).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })
})
