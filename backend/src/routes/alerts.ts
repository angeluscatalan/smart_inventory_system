import { Router } from 'express'
import { z } from 'zod'
import { authenticate } from '../middleware/auth'
import { getAlerts } from '../services/alert.service'
import type { AlertType, AlertSeverity } from '../services/alert.service'

const router = Router()

const validAlertTypes = ['low_stock', 'expiring', 'expired', 'system'] as const
const validSeverities = ['info', 'warning', 'critical'] as const

const alertQuerySchema = z.object({
  type: z.enum(validAlertTypes).optional(),
  severity: z.enum(validSeverities).optional(),
})

// GET /api/alerts
router.get('/', authenticate, async (req, res) => {
  const parsed = alertQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    const severityError = parsed.error.errors.find((e) => e.path.includes('severity'))
    if (severityError) {
      res.status(400).json({ message: 'Invalid severity value', field: 'severity' })
      return
    }
    res.status(400).json({ message: 'Invalid query parameters', errors: parsed.error.flatten() })
    return
  }

  try {
    const alerts = await getAlerts({
      type: parsed.data.type as AlertType | undefined,
      severity: parsed.data.severity as AlertSeverity | undefined,
    })
    res.json(alerts)
  } catch (err) {
    console.error('[alerts] GET / error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router
