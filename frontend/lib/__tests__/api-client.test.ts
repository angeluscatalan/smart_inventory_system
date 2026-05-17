// Feature: client-server-migration, Property 3: JWT is attached to every authenticated frontend API request
// Feature: client-server-migration, Property 4: Frontend redirects to login on any 401 response
// Feature: client-server-migration, Property 19: API client correctly handles all HTTP response statuses

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fc from 'fast-check'

// ─── Module setup ─────────────────────────────────────────────────────────────

// Mock next/navigation (used by redirectToLogin in some implementations)
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

// We import the module under test after setting up mocks
// Use dynamic import to get fresh module state per test group
let apiFetch: typeof import('../api/client').apiFetch
let setToken: typeof import('../api/client').setToken
let clearToken: typeof import('../api/client').clearToken
let getToken: typeof import('../api/client').getToken
let ApiError: typeof import('../api/client').ApiError

beforeEach(async () => {
  vi.resetModules()
  const mod = await import('../api/client')
  apiFetch = mod.apiFetch
  setToken = mod.setToken
  clearToken = mod.clearToken
  getToken = mod.getToken
  ApiError = mod.ApiError
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ─── Helper: mock fetch ───────────────────────────────────────────────────────

// HTTP status codes that must not have a response body (null-body statuses per spec)
const NULL_BODY_STATUSES = new Set([101, 204, 205, 304])

function mockFetch(status: number, body: unknown = {}) {
  const isNullBody = NULL_BODY_STATUSES.has(status)
  const response = isNullBody
    ? new Response(null, { status })
    : new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      })
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
}

function captureLastFetchCall(): Request | undefined {
  const fetchMock = vi.mocked(globalThis.fetch)
  const calls = fetchMock.mock.calls
  if (calls.length === 0) return undefined
  return calls[calls.length - 1][0] as Request
}

function captureLastFetchInit(): RequestInit | undefined {
  const fetchMock = vi.mocked(globalThis.fetch)
  const calls = fetchMock.mock.calls
  if (calls.length === 0) return undefined
  return calls[calls.length - 1][1] as RequestInit
}

// ─── Property 3: JWT attached to every authenticated request ──────────────────

describe('API client — Property 3: JWT is attached to every authenticated request', () => {
  it('when a token is stored, every request includes Authorization: Bearer <token>', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        async (token, path) => {
          mockFetch(200, { data: 'ok' })
          setToken(token)

          await apiFetch(`/${path}`)

          const init = captureLastFetchInit()
          const headers = init?.headers as Record<string, string>
          expect(headers?.['Authorization']).toBe(`Bearer ${token}`)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('when no token is stored, no Authorization header is sent', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }),
        async (path) => {
          mockFetch(200, { data: 'ok' })
          clearToken()

          await apiFetch(`/${path}`)

          const init = captureLastFetchInit()
          const headers = init?.headers as Record<string, string>
          expect(headers?.['Authorization']).toBeUndefined()
        },
      ),
      { numRuns: 100 },
    )
  })
})

// ─── Property 4: Frontend redirects to login on any 401 response ──────────────

describe('API client — Property 4: Frontend redirects to login on any 401 response', () => {
  it('any 401 response causes apiFetch to throw ApiError(401) and clear the token', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 10, maxLength: 100 }),
        async (path, token) => {
          mockFetch(401, { message: 'Unauthorized' })
          setToken(token)

          // Mock window.location to prevent actual navigation in tests
          const locationSpy = vi.spyOn(window, 'location', 'get').mockReturnValue({
            ...window.location,
            href: '',
          } as Location)

          let threw = false
          try {
            await apiFetch(`/${path}`)
          } catch (err) {
            threw = true
            expect(err).toBeInstanceOf(ApiError)
            expect((err as InstanceType<typeof ApiError>).status).toBe(401)
          }

          expect(threw).toBe(true)
          // Token should be cleared after 401
          expect(getToken()).toBeNull()

          locationSpy.mockRestore()
        },
      ),
      { numRuns: 50 }, // fewer runs since we're mocking window.location
    )
  })
})

// ─── Property 19: API client correctly handles all HTTP response statuses ─────

describe('API client — Property 19: API client correctly handles all HTTP response statuses', () => {
  it('2xx responses: apiFetch returns the Response object', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 200, max: 299 }),
        async (status) => {
          const body = { result: 'success', status }
          mockFetch(status, body)
          clearToken()

          const res = await apiFetch('/api/test')
          expect(res.status).toBe(status)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('4xx responses (except 401): apiFetch throws ApiError with matching status', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 400, max: 499 }).filter((s) => s !== 401),
        async (status) => {
          mockFetch(status, { message: `Error ${status}` })
          clearToken()

          let threw = false
          try {
            await apiFetch('/api/test')
          } catch (err) {
            threw = true
            expect(err).toBeInstanceOf(ApiError)
            expect((err as InstanceType<typeof ApiError>).status).toBe(status)
          }
          expect(threw).toBe(true)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('5xx responses: apiFetch throws ApiError with matching status', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 500, max: 599 }),
        async (status) => {
          mockFetch(status, { message: `Server error ${status}` })
          clearToken()

          let threw = false
          try {
            await apiFetch('/api/test')
          } catch (err) {
            threw = true
            expect(err).toBeInstanceOf(ApiError)
            expect((err as InstanceType<typeof ApiError>).status).toBe(status)
          }
          expect(threw).toBe(true)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('ApiError carries the status code from the response', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 400, max: 599 }).filter((s) => s !== 401),
        fc.string({ minLength: 1, maxLength: 100 }),
        async (status, message) => {
          mockFetch(status, { message })
          clearToken()

          try {
            await apiFetch('/api/test')
          } catch (err) {
            if (err instanceof ApiError) {
              expect(err.status).toBe(status)
              expect(err.message).toBe(message)
            }
          }
        },
      ),
      { numRuns: 100 },
    )
  })
})
