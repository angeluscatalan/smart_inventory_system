import type { User } from '@/lib/types'
import { apiFetch } from '@/lib/api/client'

/**
 * GET /api/users — Returns all users (admin only).
 */
export async function fetchUsers(): Promise<User[]> {
  const res = await apiFetch('/api/users')
  const data = (await res.json()) as Array<Record<string, unknown>>

  // Normalise date strings back to Date objects
  return data.map((user) => ({
    ...user,
    lastLogin: user.lastLogin ? new Date(user.lastLogin as string) : new Date(0),
  })) as User[]
}
