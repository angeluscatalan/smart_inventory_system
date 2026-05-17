import type {
  InventoryItem,
  InventoryFilters,
  InventoryByBranchDataPoint,
  ExpirationTimelineDataPoint,
} from '@/lib/types'
import { apiFetch } from '@/lib/api/client'

/**
 * GET /api/inventory — Returns all inventory items, optionally filtered by branch, status, or search query.
 */
export async function fetchInventoryItems(
  filters?: InventoryFilters,
): Promise<InventoryItem[]> {
  const params = new URLSearchParams()
  if (filters?.branchId) params.set('branchId', filters.branchId)
  if (filters?.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters?.searchQuery) params.set('searchQuery', filters.searchQuery)

  const query = params.toString()
  const res = await apiFetch(`/api/inventory${query ? `?${query}` : ''}`)
  const data = (await res.json()) as Array<Record<string, unknown>>

  // Normalise date strings back to Date objects
  return data.map((item) => ({
    ...item,
    expiryDate: new Date(item.expiryDate as string),
    lastRestocked: new Date(item.lastRestocked as string),
  })) as InventoryItem[]
}

/**
 * GET /api/inventory/by-branch — Returns aggregated inventory counts and values grouped by branch.
 */
export async function fetchInventoryByBranch(): Promise<InventoryByBranchDataPoint[]> {
  const res = await apiFetch('/api/inventory/by-branch')
  return res.json() as Promise<InventoryByBranchDataPoint[]>
}

/**
 * GET /api/inventory/expiration-timeline — Returns expiring product counts grouped by time period.
 */
export async function fetchExpirationTimeline(): Promise<ExpirationTimelineDataPoint[]> {
  const res = await apiFetch('/api/inventory/expiration-timeline')
  return res.json() as Promise<ExpirationTimelineDataPoint[]>
}
