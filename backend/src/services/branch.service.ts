import { prisma } from '../lib/prisma'

export async function getBranches() {
  return prisma.branch.findMany()
}
