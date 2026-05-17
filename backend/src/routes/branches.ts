import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { getBranches } from '../services/branch.service'

const router = Router()

// GET /api/branches
router.get('/', authenticate, async (_req, res) => {
  try {
    const branches = await getBranches()
    res.json(branches)
  } catch (err) {
    console.error('[branches] GET / error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router
