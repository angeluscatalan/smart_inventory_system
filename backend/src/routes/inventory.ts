import { Router } from 'express'
import { z } from 'zod'
import { authenticate } from '../middleware/auth'
import {
  getInventoryItems,
  getInventoryByBranch,
  getExpirationTimeline,
} from '../services/inventory.service'

const router = Router()

const validStatuses = ['normal', 'low_stock', 'expiring', 'expired'] as const

const inventoryQuerySchema = z.object({
  branchId: z.string().optional(),
  status: z.enum(validStatuses).optional(),
  searchQuery: z.string().optional(),
})

// GET /api/inventory
router.get('/', authenticate, async (req, res) => {
  const parsed = inventoryQuerySchema.safeParse(req.query)

  if (!parsed.success) {
    // Check if the failure is specifically about the status field
    const statusError = parsed.error.errors.find((e) => e.path.includes('status'))
    if (statusError) {
      res.status(400).json({ message: 'Invalid status value', field: 'status' })
      return
    }
    res.status(400).json({ message: 'Invalid query parameters', errors: parsed.error.flatten() })
    return
  }

  const { branchId, status, searchQuery } = parsed.data
  const userRole = req.user!.role
  const userBranch = req.user!.branch

  try {
    const items = await getInventoryItems(
      { branchId, status, searchQuery },
      userRole,
      userBranch,
    )
    res.json(items)
  } catch (err) {
    console.error('[inventory] GET / error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// GET /api/inventory/by-branch
router.get('/by-branch', authenticate, async (_req, res) => {
  try {
    const data = await getInventoryByBranch()
    res.json(data)
  } catch (err) {
    console.error('[inventory] GET /by-branch error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// GET /api/inventory/expiration-timeline
router.get('/expiration-timeline', authenticate, async (_req, res) => {
  try {
    const data = await getExpirationTimeline()
    res.json(data)
  } catch (err) {
    console.error('[inventory] GET /expiration-timeline error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router
