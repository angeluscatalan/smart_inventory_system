import type { Branch } from '@/lib/types'
import { apiFetch } from '@/lib/api/client'

/**
 * GET /api/branches — Returns all branches.
 */
export async function fetchBranches(): Promise<Branch[]> {
  const res = await apiFetch('/api/branches')
  return res.json() as Promise<Branch[]>
}
