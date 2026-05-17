import { prisma } from '../lib/prisma'

export interface ActivityFilters {
  searchUser?: string
  action?: string
}

export async function getActivities(filters: ActivityFilters) {
  return prisma.activity.findMany({
    where: {
      ...(filters.searchUser
        ? { user: { name: { contains: filters.searchUser } } }
        : {}),
      ...(filters.action && filters.action !== 'all'
        ? { action: filters.action }
        : {}),
    },
    include: { user: { select: { name: true } } },
    orderBy: { timestamp: 'desc' },
  })
}

export async function getActivityStats() {
  const now = new Date()
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [last24Hours, lastWeekCount, activeUsersResult] = await Promise.all([
    prisma.activity.count({ where: { timestamp: { gte: last24h } } }),
    prisma.activity.count({ where: { timestamp: { gte: lastWeek } } }),
    prisma.activity.groupBy({ by: ['userId'], _count: { userId: true } }),
  ])

  return {
    last24Hours,
    lastWeek: lastWeekCount,
    activeUsers: activeUsersResult.length,
  }
}
