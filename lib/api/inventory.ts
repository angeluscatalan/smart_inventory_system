import type {
  InventoryItem,
  InventoryFilters,
  InventoryByBranchDataPoint,
  ExpirationTimelineDataPoint,
} from '@/lib/types'

/**
 * GET /api/inventory — Returns all inventory items, optionally filtered by branch, status, or search query.
 */
export async function fetchInventoryItems(
  filters?: InventoryFilters
): Promise<InventoryItem[]> {
  // TODO: replace with API call
  return []
}

/**
 * GET /api/inventory/by-branch — Returns aggregated inventory counts and values grouped by branch.
 */
export async function fetchInventoryByBranch(): Promise<InventoryByBranchDataPoint[]> {
  // TODO: replace with API call
  return []
}

/**
 * GET /api/inventory/expiration-timeline — Returns expiring product counts grouped by time period.
 */
export async function fetchExpirationTimeline(): Promise<ExpirationTimelineDataPoint[]> {
  // TODO: replace with API call
  return []
}
