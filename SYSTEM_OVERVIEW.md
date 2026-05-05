# InvSys PH - Smart Inventory Management System
## Complete System Overview

### 🌍 Project Configuration
- **Location**: Philippines
- **Currency**: Philippine Peso (₱)
- **Language**: English with Filipino Product Names
- **Time Format**: 24-hour (en-PH locale)

---

## 📊 User Accounts & Authentication

### Account Structure (7 Total Accounts)

#### 1. Administrator (1 Account)
- **Username**: `admin`
- **Password**: `password123`
- **Full Name**: Administrator
- **Access Level**: Full system access
- **Features**:
  - View all branches and data
  - Manage all inventory items across all branches
  - Full stock operations (add, remove, transfer)
  - View all reports with previews
  - Manage all users
  - Access audit logs
  - Access branch management

#### 2. Branch Managers (3 Accounts)

**Manila Branch**
- **Username**: `manila_manager`
- **Password**: `manila2024`
- **Full Name**: Maria Santos
- **Branch**: Manila (Bonifacio, Metro Manila)

**Cebu Branch**
- **Username**: `cebu_manager`
- **Password**: `cebu2024`
- **Full Name**: Juan Dela Cruz
- **Branch**: Cebu (Visayas, Cebu City)

**Davao Branch**
- **Username**: `davao_manager`
- **Password**: `davao2024`
- **Full Name**: Rosa Garcia
- **Branch**: Davao (Mindanao, Davao City)

**Branch Manager Permissions**:
- Dashboard (for their branch only)
- Inventory (view & manage their branch items)
- Stock Operations (add, remove, **CAN transfer** stocks)
- Reports (for their branch only, **NO preview**)
- Cannot access: Branches, Users, Audit Logs, Notifications

#### 3. Staff Members (3 Accounts)

**Manila Staff**
- **Username**: `manila_staff`
- **Password**: `staff123`
- **Full Name**: Anna Lopez
- **Branch**: Manila

**Cebu Staff**
- **Username**: `cebu_staff`
- **Password**: `staff123`
- **Full Name**: Miguel Rodriguez
- **Branch**: Cebu

**Davao Staff**
- **Username**: `davao_staff`
- **Password**: `staff123`
- **Full Name**: Christine Reyes
- **Branch**: Davao

**Staff Permissions**:
- Dashboard (for their branch only)
- Inventory (view & manage their branch items)
- Stock Operations (add, remove only - **CANNOT transfer**)
- Cannot access: Branches, Reports, Users, Audit Logs, Notifications

---

## 🏢 Philippine Branches (3 Total)

| Branch Name | Location | Manager | Items | Status |
|------------|----------|---------|-------|--------|
| Manila Branch | Bonifacio, Metro Manila | Maria Santos | 145 | Active |
| Cebu Branch | Visayas, Cebu City | Juan Dela Cruz | 128 | Active |
| Davao Branch | Mindanao, Davao City | Rosa Garcia | 112 | Active |

---

## 📦 Inventory System

### Product Categories
- Pantry (Rice, Sugar, Salt)
- Dairy (Milk, Cheese)
- Oils & Condiments
- Proteins (Eggs, Meat)
- Bakery (Bread, Pastries)

### Status Indicators
- **Normal** (Green): ✓ Stock within optimal range
- **Low Stock** (Yellow/Orange): ⚠ Below minimum threshold
- **Expiring** (Red): 🔴 Expiration date within 30 days
- **Expired** (Red): 🔴 Past expiration date

### Sample Products (Philippine-Named)
- Bigas (Rice) - 25kg Bag
- Asukal (Sugar) - 10kg Bag
- Asin (Salt) - 1kg Pack
- Gatas (Milk) - 1L Carton
- Mantika (Oil) - 2L Bottle
- Itlog (Eggs) - 30-count Tray
- Tinapay (Bread) - White Loaf

### Pricing & Currency
All prices displayed in ₱ (Philippine Peso)
Example: ₱1,250.00 for Rice bag

---

## 🎯 Role-Based Access Control (RBAC)

### Permission Matrix

| Feature | Admin | Branch Manager | Staff |
|---------|-------|-----------------|-------|
| Dashboard | ✓ All branches | ✓ Own branch | ✓ Own branch |
| Inventory | ✓ All | ✓ Own branch | ✓ Own branch |
| Stock Operations | ✓ All | ✓ Own branch | ✓ Own branch |
| - Add Stock | ✓ | ✓ | ✓ |
| - Remove Stock | ✓ | ✓ | ✓ |
| - Transfer Stock | ✓ | ✓ | ✗ |
| Branches | ✓ | ✗ | ✗ |
| Reports | ✓ All, with preview | ✓ Own branch, no preview | ✗ |
| Notifications | ✓ All | ✗ | ✗ |
| Users | ✓ | ✗ | ✗ |
| Audit Logs | ✓ | ✗ | ✗ |

---

## 📄 Pages & Features

### 1. Dashboard
**Accessible to**: All roles
- KPI Cards: Total items, Low stock, Expiring items, Active branches
- Charts (Admin only): Inventory by branch, Stock movement, Expiration timeline
- Recent Activity table with audit trail
- Branch-specific filtering for non-admin users

