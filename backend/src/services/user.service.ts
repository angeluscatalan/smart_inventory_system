import { prisma } from '../lib/prisma'

export async function getUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      assignedBranch: true,
      status: true,
      lastLogin: true,
      // passwordHash intentionally omitted
    },
  })
}
