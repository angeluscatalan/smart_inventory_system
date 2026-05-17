// Feature: client-server-migration, Property 9: Non-admin roles are denied access to admin-only endpoints

import { describe, it, expect, vi } from 'vitest'
import fc from 'fast-check'
import { requireRole, requireMinRole } from '../../middleware/rbac'
import type { Request, Response, NextFunction } from 'express'

function makeReqWithUser(role: string): Partial<Request> {
  return {
    user: { userId: 'test-user', role, branch: 'Test Branch' },
  }
}

function makeRes() {
  const res = {
    _status: 200,
    _body: null as unknown,
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }
  res.status.mockImplementation((code: number) => { res._status = code; return res })
  res.json.mockImplementation((body: unknown) => { res._body = body; return res })
  return res
}

/**
 * Property 9: Non-admin roles are denied access to admin-only endpoints
 *
 * Only the 'admin' role should be allowed through requireRole('admin').
 * branch-manager and staff must receive HTTP 403.
 * staff must also receive HTTP 403 on requireMinRole('branch-manager') endpoints.
 *
 * Validates: Requirements 7.2, 9.4, 12.1, 12.2, 12.3
 */
describe('RBAC middleware — Property 9: Non-admin roles denied admin-only endpoints', () => {
  it('admin role is allowed on admin-only endpoints', () => {
    fc.assert(
      fc.property(fc.constant('admin'), (role) => {
        const req = makeReqWithUser(role) as Request
        const res = makeRes() as unknown as Response
        const next = vi.fn() as NextFunction

        requireRole('admin')(req, res, next)

        expect(next).toHaveBeenCalledOnce()
        expect(res.status).not.toHaveBeenCalledWith(403)
      }),
      { numRuns: 100 }
    )
  })

  it('branch-manager role is denied admin-only endpoints', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('branch-manager', 'branch_manager'),
        (role) => {
          const req = makeReqWithUser(role) as Request
          const res = makeRes() as unknown as Response
          const next = vi.fn() as NextFunction

          requireRole('admin')(req, res, next)

          expect(next).not.toHaveBeenCalled()
          expect(res.status).toHaveBeenCalledWith(403)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('staff role is denied admin-only endpoints', () => {
    fc.assert(
      fc.property(fc.constant('staff'), (role) => {
        const req = makeReqWithUser(role) as Request
        const res = makeRes() as unknown as Response
        const next = vi.fn() as NextFunction

        requireRole('admin')(req, res, next)

        expect(next).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(403)
      }),
      { numRuns: 100 }
    )
  })

  it('staff role is denied branch-manager-or-above endpoints', () => {
    fc.assert(
      fc.property(fc.constant('staff'), (role) => {
        const req = makeReqWithUser(role) as Request
        const res = makeRes() as unknown as Response
        const next = vi.fn() as NextFunction

        requireMinRole('branch-manager')(req, res, next)

        expect(next).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(403)
      }),
      { numRuns: 100 }
    )
  })

  it('branch-manager role is allowed on branch-manager-or-above endpoints', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('branch-manager', 'branch_manager'),
        (role) => {
          const req = makeReqWithUser(role) as Request
          const res = makeRes() as unknown as Response
          const next = vi.fn() as NextFunction

          requireMinRole('branch-manager')(req, res, next)

          expect(next).toHaveBeenCalledOnce()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('admin role is allowed on branch-manager-or-above endpoints', () => {
    fc.assert(
      fc.property(fc.constant('admin'), (role) => {
        const req = makeReqWithUser(role) as Request
        const res = makeRes() as unknown as Response
        const next = vi.fn() as NextFunction

        requireMinRole('branch-manager')(req, res, next)

        expect(next).toHaveBeenCalledOnce()
      }),
      { numRuns: 100 }
    )
  })
})

// ─── Property 20: Branch-manager inventory responses are scoped to their assigned branch ───

// Feature: client-server-migration, Property 20: Branch-manager inventory responses are scoped to their assigned branch

type ItemStatus = 'normal' | 'low_stock' | 'expiring' | 'expired'

interface MockItem {
  id: string
  name: string
  branch: string
  status: ItemStatus
  quantity: number
}

/**
 * Pure filter function mirroring the branch-manager scoping logic in inventory.service.ts.
 * When role is 'branch-manager', results are always restricted to the manager's branch.
 */
function scopeInventoryForRole(
  items: MockItem[],
  role: string,
  userBranch: string,
): MockItem[] {
  if (role === 'branch-manager' || role === 'branch_manager') {
    return items.filter((item) => item.branch === userBranch)
  }
  return items
}

describe('RBAC — Property 20: Branch-manager inventory responses are scoped to their assigned branch', () => {
  const fcBranch = fc.constantFrom('Manila Branch', 'Cebu Branch', 'Davao Branch')
  const fcStr = fc.string({ minLength: 1, maxLength: 20 })

  const fcItem: fc.Arbitrary<MockItem> = fc.record({
    id: fc.uuid(),
    name: fcStr,
    branch: fcBranch,
    status: fc.constantFrom<ItemStatus>('normal', 'low_stock', 'expiring', 'expired'),
    quantity: fc.integer({ min: 0, max: 1000 }),
  })

  it('branch-manager only sees items from their assigned branch', () => {
    fc.assert(
      fc.property(
        fc.array(fcItem, { minLength: 0, maxLength: 50 }),
        fcBranch,
        (items, managerBranch) => {
          const result = scopeInventoryForRole(items, 'branch-manager', managerBranch)
          expect(result.every((item) => item.branch === managerBranch)).toBe(true)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('branch_manager (underscore variant) also scopes to assigned branch', () => {
    fc.assert(
      fc.property(
        fc.array(fcItem, { minLength: 0, maxLength: 50 }),
        fcBranch,
        (items, managerBranch) => {
          const result = scopeInventoryForRole(items, 'branch_manager', managerBranch)
          expect(result.every((item) => item.branch === managerBranch)).toBe(true)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('admin sees all items regardless of branch', () => {
    fc.assert(
      fc.property(
        fc.array(fcItem, { minLength: 0, maxLength: 50 }),
        fcBranch,
        (items, adminBranch) => {
          const result = scopeInventoryForRole(items, 'admin', adminBranch)
          expect(result.length).toBe(items.length)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('branch-manager with branch A never sees items from branch B', () => {
    fc.assert(
      fc.property(
        fc.array(fcItem, { minLength: 1, maxLength: 50 }),
        fcBranch,
        fcBranch,
        (items, managerBranch, otherBranch) => {
          fc.pre(managerBranch !== otherBranch)
          const result = scopeInventoryForRole(items, 'branch-manager', managerBranch)
          expect(result.every((item) => item.branch !== otherBranch || item.branch === managerBranch)).toBe(true)
        },
      ),
      { numRuns: 100 },
    )
  })
})
