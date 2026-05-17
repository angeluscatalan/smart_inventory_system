import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { requireRole } from '../middleware/rbac'
import { getUsers } from '../services/user.service'

const router = Router()

// GET /api/users — admin only
router.get('/', authenticate, requireRole('admin'), async (_req, res) => {
  try {
    const users = await getUsers()
    res.json(users)
  } catch (err) {
    console.error('[users] GET / error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router
