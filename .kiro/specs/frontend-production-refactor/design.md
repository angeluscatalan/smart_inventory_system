# Design Document: Frontend Production Refactor

## Overview

This document describes the technical design for the production-readiness refactor of the InvSys PH Smart Inventory System frontend. The codebase is a Next.js 14 application (TypeScript, Tailwind CSS, shadcn/ui, Recharts) that was scaffolded with AI-assisted tooling. It currently contains mock data imports, hardcoded credentials, placeholder event handlers, and inline static chart data that must be removed before backend integration.

The refactor is purely structural — no new user-facing features are added. The goal is a clean, professionally authored codebase where:

- All mock data references are replaced with typed service-layer stubs in `lib/api/`
- All hardcoded credentials are extracted to a single `lib/demo-accounts.ts` file
- All placeholder handlers are replaced with named, documented stub functions
- All inline chart data arrays are replaced with service stub calls
- All AI-generation artifacts are removed
- Naming conventions are consistent throughout

The existing `lib/types.ts` is extended with new payload, filter, and API-return types. No component prop interfaces change — the refactor is transparent to the component tree.

---

## Architecture

The refactor introduces a service layer between components and the (future) backend. The overall data flow after the refactor is:

```
Component
  └─ calls named handler stub (e.g. handleAddItem)
       └─ calls service stub (e.g. inventoryApi.fetchInventoryItems())
            └─ returns Promise<T> (empty/typed for now)
                 └─ component renders data or loading/error state
```

### Directory Structure After Refactor

```
lib/
  api/
    inventory.ts          ← InventoryItem CRUD + chart stubs
    branches.ts           ← Branch CRUD stubs
    users.ts              ← User CRUD stubs
    alerts.ts             ← Alert fetch stubs
    activities.ts         ← Activity fetch + audit log stats stubs
    stock-adjustments.ts  ← StockAdjustment CRUD + chart stubs
  types.ts                ← Extended with new payload/filter/return types
  demo-accounts.ts        ← DEVELOPMENT ONLY credential records
  auth-context.tsx        ← Imports credentials from demo-accounts.ts
  mock-data.ts            ← Retained as-is (not deleted; just no longer imported by app/ or components/)
  permissions.ts          ← Unchanged
  utils.ts                ← Unchanged
```

`lib/mock-data.ts` is **not deleted** — it remains as a reference and may be used by `lib/demo-accounts.ts` or future test fixtures. It is simply no longer imported anywhere under `app/` or `components/`.

### Key Design Decisions

1. **One service module per domain** — mirrors the expected REST API resource grouping and makes it easy for a backend engineer to find the stub for any endpoint.
2. **Stubs return empty resolved Promises** — components can be wired up and rendered without a backend; loading/error states are exercised via the stub's async nature.
3. **`lib/types.ts` is the single source of truth for all types** — service modules import from it; components import from it; no type is defined inline in a component.
4. **`lib/demo-accounts.ts` is the only file allowed to contain credential pairs** — a `// DEVELOPMENT ONLY` comment on line 1 makes the intent clear.
5. **Chart components become async-aware** — they use `useState`/`useEffect` to call their service stub on mount and render a skeleton while loading and an inline error on failure.

---

## Components and Interfaces

### `lib/demo-accounts.ts` (new file)

Extracted from `components/auth/login-form.tsx` and `lib/auth-context.tsx`.

