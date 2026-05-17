// Feature: client-server-migration, Property 1: Authentication outcome is determined solely by credential validity
// Feature: client-server-migration, Property 2: Every protected endpoint rejects requests without a valid JWT

import { describe, it, expect, vi } from 'vitest'
import fc from 'fast-check'
import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'

const TEST_SECRET = 'test-secret-key'

// Mock the env module to use test secret
vi.mock('../../lib/env', () => ({
  JWT_SECRET: 'test-secret-key',
  JWT_EXPIRES_IN: '8h',
  CORS_ORIGIN: 'http://localhost:3000',
  DATABASE_URL: 'file:./test.db',
}))

// Import authenticate — vi.mock() is hoisted so the mock is active before this import
import { authenticate } from '../../middleware/auth'

function makeReq(authHeader?: string): Partial<Request> {
  return {
    headers: authHeader ? { authorization: authHeader } : {},
  }
}

function makeRes(): { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn>; _status: number; _body: unknown } {
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
 * Property 1: Authentication outcome is determined solely by credential validity
 *
 * A valid JWT (signed with the correct secret, not expired) must always be accepted
 * and the user payload must be attached to req.user.
 *
 * Validates: Requirements 3.1, 3.2
 */
describe('Auth middleware — Property 1: Authentication outcome', () => {
  it('valid JWT tokens are accepted and user is attached to req', () => {
    fc.assert(
      fc.property(
        fc.record({
          sub: fc.uuid(),
          role: fc.constantFrom('admin', 'branch-manager', 'staff'),
          branch: fc.string({ minLength: 1, maxLength: 50 }),
        }),
        (payload) => {
          const token = jwt.sign(payload, TEST_SECRET, { expiresIn: '1h' })
          const req = makeReq(`Bearer ${token}`) as Request
          const res = makeRes() as unknown as Response
          const next = vi.fn() as NextFunction

          authenticate(req, res, next)

          expect(next).toHaveBeenCalledOnce()
          expect(req.user).toBeDefined()
          expect(req.user?.userId).toBe(payload.sub)
          expect(req.user?.role).toBe(payload.role)
          expect(req.user?.branch).toBe(payload.branch)
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * Property 2: Every protected endpoint rejects requests without a valid JWT
 *
 * Absent, malformed, expired, or wrong-secret tokens must all result in HTTP 401.
 *
 * Validates: Requirements 3.6
 */
describe('Auth middleware — Property 2: Every protected endpoint rejects requests without a valid JWT', () => {
  it('missing Authorization header returns 401', () => {
    fc.assert(
      fc.property(fc.constant(undefined), () => {
        const req = makeReq(undefined) as Request
        const res = makeRes() as unknown as Response
        const next = vi.fn() as NextFunction

        authenticate(req, res, next)

        expect(next).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(401)
      }),
      { numRuns: 100 }
    )
  })

  it('malformed token (not a valid JWT) returns 401', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => !s.includes('.')),
        (badToken) => {
          const req = makeReq(`Bearer ${badToken}`) as Request
          const res = makeRes() as unknown as Response
          const next = vi.fn() as NextFunction

          authenticate(req, res, next)

          expect(next).not.toHaveBeenCalled()
          expect(res.status).toHaveBeenCalledWith(401)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('token signed with wrong secret returns 401', () => {
    fc.assert(
      fc.property(
        fc.record({
          sub: fc.uuid(),
          role: fc.constantFrom('admin', 'branch-manager', 'staff'),
          branch: fc.string({ minLength: 1, maxLength: 50 }),
        }),
        (payload) => {
          // Sign with a DIFFERENT secret
          const token = jwt.sign(payload, 'wrong-secret', { expiresIn: '1h' })
          const req = makeReq(`Bearer ${token}`) as Request
          const res = makeRes() as unknown as Response
          const next = vi.fn() as NextFunction

          authenticate(req, res, next)

          expect(next).not.toHaveBeenCalled()
          expect(res.status).toHaveBeenCalledWith(401)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('expired token returns 401', () => {
    // Create an already-expired token
    const token = jwt.sign(
      { sub: 'user-1', role: 'admin', branch: 'all' },
      TEST_SECRET,
      { expiresIn: -1 } // expired 1 second ago
    )
    const req = makeReq(`Bearer ${token}`) as Request
    const res = makeRes() as unknown as Response
    const next = vi.fn() as NextFunction

    authenticate(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(401)
  })
})
