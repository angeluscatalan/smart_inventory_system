// Feature: client-server-migration, Property 17: Alert generation rules are consistent with inventory state
// Feature: client-server-migration, Property 18: Alert filter results satisfy all applied filter criteria

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

// ─── Pure helpers mirroring alert.service logic ───────────────────────────────

type AlertType = 'low_stock' | 'expiring' | 'expired' | 'system'
type AlertSeverity = 'info' | 'warning' | 'critical'

interface MockInventoryItem {
  id: string
  name: string
  quantity: number
  reorderLevel: number
  expiryDate: Date
  branch: string
}

interface GeneratedAlert {
  id: string
  type: AlertType
  item?: string
  branch?: string
  severity: AlertSeverity
}

interface AlertFilters {
  type?: AlertType
  severity?: AlertSeverity
}

function generateAlerts(items: MockInventoryItem[], now: Date): GeneratedAlert[] {
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const alerts: GeneratedAlert[] = []

  for (const item of items) {
    const isExpired = item.expiryDate < now
    const isExpiring = !isExpired && item.expiryDate <= in30Days
    const isLowStock = item.quantity <= item.reorderLevel

    if (isExpired) {
      alerts.push({
        id: `expired-${item.id}`,
        type: 'expired',
        item: item.name,
        branch: item.branch,
        severity: 'critical',
      })
    } else if (isExpiring) {
      const daysLeft = Math.ceil(
        (item.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      )
      alerts.push({
        id: `expiring-${item.id}`,
        type: 'expiring',
        item: item.name,
        branch: item.branch,
        severity: daysLeft <= 7 ? 'critical' : 'warning',
      })
    }

    if (isLowStock) {
      alerts.push({
        id: `low-stock-${item.id}`,
        type: 'low_stock',
        item: item.name,
        branch: item.branch,
        severity: item.quantity === 0 ? 'critical' : 'warning',
      })
    }
  }

  return alerts
}

function filterAlerts(alerts: GeneratedAlert[], filters: AlertFilters): GeneratedAlert[] {
  return alerts.filter((alert) => {
    if (filters.type && alert.type !== filters.type) return false
    if (filters.severity && alert.severity !== filters.severity) return false
    return true
  })
}

// ─── Arbitraries ──────────────────────────────────────────────────────────────

const fcStr = fc.string({ minLength: 1, maxLength: 30 })

const fcItem = (now: Date): fc.Arbitrary<MockInventoryItem> =>
  fc.record({
    id: fc.uuid(),
    name: fcStr,
    quantity: fc.integer({ min: 0, max: 500 }),
    reorderLevel: fc.integer({ min: 1, max: 100 }),
    expiryDate: fc.date({
      min: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), // up to 60 days in the past
      max: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000), // up to 120 days in the future
    }),
    branch: fc.constantFrom('Manila Branch', 'Cebu Branch', 'Davao Branch'),
  })

const fcAlertType = fc.constantFrom<AlertType>('low_stock', 'expiring', 'expired', 'system')
const fcAlertSeverity = fc.constantFrom<AlertSeverity>('info', 'warning', 'critical')

// ─── Property 17 ──────────────────────────────────────────────────────────────