```typescript
// DEVELOPMENT ONLY — remove before production deployment
import { Shield, Building2, UserCheck } from 'lucide-react'
import type { ComponentType } from 'react'

export interface DemoAccount {
  label: string
  username: string
  password: string
  subtitle: string
}

export interface DemoAccountGroup {
  title: string
  icon: ComponentType<{ className?: string }>
  accounts: DemoAccount[]
}

export const DEMO_CREDENTIALS: Record<string, {
  password: string
  fullName: string
  role: 'admin' | 'branch-manager' | 'staff'
  branch: string
}> = {
  admin:          { password: 'password123', fullName: 'Administrator',    role: 'admin',          branch: 'all' },
  manila_manager: { password: 'manila2024',  fullName: 'Maria Santos',     role: 'branch-manager', branch: 'Manila Branch' },
  cebu_manager:   { password: 'cebu2024',    fullName: 'Juan Dela Cruz',   role: 'branch-manager', branch: 'Cebu Branch' },
  davao_manager:  { password: 'davao2024',   fullName: 'Rosa Garcia',      role: 'branch-manager', branch: 'Davao Branch' },
  manila_staff:   { password: 'staff123',    fullName: 'Anna Lopez',       role: 'staff',          branch: 'Manila Branch' },
  cebu_staff:     { password: 'staff123',    fullName: 'Miguel Rodriguez', role: 'staff',          branch: 'Cebu Branch' },
  davao_staff:    { password: 'staff123',    fullName: 'Christine Reyes',  role: 'staff',          branch: 'Davao Branch' },
}

export const DEMO_ACCOUNT_GROUPS: DemoAccountGroup[] = [
  {
    title: 'Administrator',
    icon: Shield,
    accounts: [
      { label: 'Admin', username: 'admin', password: 'password123', subtitle: 'Full access' },
    ],
  },
  {
    title: 'Branch Managers',
    icon: Building2,
    accounts: [
      { label: 'Maria Santos',   username: 'manila_manager', password: 'manila2024', subtitle: 'Manila Branch' },
      { label: 'Juan Dela Cruz', username: 'cebu_manager',   password: 'cebu2024',   subtitle: 'Cebu Branch' },
      { label: 'Rosa Garcia',    username: 'davao_manager',  password: 'davao2024',  subtitle: 'Davao Branch' },
    ],
  },
  {
    title: 'Staff',
    icon: UserCheck,
    accounts: [
      { label: 'Anna Lopez',       username: 'manila_staff', password: 'staff123', subtitle: 'Manila Branch' },
      { label: 'Miguel Rodriguez', username: 'cebu_staff',   password: 'staff123', subtitle: 'Cebu Branch' },
      { label: 'Christine Reyes',  username: 'davao_staff',  password: 'staff123', subtitle: 'Davao Branch' },
    ],
  },
]
```

### `lib/auth-context.tsx` (modified)

Remove the inline `CREDENTIALS` record. Import `DEMO_CREDENTIALS` from `lib/demo-accounts.ts` and use it in the `login` function.

```typescript
import { DEMO_CREDENTIALS } from './demo-accounts'
// Replace the inline CREDENTIALS constant with:
const cred = DEMO_CREDENTIALS[username]
```

### `components/auth/login-form.tsx` (modified)

- Remove the inline `demoAccounts` array and `DemoAccount` interface.
- Import `DEMO_ACCOUNT_GROUPS` and `DemoAccountGroup` from `lib/demo-accounts.ts`.
- Add a "Development Only" badge visually adjacent to the demo accounts panel.

```tsx
import { DEMO_ACCOUNT_GROUPS } from '@/lib/demo-accounts'
// ...
<Card className="border border-border shadow-lg">
  <div className="p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold text-foreground">Demo Accounts</h2>
      <span className="text-xs font-medium text-destructive border border-destructive/30 rounded px-2 py-0.5">
        Development Only
      </span>
    </div>
    {/* render DEMO_ACCOUNT_GROUPS */}
  </div>
</Card>
```

### Service Layer: `lib/api/` modules

Each module follows the same pattern:

```typescript
import type { SomeDomainType, SomePayload } from '@/lib/types'

/**
 * GET /api/inventory
 * Returns all inventory items, optionally filtered.
 */
export async function fetchInventoryItems(
  filters?: InventoryFilters
): Promise<InventoryItem[]> {
  // TODO: replace with API call
  return []
}
```

#### `lib/api/inventory.ts`

Exports:
- `fetchInventoryItems(filters?: InventoryFilters): Promise<InventoryItem[]>`
- `fetchInventoryByBranch(): Promise<InventoryByBranchDataPoint[]>`
- `fetchExpirationTimeline(): Promise<ExpirationTimelineDataPoint[]>`

#### `lib/api/branches.ts`

Exports:
- `fetchBranches(): Promise<Branch[]>`

#### `lib/api/users.ts`

Exports:
- `fetchUsers(): Promise<User[]>`

#### `lib/api/alerts.ts`

Exports:
- `fetchAlerts(filters?: AlertFilters): Promise<Alert[]>`

#### `lib/api/activities.ts`

Exports:
- `fetchActivities(filters?: ActivityFilters): Promise<Activity[]>`
- `fetchAuditLogStats(): Promise<AuditLogStats>`

#### `lib/api/stock-adjustments.ts`

Exports:
- `fetchStockAdjustments(): Promise<StockAdjustment[]>`
- `fetchStockMovementData(): Promise<StockMovementDataPoint[]>`
- `submitStockAdjustment(payload: StockAdjustmentPayload): Promise<void>`

