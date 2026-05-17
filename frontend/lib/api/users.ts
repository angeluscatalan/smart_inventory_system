import type { User, UserRole } from '@/lib/types'
import { apiFetch } from '@/lib/api/client'

function normalizeRole(role: string): UserRole {
  if (role === 'branch_manager') return 'branch-manager'
  return role as UserRole
}

/**
 * GET /api/users — Returns all users (admin only).
 */
export async function fetchUsers(): Promise<User[]> {
  const res = await apiFetch('/api/users')
  const data = (await res.json()) as Array<Record<string, unknown>>

  // Normalise date strings back to Date objects
  return data.map((user) => ({
    ...user,
    role: normalizeRole(user.role as string),
    lastLogin: user.lastLogin ? new Date(user.lastLogin as string) : new Date(0),
  })) as User[]
}
