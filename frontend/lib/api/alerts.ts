import type { Alert, AlertFilters } from '@/lib/types'
import { apiFetch } from '@/lib/api/client'

/**
 * GET /api/alerts — Returns all alerts, optionally filtered by type and severity.
 */
export async function fetchAlerts(filters?: AlertFilters): Promise<Alert[]> {
  const params = new URLSearchParams()
  if (filters?.type && filters.type !== 'all') params.set('type', filters.type)
  if (filters?.severity && filters.severity !== 'all') params.set('severity', filters.severity)

  const query = params.toString()
  const res = await apiFetch(`/api/alerts${query ? `?${query}` : ''}`)
  const data = (await res.json()) as Array<Record<string, unknown>>

  // Normalise date strings and map backend enum values to frontend types
  return data.map((alert) => ({
    ...alert,
    // Backend stores 'low_stock', frontend expects 'low-stock'
    type: (alert.type as string).replace('_', '-'),
    timestamp: new Date(alert.timestamp as string),
  })) as Alert[]
}
