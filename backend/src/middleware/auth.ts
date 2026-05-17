import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../lib/env'

export interface JwtPayload {
  sub: string
  role: string
  branch: string
  iat?: number
  exp?: number
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        role: string
        branch: string
      }
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing or malformed Authorization header' })
    return
  }

  const token = authHeader.slice(7) // Remove "Bearer " prefix

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload
    req.user = {
      userId: payload.sub,
      role: payload.role,
      branch: payload.branch,
    }
    next()
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token has expired' })
    } else if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Invalid token' })
    } else {
      res.status(401).json({ message: 'Authentication failed' })
    }
  }
}
