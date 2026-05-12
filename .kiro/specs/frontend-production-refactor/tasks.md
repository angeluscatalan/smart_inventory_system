# Implementation Plan: Frontend Production Refactor

## Overview

Refactor the InvSys PH Smart Inventory System frontend from an AI-scaffolded prototype to a production-ready codebase. The work is purely structural: introduce a typed service layer (`lib/api/`), extract credentials to `lib/demo-accounts.ts`, replace placeholder handlers with named stubs, convert chart components to async data-fetching, and remove all AI-generation artifacts. No new user-facing features are added.

## Tasks

- [x] 1. Extend `lib/types.ts` with new payload, filter, and API-return types
  - Add `StockAdjustmentPayload`, `InventoryFilters`, `AlertFilters`, `ActivityFilters`, `ReportFilters`, `AuditLogStats`, `InventoryByBranchDataPoint`, `StockMovementDataPoint`, and `ExpirationTimelineDataPoint` to the existing `lib/types.ts`
  - Do not modify any existing types (`InventoryItem`, `Branch`, `User`, `Activity`, `StockAdjustment`, `Alert`, `UserRole`)
  - Use the `Payload` suffix for submission interfaces and `Filters` suffix for query/filter interfaces per naming conventions
  - _Requirements: 7.6, 8.1, 8.4_

- [x] 2. Create `lib/demo-accounts.ts` and remove hardcoded credentials
  - [x] 2.1 Create `lib/demo-accounts.ts` with `DEMO_CREDENTIALS`, `DEMO_ACCOUNT_GROUPS`, `DemoAccount`, and `DemoAccountGroup`
    - Add `// DEVELOPMENT ONLY — remove before production deployment` as the first line
    - Export `DEMO_CREDENTIALS` as a `Record<string, { password, fullName, role, branch }>` with all seven demo users
    - Export `DEMO_ACCOUNT_GROUPS` as a `DemoAccountGroup[]` with the three groups (Administrator, Branch Managers, Staff)
    - _Requirements: 4.1, 4.3, 4.4_

  - [x] 2.2 Update `lib/auth-context.tsx` to import from `lib/demo-accounts.ts`
    - Remove the inline `CREDENTIALS` record
    - Import `DEMO_CREDENTIALS` from `./demo-accounts` and use it in the `login` function
    - _Requirements: 4.1, 4.4_

  - [x] 2.3 Update `components/auth/login-form.tsx` to import from `lib/demo-accounts.ts`
    - Remove the inline `DemoAccount` interface and `demoAccounts` array
    - Import `DEMO_ACCOUNT_GROUPS` and `DemoAccountGroup` from `@/lib/demo-accounts`
    - Add a "Development Only" badge (non-interactive `<span>`) visually adjacent to the demo accounts panel header
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [x] 3. Create the `lib/api/` service layer modules
  - [x] 3.1 Create `lib/api/inventory.ts`
    - Export `fetchInventoryItems(filters?: InventoryFilters): Promise<InventoryItem[]>` — returns `[]`
    - Export `fetchInventoryByBranch(): Promise<InventoryByBranchDataPoint[]>` — returns `[]`
    - Export `fetchExpirationTimeline(): Promise<ExpirationTimelineDataPoint[]>` — returns `[]`
    - Each function must have a JSDoc comment describing the intended API endpoint, HTTP method, and response shape
    - _Requirements: 2.2, 2.4, 2.5, 5.2, 8.1, 8.4_

  - [x] 3.2 Create `lib/api/branches.ts`
    - Export `fetchBranches(): Promise<Branch[]>` — returns `[]`
    - Include JSDoc comment with API contract
    - _Requirements: 2.2, 2.4, 2.5, 8.1, 8.4_

  - [x] 3.3 Create `lib/api/users.ts`
    - Export `fetchUsers(): Promise<User[]>` — returns `[]`
    - Include JSDoc comment with API contract
    - _Requirements: 2.2, 2.4, 2.5, 8.1, 8.4_

  - [x] 3.4 Create `lib/api/alerts.ts`
    - Export `fetchAlerts(filters?: AlertFilters): Promise<Alert[]>` — returns `[]`
    - Include JSDoc comment with API contract
    - _Requirements: 2.2, 2.4, 2.5, 8.1, 8.4_

  - [x] 3.5 Create `lib/api/activities.ts`
    - Export `fetchActivities(filters?: ActivityFilters): Promise<Activity[]>` — returns `[]`
    - Export `fetchAuditLogStats(): Promise<AuditLogStats>` — returns `{ last24Hours: 0, lastWeek: 0, activeUsers: 0 }`
    - Include JSDoc comments with API contracts
    - _Requirements: 2.2, 2.4, 2.5, 6.2, 8.1, 8.4_

  - [x] 3.6 Create `lib/api/stock-adjustments.ts`
    - Export `fetchStockAdjustments(): Promise<StockAdjustment[]>` — returns `[]`
    - Export `fetchStockMovementData(): Promise<StockMovementDataPoint[]>` — returns `[]`
    - Export `submitStockAdjustment(payload: StockAdjustmentPayload): Promise<void>` — returns `Promise.resolve()`
    - Include JSDoc comments with API contracts
    - _Requirements: 2.2, 2.4, 2.5, 5.2, 8.1, 8.3, 8.4_

  - [ ]* 3.7 Write property test for service stub resolution (Property 1)
    - **Property 1: Service stub functions return resolved Promises of the correct type**
    - Tag: `// Feature: frontend-production-refactor, Property 1: service stubs return resolved Promises`
    - Use `fast-check` with `fc.asyncProperty` and `fc.integer` to randomly select a stub from all exported stubs across all six `lib/api/` modules
    - Assert that each stub call resolves (never rejects) and returns an array or typed object
    - Run minimum 100 iterations (`numRuns: 100`)
    - **Validates: Requirements 2.5**

