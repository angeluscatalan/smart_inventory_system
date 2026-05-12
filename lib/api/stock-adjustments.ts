import type {
  StockAdjustment,
  StockAdjustmentPayload,
  StockMovementDataPoint,
} from '@/lib/types'

/**
 * GET /api/stock-adjustments — Returns all stock adjustment records.
 */
export async function fetchStockAdjustments(): Promise<StockAdjustment[]> {
  // TODO: replace with API call
  return []
}

/**
 * GET /api/stock-adjustments/movement — Returns weekly stock movement data
 * (inbound, outbound, net) for chart display.
 */
export async function fetchStockMovementData(): Promise<StockMovementDataPoint[]> {
  // TODO: replace with API call
  return []
}

/**
 * POST /api/stock-adjustments — Submits a new stock adjustment.
 * Payload includes itemId, quantity, adjustmentType, and reason.
 */
export async function submitStockAdjustment(
  payload: StockAdjustmentPayload
): Promise<void> {
  // TODO: replace with API call
  return Promise.resolve()
}