### Page-level handler stubs

Each page component gains named handler functions replacing anonymous/placeholder handlers. The table below maps each requirement criterion to its handler location:

| Handler | File | Parameter(s) |
|---|---|---|
| `handleAddItem` | `app/(dashboard)/inventory/page.tsx` | none |
| `handleExportInventory` | `app/(dashboard)/inventory/page.tsx` | none |
| `handleAddBranch` | `app/(dashboard)/branches/page.tsx` | none |
| `handleEditBranch` | `components/branches/branch-table.tsx` | `branchId: string` |
| `handleDeleteBranch` | `components/branches/branch-table.tsx` | `branchId: string` |
| `handleAddUser` | `app/(dashboard)/user-management/page.tsx` | none |
| `handleEditUser` | `app/(dashboard)/user-management/page.tsx` | `userId: string` |
| `handleDeleteUser` | `app/(dashboard)/user-management/page.tsx` | `userId: string` |
| `handleGenerateReport` | `app/(dashboard)/reports/page.tsx` | `filters: ReportFilters` |
| `handleExportReport` | `app/(dashboard)/reports/page.tsx` | `filters: ReportFilters` |
| `handleGlobalSearch` | `components/layout/header.tsx` | `query: string` |
| `handleOpenNotificationFilters` | `app/(dashboard)/notifications/page.tsx` | none |
| `handleOpenAuditFilters` | `app/(dashboard)/audit-logs/page.tsx` | none |
| `handleExportAuditLogs` | `app/(dashboard)/audit-logs/page.tsx` | none |
| `handleViewProfile` | `components/layout/header.tsx` | none |
| `handleStockAdjustmentSubmit` | `components/stock-ops/stock-adjustment-form.tsx` | `payload: StockAdjustmentPayload` |

`StockAdjustmentForm`'s `onSubmit` prop type changes from `(data: any) => void` to `(payload: StockAdjustmentPayload) => void`. The page-level `handleAdjustmentSubmit` in `stock-operations/page.tsx` is renamed to `handleStockAdjustmentSubmit` and typed accordingly.

### Chart components: async data fetching

All three chart components (`StockMovementChart`, `InventoryByBranchChart`, `ExpiringProductsTimeline`) are refactored to the same pattern:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchStockMovementData } from '@/lib/api/stock-adjustments'
import type { StockMovementDataPoint } from '@/lib/types'

export function StockMovementChart() {
  const [data, setData] = useState<StockMovementDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStockMovementData()
      .then(setData)
      .catch(() => setError('Failed to load chart data'))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <Card>...<Skeleton className="h-[300px]" /></Card>
  if (error)     return <Card>...<p className="text-destructive text-sm">{error}</p></Card>

  return <Card>...{/* existing Recharts JSX using data */}</Card>
}
```

`RecentActivityTable` and `AdjustmentHistoryTable` follow the same pattern, fetching from `activitiesApi.fetchActivities()` and `stockAdjustmentsApi.fetchStockAdjustments()` respectively.

### `AuditLogsPage` stats

The three hardcoded stat values (`5`, `18`, `4`) are replaced with state driven by `fetchAuditLogStats()`:

```tsx
const [stats, setStats] = useState<AuditLogStats | null>(null)
const [statsLoading, setStatsLoading] = useState(true)
const [statsError, setStatsError] = useState(false)

useEffect(() => {
  fetchAuditLogStats()
    .then(setStats)
    .catch(() => setStatsError(true))
    .finally(() => setStatsLoading(false))
}, [])

// Render: statsLoading → <Skeleton />, statsError → '--', resolved → stats.last24Hours etc.
```

### `NotificationsPage` and `BranchesPage` data

Both pages currently import from `@/lib/mock-data`. After the refactor:

- `NotificationsPage` calls `fetchAlerts()` from `lib/api/alerts.ts` on mount.
- `BranchesPage` calls `fetchBranches()` from `lib/api/branches.ts` on mount.
- `UserManagementPage` calls `fetchUsers()` from `lib/api/users.ts` on mount.

The branch/user stat counts (total, active, inactive) are computed from the fetched array, not from mock data directly.

---

## Data Models

### Extended `lib/types.ts`

The following types are added to the existing `lib/types.ts`. Existing types (`InventoryItem`, `Branch`, `User`, `Activity`, `StockAdjustment`, `Alert`, `UserRole`) are unchanged.

```typescript
// ─── Payload types (data submitted to the API) ───────────────────────────────

