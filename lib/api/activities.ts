import type { Activity, ActivityFilters, AuditLogStats } from '@/lib/types'

/**
 * GET /api/activities — Returns all activity log entries, optionally filtered by user or action type.
 */
export async function fetchActivities(filters?: ActivityFilters): Promise<Activity[]> {
  // TODO: replace with API call
  return []
}

/**
 * GET /api/activities/stats — Returns aggregate statistics for the audit log page (last 24 hours count, last week count, active users count).
 */
export async function fetchAuditLogStats(): Promise<AuditLogStats> {
  // TODO: replace with API call
  return { last24Hours: 0, lastWeek: 0, activeUsers: 0 }
}