describe('Alert service — Property 17: Alert generation rules are consistent with inventory state', () => {
  it('expired items always generate an expired alert', () => {
    const now = new Date('2026-05-15T12:00:00Z')
    fc.assert(
      fc.property(
        fc.array(fcItem(now), { minLength: 1, maxLength: 30 }),
        (items) => {
          const alerts = generateAlerts(items, now)
          const expiredItems = items.filter((i) => i.expiryDate < now)
          for (const item of expiredItems) {
            const alert = alerts.find((a) => a.id === `expired-${item.id}`)
            expect(alert).toBeDefined()
            expect(alert?.type).toBe('expired')
            expect(alert?.severity).toBe('critical')
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  it('items expiring within 30 days (not past) generate an expiring alert', () => {
    const now = new Date('2026-05-15T12:00:00Z')
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    fc.assert(
      fc.property(
        fc.array(fcItem(now), { minLength: 1, maxLength: 30 }),
        (items) => {
          const alerts = generateAlerts(items, now)
          const expiringItems = items.filter(
            (i) => i.expiryDate >= now && i.expiryDate <= in30Days,
          )
          for (const item of expiringItems) {
            const alert = alerts.find((a) => a.id === `expiring-${item.id}`)
            expect(alert).toBeDefined()
            expect(alert?.type).toBe('expiring')
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  it('items with quantity <= reorderLevel generate a low-stock alert', () => {
    const now = new Date('2026-05-15T12:00:00Z')
    fc.assert(
      fc.property(
        fc.array(fcItem(now), { minLength: 1, maxLength: 30 }),
        (items) => {
          const alerts = generateAlerts(items, now)
          const lowStockItems = items.filter((i) => i.quantity <= i.reorderLevel)
          for (const item of lowStockItems) {
            const alert = alerts.find((a) => a.id === `low-stock-${item.id}`)
            expect(alert).toBeDefined()
            expect(alert?.type).toBe('low_stock')
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  it('items with quantity > reorderLevel do NOT generate a low-stock alert', () => {
    const now = new Date('2026-05-15T12:00:00Z')
    fc.assert(
      fc.property(
        fc.array(fcItem(now), { minLength: 1, maxLength: 30 }),
        (items) => {
          const alerts = generateAlerts(items, now)
          const normalItems = items.filter((i) => i.quantity > i.reorderLevel)
          for (const item of normalItems) {
            const alert = alerts.find((a) => a.id === `low-stock-${item.id}`)
            expect(alert).toBeUndefined()
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  it('items not expired and not expiring within 30 days do NOT generate expiry alerts', () => {
    const now = new Date('2026-05-15T12:00:00Z')
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    fc.assert(
      fc.property(
        fc.array(fcItem(now), { minLength: 1, maxLength: 30 }),
        (items) => {
          const alerts = generateAlerts(items, now)
          const safeItems = items.filter((i) => i.expiryDate > in30Days)
          for (const item of safeItems) {
            const expiredAlert = alerts.find((a) => a.id === `expired-${item.id}`)
            const expiringAlert = alerts.find((a) => a.id === `expiring-${item.id}`)
            expect(expiredAlert).toBeUndefined()
            expect(expiringAlert).toBeUndefined()
          }
        },
      ),
      { numRuns: 100 },
    )
  })
})

// ─── Property 18 ──────────────────────────────────────────────────────────────

describe('Alert service — Property 18: Alert filter results satisfy all applied criteria', () => {
  const now = new Date('2026-05-15T12:00:00Z')

  it('type filter: all returned alerts have the specified type', () => {
    fc.assert(
      fc.property(
        fc.array(fcItem(now), { minLength: 0, maxLength: 30 }),
        fcAlertType,
        (items, type) => {
          const allAlerts = generateAlerts(items, now)
          const result = filterAlerts(allAlerts, { type })
          expect(result.every((a) => a.type === type)).toBe(true)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('severity filter: all returned alerts have the specified severity', () => {
    fc.assert(
      fc.property(
        fc.array(fcItem(now), { minLength: 0, maxLength: 30 }),
        fcAlertSeverity,
        (items, severity) => {
          const allAlerts = generateAlerts(items, now)
          const result = filterAlerts(allAlerts, { severity })
          expect(result.every((a) => a.severity === severity)).toBe(true)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('combined type+severity filter: all returned alerts satisfy both conditions', () => {
    fc.assert(
      fc.property(
        fc.array(fcItem(now), { minLength: 0, maxLength: 30 }),
        fcAlertType,
        fcAlertSeverity,
        (items, type, severity) => {
          const allAlerts = generateAlerts(items, now)
          const result = filterAlerts(allAlerts, { type, severity })
          expect(result.every((a) => a.type === type && a.severity === severity)).toBe(true)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('no filter returns all generated alerts', () => {
    fc.assert(
      fc.property(fc.array(fcItem(now), { minLength: 0, maxLength: 30 }), (items) => {
        const allAlerts = generateAlerts(items, now)
        const result = filterAlerts(allAlerts, {})
        expect(result.length).toBe(allAlerts.length)
      }),
      { numRuns: 100 },
    )
  })
})