export interface StockAdjustmentPayload {
  itemId: string
  quantity: number
  adjustmentType: 'add' | 'remove' | 'correction'
  reason: string
  fromBranch?: string
  toBranch?: string
}

// ─── Filter types (query / filter parameters) ────────────────────────────────

export interface InventoryFilters {
  searchQuery?: string
  branchId?: string | null
  status?: InventoryItem['status'] | 'all'
}

export interface AlertFilters {
  type?: Alert['type'] | 'all'
  severity?: Alert['severity'] | 'all'
}

export interface ActivityFilters {
  searchUser?: string
  action?: string | 'all'
}

export interface ReportFilters {
  dateFrom: string
  dateTo: string
  branchId: string | null
  reportType?: 'inventory' | 'movement' | 'expiring' | 'branch'
}

// ─── API return types ─────────────────────────────────────────────────────────

export interface AuditLogStats {
  last24Hours: number
  lastWeek: number
  activeUsers: number
}

export interface InventoryByBranchDataPoint {
  branch: string
  items: number
  value: number
}

export interface StockMovementDataPoint {
  week: string
  inbound: number
  outbound: number
  net: number
}

export interface ExpirationTimelineDataPoint {
  period: string
  count: number
  critical: number
}
```

### Naming Convention Audit

The following specific issues are addressed:

| Location | Current | Fixed |
|---|---|---|
| `StockAdjustmentForm` prop `onSubmit?: (data: any) => void` | uses `any` | `(payload: StockAdjustmentPayload) => void` |
| `StockAdjustmentForm` internal `formData` object | untyped | typed as `StockAdjustmentPayload` |
| `UserManagementPage` shadow variable `user` in `.map((user) => ...)` | shadows outer `user` from `useAuth` | renamed to `member` |
| `auth-context.tsx` `CREDENTIALS` constant | inline credential record | removed; replaced by import from `demo-accounts.ts` |
| All component prop interfaces | some missing `Props` suffix | audited; `BranchTableProps`, `AlertListProps`, `InventoryTableProps`, `StockAdjustmentFormProps` already correct |
| `DemoAccount` interface in `login-form.tsx` | defined inline in component file | moved to `lib/demo-accounts.ts` |

All file names under `app/`, `components/`, and `lib/` already use kebab-case. No file renames are required.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

After prework analysis, one acceptance criterion is suitable for property-based testing:

### Property 1: Service stub functions return resolved Promises of the correct type

*For any* stub function exported from `lib/api/`, calling it (with no arguments, or with a valid filter argument) SHALL return a `Promise` that resolves — never rejects — and whose resolved value satisfies the declared TypeScript return type (an empty array `[]` for list-returning stubs, or a typed empty object for object-returning stubs).

**Validates: Requirements 2.5**

**Rationale:** This property is universally quantified over all stub functions in the service layer. Input variation (different filter arguments) should not cause a stub to reject — stubs must always resolve. Running this across all stubs and multiple filter shapes catches any stub that accidentally throws or returns `undefined`.

---

## Error Handling

### Chart components

- **Loading state**: A `<Skeleton className="h-[300px]" />` is rendered inside the `<CardContent>` while the fetch is in progress.
- **Error state**: A `<p className="text-destructive text-sm">Failed to load chart data. Please try again.</p>` is rendered inside the `<CardContent>`. No toast or modal is shown.
- **Empty state**: An empty array resolves successfully; the chart renders with no data points (Recharts handles this gracefully with an empty chart area).

### Audit log stats

- **Loading state**: Each stat value is replaced with a `<Skeleton className="h-8 w-12" />`.
- **Error state**: Each stat value is replaced with the string `--`.
- **Success state**: Values from `AuditLogStats` are rendered directly.

### Page-level data (branches, users, alerts, activities)

Pages that fetch list data on mount follow this pattern:

```tsx
const [items, setItems] = useState<T[]>([])
const [isLoading, setIsLoading] = useState(true)

useEffect(() => {
  fetchItems()
    .then(setItems)
    .catch(() => { /* silently keep empty array; table shows "No items found" */ })
    .finally(() => setIsLoading(false))
}, [])
```

The existing empty-state rows in tables ("No items found", "No activities found matching your filters") already handle the empty array case correctly.

### Handler stubs

Named handler stubs contain only a `// TODO` comment and do not throw. They are `void`-returning functions, so no error propagation is needed at this stage.

---