- [x] 4. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [x] 5. Refactor chart components to async data-fetching
  - [x] 5.1 Refactor `components/dashboard/stock-movement-chart.tsx`
    - Remove the inline static data array
    - Add `useState<StockMovementDataPoint[]>`, `isLoading`, and `error` state
    - Call `fetchStockMovementData()` from `lib/api/stock-adjustments.ts` in a `useEffect` on mount
    - Render `<Skeleton className="h-[300px]" />` while loading; render inline `<p className="text-destructive text-sm">` on error
    - _Requirements: 5.1, 5.3, 5.6, 5.7_

  - [x] 5.2 Refactor `components/dashboard/inventory-by-branch-chart.tsx`
    - Remove the inline static data array
    - Add `useState<InventoryByBranchDataPoint[]>`, `isLoading`, and `error` state
    - Call `fetchInventoryByBranch()` from `lib/api/inventory.ts` in a `useEffect` on mount
    - Render skeleton while loading; render inline error message on failure
    - _Requirements: 5.1, 5.4, 5.6, 5.7_

  - [x] 5.3 Refactor `components/dashboard/expiring-products-timeline.tsx`
    - Remove the inline static data array
    - Add `useState<ExpirationTimelineDataPoint[]>`, `isLoading`, and `error` state
    - Call `fetchExpirationTimeline()` from `lib/api/inventory.ts` in a `useEffect` on mount
    - Render skeleton while loading; render inline error message on failure
    - _Requirements: 5.1, 5.5, 5.6, 5.7_

  - [ ]* 5.4 Write unit tests for chart component async behavior
    - Test that `StockMovementChart` calls `fetchStockMovementData` on mount (spy + `mockResolvedValue([])`)
    - Test that `StockMovementChart` renders a skeleton while the fetch is pending (never-resolving Promise)
    - Test that `StockMovementChart` renders an inline error message when the fetch rejects
    - Write equivalent three tests for `InventoryByBranchChart` and `ExpiringProductsTimeline`
    - _Requirements: 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 6. Refactor table components to async data-fetching
  - [x] 6.1 Refactor `components/dashboard/recent-activity-table.tsx`
    - Remove mock data import from `@/lib/mock-data`
    - Add `useState<Activity[]>`, `isLoading`, and `error` state
    - Call `fetchActivities()` from `lib/api/activities.ts` in a `useEffect` on mount
    - Silently keep empty array on error; rely on existing "No activities found" empty-state row
    - _Requirements: 2.1, 2.3_

  - [x] 6.2 Refactor `components/stock-ops/adjustment-history-table.tsx`
    - Remove mock data import from `@/lib/mock-data`
    - Add `useState<StockAdjustment[]>`, `isLoading`, and `error` state
    - Call `fetchStockAdjustments()` from `lib/api/stock-adjustments.ts` in a `useEffect` on mount
    - Silently keep empty array on error; rely on existing empty-state row
    - _Requirements: 2.1, 2.3_