### 2. Inventory Management
**Accessible to**: All roles
- Searchable product table with sorting
- Status badges (Normal, Low Stock, Expiring, Expired)
- Branch filtering (Admin sees all, others see own branch)
- Unit prices in ₱
- Export functionality

### 3. Stock Operations
**Accessible to**: Admin, Branch Managers, Staff
- Stock Adjustment Form with types:
  - **Add Stock**: Record new inventory
  - **Remove Stock**: Record removals/waste
  - **Transfer Stock**: Inter-branch transfers (not available to Staff)
- Adjustment History Table
- Staff cannot see transfer option

### 4. Branch Management
**Accessible to**: Admin only
- View all branches with manager assignments
- Location information (Philippine cities)
- Item counts per branch
- Status indicators

### 5. Reports
**Accessible to**: Admin (full), Branch Managers (own branch)
- Report Types:
  - Stock Movement
  - Low Stock Alert
  - Expiring Products
  - Branch Performance
- Branch Managers see generated reports but NOT previews
- Inventory value calculations in ₱
- Export functionality

### 6. Notifications/Alerts
**Accessible to**: Admin, Branch Managers
- Alert Types: Low stock, Expiring, Expired, Transfer
- Severity Levels: Critical (red), Warning (orange), Info (green)
- Dismissible alerts
- Branch-specific filtering

### 7. User Management
**Accessible to**: Admin only
- Create, edit, delete users
- Assign roles and branches
- User statistics
- Created date tracking

### 8. Audit Logs
**Accessible to**: Admin only
- Complete activity tracking
- Actions: ADD_STOCK, REMOVE_STOCK, TRANSFER_STOCK, UPDATE, CREATE
- User information
- Target items and details
- Sortable and searchable

---

## 🔐 Authentication System

### Login Flow
1. User visits `/login`
2. Unauthenticated users automatically redirected to login
3. Click any demo account button for quick login, or enter manually
4. Session persisted in localStorage
5. Authenticated users can access dashboard
6. Logout clears session and redirects to login

### Session Management
- localStorage-based persistence
- Survives page refresh
- Auto-logout removes all user data
- No backend required (MVP mode)

---

## 🎨 Design System

### Color Scheme (Philippine-Themed)
- **Primary**: Deep Blue (₱ currency color)
- **Success/Normal**: Green
- **Warning**: Orange/Yellow
- **Critical/Error**: Red
- **Neutral**: Grays and whites
- **Background**: Light off-white

### Typography
- Headings: Geist (Bold, 24-48px)
- Body: Geist (Regular, 14-16px)
- Monospace: Geist Mono (for SKUs, codes)

### Components
- shadcn/ui buttons, cards, tables, inputs
- Recharts for visualizations
- Lucide React icons
- Tailwind CSS utility classes

---

## 📊 Data Structure

### Mock Data Overview
- **Users**: 7 accounts (1 admin, 3 managers, 3 staff)
- **Branches**: 3 Philippine locations
- **Inventory Items**: 18+ products across 3 branches
- **Stock Adjustments**: Sample transaction history
- **Alerts**: Sample notifications (low stock, expiring)
- **Audit Logs**: Sample activity tracking

---

## 🚀 Deployment Notes

### Environment Variables
- No API keys required (mock data only)
- No external services required
- Works as standalone Next.js app

### Build Output
- Optimized production build in `.next/`
- Static routes for performance
- No database required for MVP

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design (mobile, tablet, desktop)
- No special plugins required

---

## 📝 Notes for Users

### Demo Credentials Summary

**Quick Login**:
- Admin: Click "Administrator" card on login page
- Branch Managers: Click their branch manager card
- Staff: Click their staff member card

**Or Manual Entry**:
- Admin: `admin` / `password123`
- Manila Manager: `manila_manager` / `manila2024`
- Cebu Manager: `cebu_manager` / `cebu2024`
- Davao Manager: `davao_manager` / `davao2024`
- Manila Staff: `manila_staff` / `staff123`
- Cebu Staff: `cebu_staff` / `staff123`
- Davao Staff: `davao_staff` / `staff123`

### Testing Tips
1. Log in as different roles to see permission differences
2. Try transferring stock as Staff (feature hidden) vs Manager
3. Compare Report previews: Admin sees all, Manager sees none
4. Verify branch-specific data filtering for non-admin users
5. Check that Staff can't access User Management or Audit Logs

---

## 🔧 Technical Stack

- **Framework**: Next.js 16 with App Router
- **UI Library**: shadcn/ui components
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Icons**: Lucide React
- **Authentication**: Context API + localStorage
- **State Management**: React Context + hooks
- **Type Safety**: TypeScript

---

## 📞 Support

For any issues or questions about the InvSys PH system:
1. Check user roles and permissions
2. Verify branch assignments
3. Ensure proper authentication
4. Check browser console for errors

---

**Last Updated**: May 5, 2026
**Version**: 1.0 - MVP with Role-Based Access Control
