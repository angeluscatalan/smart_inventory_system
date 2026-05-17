import type {
  StockAdjustment,
  StockAdjustmentPayload,
  StockMovementDataPoint,
} from '@/lib/types'
import { apiFetch } from '@/lib/api/client'

/**
 * GET /api/stock-adjustments — Returns all stock adjustment records.
 */
export async function fetchStockAdjustments(): Promise<StockAdjustment[]> {
  const res = await apiFetch('/api/stock-adjustments')
  const data = (await res.json()) as Array<Record<string, unknown>>

  return data.map((adj) => ({
    ...adj,
    timestamp: new Date(adj.timestamp as string),
  })) as StockAdjustment[]
}

/**
 * GET /api/stock-adjustments/movement — Returns weekly stock movement data
 * (inbound, outbound, net) for chart display.
 */
export async function fetchStockMovementData(): Promise<StockMovementDataPoint[]> {
  const res = await apiFetch('/api/stock-adjustments/movement')
  return res.json() as Promise<StockMovementDataPoint[]>
}

/**
 * POST /api/stock-adjustments — Submits a new stock adjustment.
 */
export async function submitStockAdjustment(payload: StockAdjustmentPayload): Promise<void> {
  await apiFetch('/api/stock-adjustments', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