- [x] 7. Refactor page-level components to async data-fetching
  - [x] 7.1 Refactor `app/(dashboard)/notifications/page.tsx`
    - Remove mock data import from `@/lib/mock-data`
    - Add `useState<Alert[]>`, `isLoading`, and `error` state
    - Call `fetchAlerts()` from `lib/api/alerts.ts` in a `useEffect` on mount
    - Silently keep empty array on error
    - _Requirements: 2.1, 2.3_

  - [x] 7.2 Refactor `app/(dashboard)/branches/page.tsx`
    - Remove mock data import from `@/lib/mock-data`
    - Add `useState<Branch[]>`, `isLoading`, and `error` state
    - Call `fetchBranches()` from `lib/api/branches.ts` in a `useEffect` on mount
    - Compute total/active/inactive branch counts from the fetched array, not from mock data
    - Silently keep empty array on error
    - _Requirements: 2.1, 2.3_

  - [x] 7.3 Refactor `app/(dashboard)/user-management/page.tsx`
    - Remove mock data import from `@/lib/mock-data`
    - Add `useState<User[]>`, `isLoading`, and `error` state
    - Call `fetchUsers()` from `lib/api/users.ts` in a `useEffect` on mount
    - Compute total/active/inactive user counts from the fetched array
    - Rename the shadow variable `user` in `.map((user) => ...)` to `member` to avoid shadowing the `user` from `useAuth`
    - Silently keep empty array on error
    - _Requirements: 2.1, 2.3, 7.2_

  - [x] 7.4 Refactor `app/(dashboard)/audit-logs/page.tsx`
    - Remove mock data import from `@/lib/mock-data`
    - Add `useState<AuditLogStats | null>`, `statsLoading`, and `statsError` state
    - Call `fetchAuditLogStats()` from `lib/api/activities.ts` in a `useEffect` on mount
    - Render `<Skeleton className="h-8 w-12" />` for each stat while loading; render `--` on error; render resolved values on success
    - Remove the three hardcoded numeric literals (`5`, `18`, `4`) used as stat display values
    - _Requirements: 2.1, 6.1, 6.2, 6.3, 6.4_

  - [x] 7.5 Refactor `app/(dashboard)/inventory/page.tsx`
    - Remove mock data import from `@/lib/mock-data`
    - Add `useState<InventoryItem[]>`, `isLoading`, and `error` state
    - Call `fetchInventoryItems()` from `lib/api/inventory.ts` in a `useEffect` on mount
    - Silently keep empty array on error
    - _Requirements: 2.1, 2.3_

  - [ ]* 7.6 Write unit tests for page-level async data-fetching
    - Test that `AuditLogsPage` calls `fetchAuditLogStats` on mount
    - Test that `AuditLogsPage` renders skeletons while stats are loading
    - Test that `AuditLogsPage` renders `--` for each stat when `fetchAuditLogStats` rejects
    - _Requirements: 6.2, 6.3, 6.4_

