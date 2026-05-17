import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ─── Enum mappers ────────────────────────────────────────────────────────────

type FrontendUserRole = 'admin' | 'branch-manager' | 'staff'
type FrontendItemStatus = 'normal' | 'low-stock' | 'expiring' | 'expired'
type FrontendAlertType = 'low-stock' | 'expiring' | 'expired' | 'system'

function mapUserRole(role: FrontendUserRole) {
  const map: Record<FrontendUserRole, 'admin' | 'branch_manager' | 'staff'> = {
    admin: 'admin',
    'branch-manager': 'branch_manager',
    staff: 'staff',
  }
  return map[role]
}

function mapItemStatus(status: FrontendItemStatus) {
  const map: Record<FrontendItemStatus, 'normal' | 'low_stock' | 'expiring' | 'expired'> = {
    normal: 'normal',
    'low-stock': 'low_stock',
    expiring: 'expiring',
    expired: 'expired',
  }
  return map[status]
}

function mapAlertType(type: FrontendAlertType) {
  const map: Record<FrontendAlertType, 'low_stock' | 'expiring' | 'expired' | 'system'> = {
    'low-stock': 'low_stock',
    expiring: 'expiring',
    expired: 'expired',
    system: 'system',
  }
  return map[type]
}

// ─── Seed data ────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting seed...')

  // ── 1. Branches ─────────────────────────────────────────────────────────────
  console.log('  Seeding branches...')

  const branches = [
    {
      id: '1',
      name: 'Manila Branch',
      address: 'BGC, Taguig City',
      city: 'Metro Manila',
      manager: 'Maria Santos',
      contact: '0917-123-4567',
      email: 'maria.santos@invsys.ph',
      status: 'active' as const,
    },
    {
      id: '2',
      name: 'Cebu Branch',
      address: 'IT Park, Lahug',
      city: 'Cebu City',
      manager: 'Juan Dela Cruz',
      contact: '0918-234-5678',
      email: 'juan.delacruz@invsys.ph',
      status: 'active' as const,
    },
    {
      id: '3',
      name: 'Davao Branch',
      address: 'JP Laurel Avenue',
      city: 'Davao City',
      manager: 'Rosa Garcia',
      contact: '0919-345-6789',
      email: 'rosa.garcia@invsys.ph',
      status: 'active' as const,
    },
  ]

  for (const branch of branches) {
    await prisma.branch.upsert({
      where: { id: branch.id },
      update: branch,
      create: branch,
    })
  }

  console.log(`  ✓ ${branches.length} branches seeded`)

  // ── 2. Users ─────────────────────────────────────────────────────────────────
  console.log('  Seeding users...')

  const userCredentials: Record<string, { username: string; password: string }> = {
    Administrator:    { username: 'admin',          password: 'password123' },
    'Maria Santos':   { username: 'manila_manager', password: 'manila2024' },
    'Juan Dela Cruz': { username: 'cebu_manager',   password: 'cebu2024' },
    'Rosa Garcia':    { username: 'davao_manager',  password: 'davao2024' },
    'Anna Lopez':     { username: 'manila_staff',   password: 'staff123' },
    'Miguel Rodriguez': { username: 'cebu_staff',   password: 'staff123' },
    'Christine Reyes':  { username: 'davao_staff',  password: 'staff123' },
  }

  const mockUsers = [
    {
      id: '1',
      name: 'Administrator',
      email: 'admin@invsys.ph',
      role: 'admin' as FrontendUserRole,
      assignedBranch: 'All Branches',
      status: 'active' as const,
      lastLogin: new Date(2026, 4, 5, 14, 30),
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria.santos@invsys.ph',
      role: 'branch-manager' as FrontendUserRole,
      assignedBranch: 'Manila Branch',
      status: 'active' as const,
      lastLogin: new Date(2026, 4, 5, 10, 15),
    },
    {
      id: '3',
      name: 'Juan Dela Cruz',
      email: 'juan.delacruz@invsys.ph',
      role: 'branch-manager' as FrontendUserRole,
      assignedBranch: 'Cebu Branch',
      status: 'active' as const,
      lastLogin: new Date(2026, 4, 4, 16, 45),
    },
    {
      id: '4',
      name: 'Rosa Garcia',
      email: 'rosa.garcia@invsys.ph',
      role: 'branch-manager' as FrontendUserRole,
      assignedBranch: 'Davao Branch',
      status: 'active' as const,
      lastLogin: new Date(2026, 4, 5, 9, 0),
    },
    {
      id: '5',
      name: 'Anna Lopez',
      email: 'anna.lopez@invsys.ph',
      role: 'staff' as FrontendUserRole,
      assignedBranch: 'Manila Branch',
      status: 'active' as const,
      lastLogin: new Date(2026, 4, 5, 9, 20),
    },
    {
      id: '6',
      name: 'Miguel Rodriguez',
      email: 'miguel.rodriguez@invsys.ph',
      role: 'staff' as FrontendUserRole,
      assignedBranch: 'Cebu Branch',
      status: 'active' as const,
      lastLogin: new Date(2026, 4, 4, 15, 0),
    },
    {
      id: '7',
      name: 'Christine Reyes',
      email: 'christine.reyes@invsys.ph',
      role: 'staff' as FrontendUserRole,
      assignedBranch: 'Davao Branch',
      status: 'active' as const,
      lastLogin: new Date(2026, 4, 5, 8, 30),
    },
  ]

  // Build a name→id map for use when seeding activities
  const userIdByName: Record<string, string> = {}

  for (const user of mockUsers) {
    const creds = userCredentials[user.name]
    if (!creds) throw new Error(`No credentials found for user: ${user.name}`)

    const passwordHash = await bcrypt.hash(creds.password, 10)

    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        name: user.name,
        email: user.email,
        username: creds.username,
        passwordHash,
        role: mapUserRole(user.role),
        assignedBranch: user.assignedBranch,
        status: user.status,
        lastLogin: user.lastLogin,
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: creds.username,
        passwordHash,
        role: mapUserRole(user.role),
        assignedBranch: user.assignedBranch,
        status: user.status,
        lastLogin: user.lastLogin,
      },
    })

    userIdByName[user.name] = user.id
  }

  console.log(`  ✓ ${mockUsers.length} users seeded`)

  // ── 3. Inventory Items ───────────────────────────────────────────────────────
  console.log('  Seeding inventory items...')

  const inventoryItems = [
    {
      id: '1',
      name: 'Bigas (Rice) - 25kg Bag',
      sku: 'BIG-001',
      quantity: 45,
      price: 1250.00,
      reorderLevel: 50,
      expiryDate: new Date(2027, 6, 15),
      supplier: 'NFA Trading Co.',
      branch: 'Manila Branch',
      status: 'low-stock' as FrontendItemStatus,
      lastRestocked: new Date(2026, 3, 10),
    },
    {
      id: '2',
      name: 'Asukal (Sugar) - 10kg Bag',
      sku: 'ASU-002',
      quantity: 120,
      price: 580.00,
      reorderLevel: 30,
      expiryDate: new Date(2027, 8, 20),
      supplier: 'Central Azucarera',
      branch: 'Manila Branch',
      status: 'normal' as FrontendItemStatus,
      lastRestocked: new Date(2026, 4, 5),
    },
    {
      id: '3',
      name: 'Gatas (Milk) - 1L Carton',
      sku: 'GAT-003',
      quantity: 8,
      price: 95.00,
      reorderLevel: 20,
      expiryDate: new Date(2026, 5, 10),
      supplier: 'Alaska Milk Corp.',
      branch: 'Cebu Branch',
      status: 'expiring' as FrontendItemStatus,
      lastRestocked: new Date(2026, 3, 20),
    },
    {
      id: '4',
      name: 'Mantika (Oil) - 2L Bottle',
      sku: 'MAN-004',
      quantity: 65,
      price: 320.00,
      reorderLevel: 25,
      expiryDate: new Date(2028, 5, 1),
      supplier: 'Bohol Oil Mills',
      branch: 'Manila Branch',
      status: 'normal' as FrontendItemStatus,
      lastRestocked: new Date(2026, 2, 15),
    },
    {
      id: '5',
      name: 'Asin (Salt) - 1kg Pack',
      sku: 'ASN-005',
      quantity: 2,
      price: 45.00,
      reorderLevel: 15,
      expiryDate: new Date(2027, 7, 30),
      supplier: 'Pangasinan Salt Traders',
      branch: 'Davao Branch',
      status: 'low-stock' as FrontendItemStatus,
      lastRestocked: new Date(2026, 1, 1),
    },
    {
      id: '6',
      name: 'Keso (Cheese) - 500g Block',
      sku: 'KES-006',
      quantity: 35,
      price: 280.00,
      reorderLevel: 20,
      expiryDate: new Date(2026, 6, 5),
      supplier: 'Magnolia Dairy',
      branch: 'Cebu Branch',
      status: 'normal' as FrontendItemStatus,
      lastRestocked: new Date(2026, 4, 10),
    },
    {
      id: '7',
      name: 'Itlog (Eggs) - 30-count Tray',
      sku: 'ITL-007',
      quantity: 18,
      price: 250.00,
      reorderLevel: 10,
      expiryDate: new Date(2026, 5, 28),
      supplier: 'San Miguel Poultry',
      branch: 'Manila Branch',
      status: 'expiring' as FrontendItemStatus,
      lastRestocked: new Date(2026, 4, 15),
    },
    {
      id: '8',
      name: 'Tinapay (Bread) - White Loaf',
      sku: 'TIN-008',
      quantity: 250,
      price: 75.00,
      reorderLevel: 100,
      expiryDate: new Date(2026, 5, 25),
      supplier: 'Gardenia Philippines',
      branch: 'Davao Branch',
      status: 'normal' as FrontendItemStatus,
      lastRestocked: new Date(2026, 4, 20),
    },
    {
      id: '9',
      name: 'Toyo (Soy Sauce) - 1L Bottle',
      sku: 'TOY-009',
      quantity: 90,
      price: 85.00,
      reorderLevel: 30,
      expiryDate: new Date(2027, 11, 15),
      supplier: 'Datu Puti Corp.',
      branch: 'Cebu Branch',
      status: 'normal' as FrontendItemStatus,
      lastRestocked: new Date(2026, 3, 1),
    },
    {
      id: '10',
      name: 'Suka (Vinegar) - 1L Bottle',
      sku: 'SUK-010',
      quantity: 75,
      price: 65.00,
      reorderLevel: 25,
      expiryDate: new Date(2027, 9, 10),
      supplier: 'Datu Puti Corp.',
      branch: 'Davao Branch',
      status: 'normal' as FrontendItemStatus,
      lastRestocked: new Date(2026, 2, 20),
    },
    {
      id: '11',
      name: 'Sardinas (Sardines) - 155g Can',
      sku: 'SAR-011',
      quantity: 5,
      price: 32.00,
      reorderLevel: 40,
      expiryDate: new Date(2027, 3, 18),
      supplier: 'Mega Sardines Inc.',
      branch: 'Manila Branch',
      status: 'low-stock' as FrontendItemStatus,
      lastRestocked: new Date(2026, 1, 10),
    },
    {
      id: '12',
      name: 'Noodles (Pancit Canton) - 60g Pack',
      sku: 'NOD-012',
      quantity: 200,
      price: 14.00,
      reorderLevel: 80,
      expiryDate: new Date(2027, 5, 22),
      supplier: 'Lucky Me! / Monde Nissin',
      branch: 'Cebu Branch',
      status: 'normal' as FrontendItemStatus,
      lastRestocked: new Date(2026, 4, 3),
    },
    {
      id: '13',
      name: 'Kape (Coffee) - 250g Pack',
      sku: 'KAP-013',
      quantity: 40,
      price: 195.00,
      reorderLevel: 15,
      expiryDate: new Date(2027, 8, 30),
      supplier: 'Benguet Coffee Traders',
      branch: 'Davao Branch',
      status: 'normal' as FrontendItemStatus,
      lastRestocked: new Date(2026, 3, 25),
    },
    {
      id: '14',
      name: 'Gata (Coconut Milk) - 400ml Can',
      sku: 'GTA-014',
      quantity: 55,
      price: 48.00,
      reorderLevel: 20,
      expiryDate: new Date(2027, 7, 14),
      supplier: 'Fiesta Coconut Products',
      branch: 'Manila Branch',
      status: 'normal' as FrontendItemStatus,
      lastRestocked: new Date(2026, 4, 8),
    },
    {
      id: '15',
      name: 'Patis (Fish Sauce) - 750ml Bottle',
      sku: 'PAT-015',
      quantity: 60,
      price: 72.00,
      reorderLevel: 25,
      expiryDate: new Date(2027, 10, 5),
      supplier: 'Rufina Patis Factory',
      branch: 'Cebu Branch',
      status: 'normal' as FrontendItemStatus,
      lastRestocked: new Date(2026, 2, 12),
    },
    {
      id: '16',
      name: 'Bagoong (Shrimp Paste) - 250g Jar',
      sku: 'BAG-016',
      quantity: 30,
      price: 110.00,
      reorderLevel: 10,
      expiryDate: new Date(2027, 4, 20),
      supplier: 'Barrio Fiesta Foods',
      branch: 'Davao Branch',
      status: 'normal' as FrontendItemStatus,
      lastRestocked: new Date(2026, 3, 15),
    },
    {
      id: '17',
      name: 'Corned Beef - 260g Can',
      sku: 'CRN-017',
      quantity: 3,
      price: 120.00,
      reorderLevel: 30,
      expiryDate: new Date(2026, 5, 15),
      supplier: 'CDO Foodsphere',
      branch: 'Cebu Branch',
      status: 'low-stock' as FrontendItemStatus,
      lastRestocked: new Date(2026, 0, 20),
    },
    {
      id: '18',
      name: 'Calamansi Juice - 1L Bottle',
      sku: 'CAL-018',
      quantity: 45,
      price: 55.00,
      reorderLevel: 20,
      expiryDate: new Date(2026, 6, 10),
      supplier: 'Del Monte Philippines',
      branch: 'Davao Branch',
      status: 'normal' as FrontendItemStatus,
      lastRestocked: new Date(2026, 4, 1),
    },
  ]

  for (const item of inventoryItems) {
    await prisma.inventoryItem.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        price: item.price,
        reorderLevel: item.reorderLevel,
        expiryDate: item.expiryDate,
        supplier: item.supplier,
        branch: item.branch,
        status: mapItemStatus(item.status),
        lastRestocked: item.lastRestocked,
      },
      create: {
        id: item.id,
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        price: item.price,
        reorderLevel: item.reorderLevel,
        expiryDate: item.expiryDate,
        supplier: item.supplier,
        branch: item.branch,
        status: mapItemStatus(item.status),
        lastRestocked: item.lastRestocked,
      },
    })
  }

  console.log(`  ✓ ${inventoryItems.length} inventory items seeded`)

  // ── 4. Activities ────────────────────────────────────────────────────────────
  console.log('  Seeding activities...')

  const mockActivities = [
    {
      id: '1',
      user: 'Maria Santos',
      action: 'Restocked',
      item: 'Asukal (Sugar) - 10kg Bag',
      branch: 'Manila Branch',
      timestamp: new Date(2026, 4, 5, 14, 20),
      details: 'Nagdagdag ng 50 units',
    },
    {
      id: '2',
      user: 'Juan Dela Cruz',
      action: 'Transferred',
      item: 'Gatas (Milk) - 1L Carton',
      branch: 'Cebu Branch',
      timestamp: new Date(2026, 4, 5, 13, 45),
      details: '20 units to Manila Branch',
    },
    {
      id: '3',
      user: 'Christine Reyes',
      action: 'Removed',
      item: 'Tinapay (Bread) - White Loaf',
      branch: 'Davao Branch',
      timestamp: new Date(2026, 4, 5, 12, 30),
      details: '5 units (expired)',
    },
    {
      id: '4',
      user: 'Administrator',
      action: 'Created',
      item: 'System Update',
      branch: 'System',
      timestamp: new Date(2026, 4, 4, 10, 0),
      details: 'Updated inventory settings',
    },
    {
      id: '5',
      user: 'Rosa Garcia',
      action: 'Restocked',
      item: 'Kape (Coffee) - 250g Pack',
      branch: 'Davao Branch',
      timestamp: new Date(2026, 4, 4, 16, 15),
      details: 'Nagdagdag ng 25 units',
    },
  ]

  for (const activity of mockActivities) {
    const userId = userIdByName[activity.user]
    if (!userId) throw new Error(`No user found for activity user name: ${activity.user}`)

    await prisma.activity.upsert({
      where: { id: activity.id },
      update: {
        userId,
        action: activity.action,
        item: activity.item,
        branch: activity.branch,
        timestamp: activity.timestamp,
        details: activity.details,
      },
      create: {
        id: activity.id,
        userId,
        action: activity.action,
        item: activity.item,
        branch: activity.branch,
        timestamp: activity.timestamp,
        details: activity.details,
      },
    })
  }

  console.log(`  ✓ ${mockActivities.length} activities seeded`)

  // ── 5. Stock Adjustments ─────────────────────────────────────────────────────
  console.log('  Seeding stock adjustments...')

  const mockStockAdjustments = [
    {
      id: '1',
      itemId: '2',
      itemName: 'Asukal (Sugar) - 10kg Bag',
      type: 'add' as const,
      quantity: 50,
      fromBranch: null,
      toBranch: 'Manila Branch',
      reason: 'Regular restock',
      user: 'Maria Santos',
      timestamp: new Date(2026, 4, 5, 14, 20),
    },
    {
      id: '2',
      itemId: '3',
      itemName: 'Gatas (Milk) - 1L Carton',
      type: 'transfer' as const,
      quantity: 20,
      fromBranch: 'Cebu Branch',
      toBranch: 'Manila Branch',
      reason: 'Demand adjustment',
      user: 'Juan Dela Cruz',
      timestamp: new Date(2026, 4, 5, 13, 45),
    },
    {
      id: '3',
      itemId: '8',
      itemName: 'Tinapay (Bread) - White Loaf',
      type: 'remove' as const,
      quantity: 5,
      fromBranch: 'Davao Branch',
      toBranch: null,
      reason: 'Expired items',
      user: 'Christine Reyes',
      timestamp: new Date(2026, 4, 5, 12, 30),
    },
  ]

  for (const adj of mockStockAdjustments) {
    await prisma.stockAdjustment.upsert({
      where: { id: adj.id },
      update: {
        itemId: adj.itemId,
        itemName: adj.itemName,
        type: adj.type,
        quantity: adj.quantity,
        fromBranch: adj.fromBranch,
        toBranch: adj.toBranch,
        reason: adj.reason,
        user: adj.user,
        timestamp: adj.timestamp,
      },
      create: {
        id: adj.id,
        itemId: adj.itemId,
        itemName: adj.itemName,
        type: adj.type,
        quantity: adj.quantity,
        fromBranch: adj.fromBranch,
        toBranch: adj.toBranch,
        reason: adj.reason,
        user: adj.user,
        timestamp: adj.timestamp,
      },
    })
  }

  console.log(`  ✓ ${mockStockAdjustments.length} stock adjustments seeded`)

  // ── 6. Alerts ────────────────────────────────────────────────────────────────
  console.log('  Seeding alerts...')

  const mockAlerts = [
    {
      id: '1',
      type: 'low-stock' as FrontendAlertType,
      item: 'Bigas (Rice) - 25kg Bag',
      branch: 'Manila Branch',
      message: 'Stock level below reorder point',
      severity: 'warning' as const,
      timestamp: new Date(2026, 4, 5, 13, 0),
      read: false,
    },
    {
      id: '2',
      type: 'expiring' as FrontendAlertType,
      item: 'Itlog (Eggs) - 30-count Tray',
      branch: 'Manila Branch',
      message: 'Product expires in 12 days',
      severity: 'warning' as const,
      timestamp: new Date(2026, 4, 5, 11, 30),
      read: false,
    },
    {
      id: '3',
      type: 'low-stock' as FrontendAlertType,
      item: 'Asin (Salt) - 1kg Pack',
      branch: 'Davao Branch',
      message: 'Critical stock level',
      severity: 'critical' as const,
      timestamp: new Date(2026, 4, 5, 10, 0),
      read: false,
    },
    {
      id: '4',
      type: 'expiring' as FrontendAlertType,
      item: 'Gatas (Milk) - 1L Carton',
      branch: 'Cebu Branch',
      message: 'Product expires in 3 days',
      severity: 'critical' as const,
      timestamp: new Date(2026, 4, 4, 14, 20),
      read: true,
    },
    {
      id: '5',
      type: 'system' as FrontendAlertType,
      item: null,
      branch: null,
      message: 'System backup completed successfully',
      severity: 'info' as const,
      timestamp: new Date(2026, 4, 3, 2, 0),
      read: true,
    },
    {
      id: '6',
      type: 'low-stock' as FrontendAlertType,
      item: 'Corned Beef - 260g Can',
      branch: 'Cebu Branch',
      message: 'Stock level critically low',
      severity: 'critical' as const,
      timestamp: new Date(2026, 4, 5, 9, 30),
      read: false,
    },
  ]

  for (const alert of mockAlerts) {
    await prisma.alert.upsert({
      where: { id: alert.id },
      update: {
        type: mapAlertType(alert.type),
        item: alert.item,
        branch: alert.branch,
        message: alert.message,
        severity: alert.severity,
        timestamp: alert.timestamp,
        read: alert.read,
      },
      create: {
        id: alert.id,
        type: mapAlertType(alert.type),
        item: alert.item,
        branch: alert.branch,
        message: alert.message,
        severity: alert.severity,
        timestamp: alert.timestamp,
        read: alert.read,
      },
    })
  }

  console.log(`  ✓ ${mockAlerts.length} alerts seeded`)

  console.log('✅ Seed complete!')
  console.log('   Branches:          3')
  console.log('   Users:             7')
  console.log('   Inventory items:  18')
  console.log('   Activities:        5')
  console.log('   Stock adjustments: 3')
  console.log('   Alerts:            6')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
