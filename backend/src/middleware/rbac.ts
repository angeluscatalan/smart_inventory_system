import { Request, Response, NextFunction } from 'express'

// Role hierarchy: admin > branch_manager > staff
// Note: Prisma stores roles with underscores (branch_manager), but JWT payload uses hyphens (branch-manager)
// We normalize to handle both formats
const ROLE_HIERARCHY: Record<string, number> = {
  admin: 3,
  branch_manager: 2,
  'branch-manager': 2,
  staff: 1,
}

/**
 * Middleware factory that restricts access to users with one of the specified roles.
 * Requires `authenticate` middleware to run first (sets req.user).
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' })
      return
    }

    const userRole = req.user.role
    const isAllowed = allowedRoles.some(
      (role) =>
        role === userRole ||
        // Normalize: treat 'branch-manager' and 'branch_manager' as equivalent
        (role === 'branch_manager' && userRole === 'branch-manager') ||
        (role === 'branch-manager' && userRole === 'branch_manager'),
    )

    if (!isAllowed) {
      res.status(403).json({ message: 'Insufficient permissions' })
      return
    }

    next()
  }
}

/**
 * Middleware factory that restricts access to users with at least the specified role level.
 * e.g., requireMinRole('branch-manager') allows both branch-manager and admin.
 */
export function requireMinRole(minRole: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' })
      return
    }

    const userLevel = ROLE_HIERARCHY[req.user.role] ?? 0
    const minLevel = ROLE_HIERARCHY[minRole] ?? 0

    if (userLevel < minLevel) {
      res.status(403).json({ message: 'Insufficient permissions' })
      return
    }

    next()
  }
}