## Testing Strategy

This refactor is primarily structural. The testing approach is:

### TypeScript compilation (automated, CI)

Running `tsc --noEmit` with `strict: true` and `noImplicitAny: true` validates:
- All stub functions have explicit parameter and return types (Requirements 8.1–8.4)
- No `any` in stub signatures (Requirement 8.3)
- `StockAdjustmentPayload`, `ReportFilters`, and all other new types are used correctly

### ESLint (automated, CI)

The `@typescript-eslint/no-explicit-any` rule enforces Requirement 8.3 at the linting level.

### Smoke tests (static analysis)

The following checks can be run as part of a CI script or a test file using `fs.readFileSync` + regex:

- Zero matches for `@/lib/mock-data` in `app/` and `components/` (Requirement 2.1)
- Zero matches for `password123|manila2024|cebu2024|davao2024|staff123` outside `lib/demo-accounts.ts` (Requirement 4.1)
- Zero matches for `v0|generated-by-ai|ai-placeholder|copilot-generated` in `app/` and `components/` (Requirement 1.3)
- Zero matches for hardcoded stat literals `>5<|>18<|>4<` in `audit-logs/page.tsx` (Requirement 6.1)

### Unit / example-based tests (Jest + React Testing Library)

**Property 1 — Service stub resolution** (property-based, minimum 100 iterations):

```typescript
// Feature: frontend-production-refactor, Property 1: service stubs return resolved Promises
import fc from 'fast-check'
import * as inventoryApi from '@/lib/api/inventory'
import * as branchesApi from '@/lib/api/branches'
// ... all api modules

it('all stub functions return resolved Promises', async () => {
  const stubs = [
    () => inventoryApi.fetchInventoryItems(),
    () => inventoryApi.fetchInventoryByBranch(),
    () => inventoryApi.fetchExpirationTimeline(),
    () => branchesApi.fetchBranches(),
    // ... all stubs
  ]
  await fc.assert(
    fc.asyncProperty(fc.integer({ min: 0, max: stubs.length - 1 }), async (idx) => {
      const result = await stubs[idx]()
      expect(Array.isArray(result) || typeof result === 'object').toBe(true)
    }),
    { numRuns: 100 }
  )
})
```

**Chart mount behavior** (example-based):

```typescript
it('StockMovementChart calls fetchStockMovementData on mount', async () => {
  const spy = jest.spyOn(stockAdjustmentsApi, 'fetchStockMovementData')
    .mockResolvedValue([])
  render(<StockMovementChart />)
  expect(spy).toHaveBeenCalledTimes(1)
})

it('StockMovementChart renders skeleton while loading', () => {
  jest.spyOn(stockAdjustmentsApi, 'fetchStockMovementData')
    .mockReturnValue(new Promise(() => {})) // never resolves
  render(<StockMovementChart />)
  expect(screen.getByTestId('chart-skeleton')).toBeInTheDocument()
})

it('StockMovementChart renders inline error on fetch failure', async () => {
  jest.spyOn(stockAdjustmentsApi, 'fetchStockMovementData')
    .mockRejectedValue(new Error('network error'))
  render(<StockMovementChart />)
  await waitFor(() =>
    expect(screen.getByText(/failed to load chart data/i)).toBeInTheDocument()
  )
})
```

Equivalent tests are written for `InventoryByBranchChart` and `ExpiringProductsTimeline`.

**Audit log stats** (example-based):

```typescript
it('AuditLogsPage calls fetchAuditLogStats on mount')
it('AuditLogsPage renders skeleton while stats are loading')
it('AuditLogsPage renders "--" for each stat when fetchAuditLogStats rejects')
```

**Handler stubs** (example-based):

```typescript
it('clicking "Add Item" calls handleAddItem')
it('clicking "Export" in InventoryPage calls handleExportInventory')
it('clicking "Add Branch" calls handleAddBranch')
// ... one test per handler listed in Requirements 3.3–3.18
```

**"Development Only" label** (example-based):

```typescript
it('LoginForm renders "Development Only" label adjacent to demo accounts panel', () => {
  render(<LoginForm />)
  expect(screen.getByText('Development Only')).toBeInTheDocument()
})
```

### Property-based testing library

Use **fast-check** (`fast-check` npm package), which is the standard PBT library for TypeScript/JavaScript. Each property test runs a minimum of **100 iterations**.

Tag format for property tests: `// Feature: frontend-production-refactor, Property 1: service stubs return resolved Promises`