- [x] 8. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [x] 9. Replace placeholder event handlers with named, typed stubs
  - [x] 9.1 Add handler stubs to `app/(dashboard)/inventory/page.tsx`
    - Add `handleAddItem(): void` with `// TODO: open add-item modal or navigate to add-item form`
    - Add `handleExportInventory(): void` with `// TODO: call export API and trigger file download`
    - Wire both to their respective buttons; remove any existing `console.log` / `alert` bodies
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 8.2, 8.3_

  - [x] 9.2 Add handler stubs to `components/branches/branch-table.tsx`
    - Add `handleEditBranch(branchId: string): void` with `// TODO: open edit-branch modal`
    - Add `handleDeleteBranch(branchId: string): void` with `// TODO: call delete API with confirmation`
    - Wire both to their respective row action buttons
    - _Requirements: 3.1, 3.2, 3.7, 3.8, 8.2, 8.3_

  - [x] 9.3 Add handler stubs to `app/(dashboard)/branches/page.tsx`
    - Add `handleAddBranch(): void` with `// TODO: open add-branch modal`
    - Wire to the "Add Branch" button
    - _Requirements: 3.1, 3.2, 3.6, 8.2, 8.3_

  - [x] 9.4 Add handler stubs to `app/(dashboard)/user-management/page.tsx`
    - Add `handleAddUser(): void` with `// TODO: open add-user modal`
    - Add `handleEditUser(userId: string): void` with `// TODO: open edit-user modal`
    - Add `handleDeleteUser(userId: string): void` with `// TODO: call delete API with confirmation`
    - Wire all three to their respective buttons; remove any existing placeholder bodies
    - _Requirements: 3.1, 3.2, 3.9, 3.10, 3.11, 8.2, 8.3_

  - [x] 9.5 Add handler stubs to `app/(dashboard)/reports/page.tsx`
    - Add `handleGenerateReport(filters: ReportFilters): void` with `// TODO: call report generation API`
    - Add `handleExportReport(filters: ReportFilters): void` with `// TODO: call export API and trigger file download`
    - Wire both to their respective buttons
    - _Requirements: 3.1, 3.2, 3.12, 3.13, 8.2, 8.3_

  - [x] 9.6 Add handler stubs to `components/layout/header.tsx`
    - Add `handleGlobalSearch(query: string): void` with `// TODO: implement global search`; wire to the search `Input` `onChange`
    - Add `handleViewProfile(): void` with `// TODO: navigate to profile page`; wire to the "Profile" menu item
    - Remove any existing `console.log` / `alert` bodies
    - _Requirements: 3.1, 3.2, 3.14, 3.18, 8.2, 8.3_

  - [x] 9.7 Add handler stubs to `app/(dashboard)/notifications/page.tsx`
    - Add `handleOpenNotificationFilters(): void` with `// TODO: open advanced filter panel`
    - Wire to the "More Filters" button
    - _Requirements: 3.1, 3.2, 3.15, 8.2, 8.3_

  - [x] 9.8 Add handler stubs to `app/(dashboard)/audit-logs/page.tsx`
    - Add `handleOpenAuditFilters(): void` with `// TODO: open advanced filter panel`
    - Add `handleExportAuditLogs(): void` with `// TODO: call export API and trigger file download`
    - Wire both to their respective buttons
    - _Requirements: 3.1, 3.2, 3.16, 3.17, 8.2, 8.3_

  - [x] 9.9 Update `components/stock-ops/stock-adjustment-form.tsx`
    - Change the `onSubmit` prop type from `(data: any) => void` to `(payload: StockAdjustmentPayload) => void`
    - Type the internal `formData` object as `StockAdjustmentPayload`
    - Rename the page-level handler in `app/(dashboard)/stock-operations/page.tsx` to `handleStockAdjustmentSubmit` and type it as `(payload: StockAdjustmentPayload): void` with `// TODO: replace with API call`
    - _Requirements: 3.1, 3.2, 3.3, 8.2, 8.3_

  - [ ]* 9.10 Write unit tests for named handler stubs
    - Test that clicking "Add Item" in `InventoryPage` calls `handleAddItem`
    - Test that clicking "Export" in `InventoryPage` calls `handleExportInventory`
    - Test that clicking "Add Branch" in `BranchesPage` calls `handleAddBranch`
    - Test that clicking "Add User" in `UserManagementPage` calls `handleAddUser`
    - Test that the "Development Only" label is rendered adjacent to the demo accounts panel in `LoginForm`
    - _Requirements: 3.4, 3.5, 3.6, 3.9, 4.5_

- [x] 10. Remove AI-generation artifacts
  - [x] 10.1 Audit and clean `app/` and `components/` for AI artifact strings
    - Search all `.tsx` and `.ts` files under `app/` and `components/` for the patterns `v0`, `generated-by-ai`, `ai-placeholder`, `copilot-generated` (case-insensitive)
    - Remove or replace every match found in comments, class names, HTML `id` attributes, `data-*` attributes, and rendered text strings
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 11. Final checkpoint — Ensure all tests pass and TypeScript compiles cleanly (`tsc --noEmit`), ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- `lib/mock-data.ts` is **not deleted** — it is retained as a reference and for future test fixtures; it simply must not be imported anywhere under `app/` or `components/` after this refactor
- Property tests use `fast-check` (`npm install --save-dev fast-check`) with a minimum of 100 iterations
- TypeScript compilation with `strict: true` and `noImplicitAny: true` is the primary correctness gate for stub typing requirements
- Checkpoints validate incremental progress before moving to the next phase

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "3.1", "3.2", "3.3", "3.4", "3.5", "3.6"] },
    { "id": 2, "tasks": ["2.2", "2.3", "3.7"] },
    { "id": 3, "tasks": ["5.1", "5.2", "5.3", "6.1", "6.2", "7.1", "7.2", "7.3", "7.4", "7.5"] },
    { "id": 4, "tasks": ["5.4", "7.6", "9.1", "9.2", "9.3", "9.4", "9.5", "9.6", "9.7", "9.8", "9.9"] },
    { "id": 5, "tasks": ["9.10", "10.1"] }
  ]
}
```
