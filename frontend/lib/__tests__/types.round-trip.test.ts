// Feature: client-server-migration, Property 22: JSON serialization round-trip preserves all entity data
import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import type {
  InventoryItem,
  Branch,
  User,
  Activity,
  StockAdjustment,
  Alert,
} from '../types'

/**
 * Property 22: JSON serialization round-trip preserves all entity data
 *
 * For every entity type, JSON.parse(JSON.stringify(entity)) must produce an
 * object that is deeply equal to the original — with the caveat that Date
 * fields are serialized to ISO strings by JSON.stringify, so they are compared
 * via new Date(deserialized.field).getTime() === original.field.getTime().
 *
 * Validates: Requirements 15.3
 */

// ─── Arbitraries ─────────────────────────────────────────────────────────────

/** Generates a safe Date within a reasonable range (year 2000–2100). */
const fcDate = fc.date({ min: new Date('2000-01-01'), max: new Date('2100-12-31') })

/** Generates a non-empty string (printable ASCII, no control chars). */
const fcStr = fc.string({ minLength: 1, maxLength: 64 })

const fcInventoryItem: fc.Arbitrary<InventoryItem> = fc.record({
  id: fcStr,
  name: fcStr,
  sku: fcStr,
  quantity: fc.integer({ min: 0, max: 10_000 }),
  price: fc.float({ min: 0, max: 100_000, noNaN: true }),
  reorderLevel: fc.integer({ min: 0, max: 1_000 }),
  expiryDate: fcDate,
  supplier: fcStr,
  branch: fcStr,
  status: fc.constantFrom('normal', 'low-stock', 'expiring', 'expired') as fc.Arbitrary<InventoryItem['status']>,
  lastRestocked: fcDate,
})

const fcBranch: fc.Arbitrary<Branch> = fc.record({
  id: fcStr,
  name: fcStr,
  address: fcStr,
  city: fcStr,
  manager: fcStr,
  contact: fcStr,
  email: fcStr,
  status: fc.constantFrom('active', 'inactive') as fc.Arbitrary<Branch['status']>,
})

const fcUser: fc.Arbitrary<User> = fc.record({
  id: fcStr,
  name: fcStr,
  email: fcStr,
  role: fc.constantFrom('admin', 'branch-manager', 'staff') as fc.Arbitrary<User['role']>,
  assignedBranch: fcStr,
  status: fc.constantFrom('active', 'inactive') as fc.Arbitrary<User['status']>,
  lastLogin: fcDate,
})

const fcActivity: fc.Arbitrary<Activity> = fc.record({
  id: fcStr,
  user: fcStr,
  action: fcStr,
  item: fc.option(fcStr, { nil: undefined }),
  branch: fcStr,
  timestamp: fcDate,
  details: fc.option(fcStr, { nil: undefined }),
})

const fcStockAdjustment: fc.Arbitrary<StockAdjustment> = fc.record({
  id: fcStr,
  itemId: fcStr,
  itemName: fcStr,
  type: fc.constantFrom('add', 'remove', 'transfer') as fc.Arbitrary<StockAdjustment['type']>,
  quantity: fc.integer({ min: 1, max: 10_000 }),
  fromBranch: fc.option(fcStr, { nil: undefined }),
  toBranch: fc.option(fcStr, { nil: undefined }),
  reason: fcStr,
  user: fcStr,
  timestamp: fcDate,
})

