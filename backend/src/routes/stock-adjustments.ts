import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { requireMinRole } from '../middleware/rbac'
import {
  getStockAdjustments,
  getStockMovement,
  createStockAdjustment,
  stockAdjustmentSchema,
} from '../services/stock.service'

const router = Router()

// GET /api/stock-adjustments
router.get('/', authenticate, async (_req, res) => {
  try {
    const adjustments = await getStockAdjustments()
    res.json(adjustments)
  } catch (err) {
    console.error('[stock] GET / error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// GET /api/stock-adjustments/movement
router.get('/movement', authenticate, async (_req, res) => {
  try {
    const data = await getStockMovement()
    res.json(data)
  } catch (err) {
    console.error('[stock] GET /movement error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// POST /api/stock-adjustments — branch-manager or above
router.post('/', authenticate, requireMinRole('branch-manager'), async (req, res) => {
  const parsed = stockAdjustmentSchema.safeParse(req.body)
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]
    res.status(400).json({
      message: firstError?.message ?? 'Validation error',
      field: firstError?.path[0] ?? undefined,
      errors: parsed.error.flatten(),
    })
    return
  }

  try {
    const actingUserId = req.user!.userId
    const adjustment = await createStockAdjustment(parsed.data, actingUserId)
    res.status(201).json(adjustment)
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string }
    if (e.status === 422 || e.status === 404) {
      res.status(e.status).json({ message: e.message })
      return
    }
    console.error('[stock] POST / error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router
