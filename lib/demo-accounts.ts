// DEVELOPMENT ONLY — remove before production deployment
import { Shield, Building2, UserCheck } from 'lucide-react'
import type { ComponentType } from 'react'

export interface DemoAccount {
  label: string
  username: string
  password: string
  subtitle: string
}

export interface DemoAccountGroup {
  title: string
  icon: ComponentType<{ className?: string }>
  accounts: DemoAccount[]
}

export const DEMO_CREDENTIALS: Record<string, {
  password: string
  fullName: string
  role: 'admin' | 'branch-manager' | 'staff'
  branch: string
}> = {
  admin:          { password: 'password123', fullName: 'Administrator',    role: 'admin',          branch: 'all' },
  manila_manager: { password: 'manila2024',  fullName: 'Maria Santos',     role: 'branch-manager', branch: 'Manila Branch' },
  cebu_manager:   { password: 'cebu2024',    fullName: 'Juan Dela Cruz',   role: 'branch-manager', branch: 'Cebu Branch' },
  davao_manager:  { password: 'davao2024',   fullName: 'Rosa Garcia',      role: 'branch-manager', branch: 'Davao Branch' },
  manila_staff:   { password: 'staff123',    fullName: 'Anna Lopez',       role: 'staff',          branch: 'Manila Branch' },
  cebu_staff:     { password: 'staff123',    fullName: 'Miguel Rodriguez', role: 'staff',          branch: 'Cebu Branch' },
  davao_staff:    { password: 'staff123',    fullName: 'Christine Reyes',  role: 'staff',          branch: 'Davao Branch' },
}

export const DEMO_ACCOUNT_GROUPS: DemoAccountGroup[] = [
  {
    title: 'Administrator',
    icon: Shield,
    accounts: [
      { label: 'Admin', username: 'admin', password: 'password123', subtitle: 'Full access' },
    ],
  },
  {
    title: 'Branch Managers',
    icon: Building2,
    accounts: [
      { label: 'Maria Santos',   username: 'manila_manager', password: 'manila2024', subtitle: 'Manila Branch' },
      { label: 'Juan Dela Cruz', username: 'cebu_manager',   password: 'cebu2024',   subtitle: 'Cebu Branch' },
      { label: 'Rosa Garcia',    username: 'davao_manager',  password: 'davao2024',  subtitle: 'Davao Branch' },
    ],
  },
  {
    title: 'Staff',
    icon: UserCheck,
    accounts: [
      { label: 'Anna Lopez',       username: 'manila_staff', password: 'staff123', subtitle: 'Manila Branch' },
      { label: 'Miguel Rodriguez', username: 'cebu_staff',   password: 'staff123', subtitle: 'Cebu Branch' },
      { label: 'Christine Reyes',  username: 'davao_staff',  password: 'staff123', subtitle: 'Davao Branch' },
    ],
  },
]