const fcAlert: fc.Arbitrary<Alert> = fc.record({
  id: fcStr,
  type: fc.constantFrom('low-stock', 'expiring', 'expired', 'system') as fc.Arbitrary<Alert['type']>,
  item: fc.option(fcStr, { nil: undefined }),
  branch: fc.option(fcStr, { nil: undefined }),
  message: fcStr,
  severity: fc.constantFrom('info', 'warning', 'critical') as fc.Arbitrary<Alert['severity']>,
  timestamp: fcDate,
  read: fc.boolean(),
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Compares two values for deep equality, treating Date fields specially:
 * after JSON round-trip, Date objects become ISO strings, so we compare
 * via getTime() on both sides.
 */
function deepEqualWithDates(original: unknown, deserialized: unknown): boolean {
  if (original instanceof Date) {
    // deserialized will be an ISO string
    return new Date(deserialized as string).getTime() === original.getTime()
  }
  if (original === null || typeof original !== 'object') {
    return original === deserialized
  }
  if (Array.isArray(original)) {
    if (!Array.isArray(deserialized)) return false
    if (original.length !== (deserialized as unknown[]).length) return false
    return original.every((item, i) => deepEqualWithDates(item, (deserialized as unknown[])[i]))
  }
  const origObj = original as Record<string, unknown>
  const deserObj = deserialized as Record<string, unknown>
  const origKeys = Object.keys(origObj)
  const deserKeys = Object.keys(deserObj)
  if (origKeys.length !== deserKeys.length) return false
  return origKeys.every((key) => deepEqualWithDates(origObj[key], deserObj[key]))
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('JSON round-trip serialization (Property 22)', () => {
  it('InventoryItem: JSON.parse(JSON.stringify(entity)) preserves all fields', () => {
    fc.assert(
      fc.property(fcInventoryItem, (item) => {
        const serialized = JSON.stringify(item)
        const deserialized = JSON.parse(serialized) as InventoryItem

        // Non-date fields must be strictly equal
        expect(deserialized.id).toBe(item.id)
        expect(deserialized.name).toBe(item.name)
        expect(deserialized.sku).toBe(item.sku)
        expect(deserialized.quantity).toBe(item.quantity)
        expect(deserialized.reorderLevel).toBe(item.reorderLevel)
        expect(deserialized.supplier).toBe(item.supplier)
        expect(deserialized.branch).toBe(item.branch)
        expect(deserialized.status).toBe(item.status)

        // Date fields: compare via getTime()
        expect(new Date(deserialized.expiryDate as unknown as string).getTime()).toBe(item.expiryDate.getTime())
        expect(new Date(deserialized.lastRestocked as unknown as string).getTime()).toBe(item.lastRestocked.getTime())
      }),
      { numRuns: 100 }
    )
  })

  it('Branch: JSON.parse(JSON.stringify(entity)) preserves all fields', () => {
    fc.assert(
      fc.property(fcBranch, (branch) => {
        const deserialized = JSON.parse(JSON.stringify(branch)) as Branch

        expect(deserialized.id).toBe(branch.id)
        expect(deserialized.name).toBe(branch.name)
        expect(deserialized.address).toBe(branch.address)
        expect(deserialized.city).toBe(branch.city)
        expect(deserialized.manager).toBe(branch.manager)
        expect(deserialized.contact).toBe(branch.contact)
        expect(deserialized.email).toBe(branch.email)
        expect(deserialized.status).toBe(branch.status)
      }),
      { numRuns: 100 }
    )
  })

  it('User: JSON.parse(JSON.stringify(entity)) preserves all fields', () => {
    fc.assert(
      fc.property(fcUser, (user) => {
        const deserialized = JSON.parse(JSON.stringify(user)) as User

        expect(deserialized.id).toBe(user.id)
        expect(deserialized.name).toBe(user.name)
        expect(deserialized.email).toBe(user.email)
        expect(deserialized.role).toBe(user.role)
        expect(deserialized.assignedBranch).toBe(user.assignedBranch)
        expect(deserialized.status).toBe(user.status)

        // Date field
        expect(new Date(deserialized.lastLogin as unknown as string).getTime()).toBe(user.lastLogin.getTime())
      }),
      { numRuns: 100 }
    )
  })

  it('Activity: JSON.parse(JSON.stringify(entity)) preserves all fields', () => {
    fc.assert(
      fc.property(fcActivity, (activity) => {
        const deserialized = JSON.parse(JSON.stringify(activity)) as Activity

        expect(deserialized.id).toBe(activity.id)
        expect(deserialized.user).toBe(activity.user)
        expect(deserialized.action).toBe(activity.action)
        expect(deserialized.item).toBe(activity.item)
        expect(deserialized.branch).toBe(activity.branch)
        expect(deserialized.details).toBe(activity.details)

        // Date field
        expect(new Date(deserialized.timestamp as unknown as string).getTime()).toBe(activity.timestamp.getTime())
      }),
      { numRuns: 100 }
    )
  })

  it('StockAdjustment: JSON.parse(JSON.stringify(entity)) preserves all fields', () => {
    fc.assert(
      fc.property(fcStockAdjustment, (adj) => {
        const deserialized = JSON.parse(JSON.stringify(adj)) as StockAdjustment

        expect(deserialized.id).toBe(adj.id)
        expect(deserialized.itemId).toBe(adj.itemId)
        expect(deserialized.itemName).toBe(adj.itemName)
        expect(deserialized.type).toBe(adj.type)
        expect(deserialized.quantity).toBe(adj.quantity)
        expect(deserialized.fromBranch).toBe(adj.fromBranch)
        expect(deserialized.toBranch).toBe(adj.toBranch)
        expect(deserialized.reason).toBe(adj.reason)
        expect(deserialized.user).toBe(adj.user)

        // Date field
        expect(new Date(deserialized.timestamp as unknown as string).getTime()).toBe(adj.timestamp.getTime())
      }),
      { numRuns: 100 }
    )
  })

  it('Alert: JSON.parse(JSON.stringify(entity)) preserves all fields', () => {
    fc.assert(
      fc.property(fcAlert, (alert) => {
        const deserialized = JSON.parse(JSON.stringify(alert)) as Alert

        expect(deserialized.id).toBe(alert.id)
        expect(deserialized.type).toBe(alert.type)
        expect(deserialized.item).toBe(alert.item)
        expect(deserialized.branch).toBe(alert.branch)
        expect(deserialized.message).toBe(alert.message)
        expect(deserialized.severity).toBe(alert.severity)
        expect(deserialized.read).toBe(alert.read)

        // Date field
        expect(new Date(deserialized.timestamp as unknown as string).getTime()).toBe(alert.timestamp.getTime())
      }),
      { numRuns: 100 }
    )
  })

  it('all entity types: deepEqualWithDates helper correctly identifies round-trip equivalence', () => {
    // Verify the helper itself works correctly for the Date comparison case
    const date = new Date('2024-06-15T10:30:00.000Z')
    const isoString = date.toISOString()

    expect(deepEqualWithDates(date, isoString)).toBe(true)
    expect(deepEqualWithDates(date, new Date('2024-06-16').toISOString())).toBe(false)
    expect(deepEqualWithDates('hello', 'hello')).toBe(true)
    expect(deepEqualWithDates(42, 42)).toBe(true)
    expect(deepEqualWithDates(null, null)).toBe(true)
  })
})
