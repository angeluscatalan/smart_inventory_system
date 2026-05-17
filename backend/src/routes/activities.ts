import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { requireRole } from '../middleware/rbac'
import { getActivities, getActivityStats } from '../services/activity.service'

const router = Router()

// GET /api/activities — admin only
router.get('/', authenticate, requireRole('admin'), async (req, res) => {
  const { searchUser, action } = req.query as { searchUser?: string; action?: string }
  try {
    const activities = await getActivities({ searchUser, action })
    res.json(activities)
  } catch (err) {
    console.error('[activities] GET / error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// GET /api/activities/stats — admin only
router.get('/stats', authenticate, requireRole('admin'), async (_req, res) => {
  try {
    const stats = await getActivityStats()
    res.json(stats)
  } catch (err) {
    console.error('[activities] GET /stats error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router
