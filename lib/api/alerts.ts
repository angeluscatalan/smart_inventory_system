import type { Alert, AlertFilters } from '@/lib/types'

/**
 * GET /api/alerts — Returns all alerts, optionally filtered by type and severity.
 */
export async function fetchAlerts(filters?: AlertFilters): Promise<Alert[]> {
  // TODO: replace with API call
  return []
}
