# 🗺️ LaporAC - UI MAP & NAVIGATION

**Visual map of all pages and their relationships**

---

## 📱 APPLICATION FLOW

```
┌─────────────────────────────────────────────────────────────────┐
│                         ENTRY POINTS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐         ┌──────────────┐                     │
│  │   /login     │         │   /report    │                     │
│  │  Login Page  │         │ Report Form  │                     │
│  │              │         │  (Public)    │                     │
│  └──────┬───────┘         └──────┬───────┘                     │
│         │                        │                               │
│         │ (Success)              │ (Submit)                      │
│         ↓                        ↓                               │
│  ┌──────────────┐         ┌──────────────┐                     │
│  │   /dashboard │         │ Ticket Created│                    │
│  │  Dashboard   │         │   (Email)    │                     │
│  └──────┬───────┘         └──────────────┘                     │
│         │                                                        │
└─────────┼────────────────────────────────────────────────────────┘
          │
          │ (Admin Layout with Sidebar)
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ADMIN SECTION                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    SIDEBAR MENU                           │  │
│  │  ───────────────────────────────────────────────────────  │  │
│  │  PRINCIPAL:                                               │  │
│  │    • Dashboard                                            │  │
│  │    • Analytics                                            │  │
│  │                                                           │  │
│  │  OPERATIONAL:                                             │  │
│  │    • Data Aset ──┐                                        │  │
│  │    • Jadwal Maintenance                                   │  │
│  │    • Tiket Laporan ─┐                                     │  │
│  │                                                           │  │
│  │  ADMINISTRATION:                                          │  │
│  │    • Histori & Laporan                                    │  │
│  │    • Manajemen User ─┐                                    │  │
│  │    • System Logs                                          │  │
│  │    • Konfigurasi                                          │  │
│  │    • Pricelist                                            │  │
│  │    • Daftar SPK ─┐                                        │  │
│  │    • Manajemen Vendor ─┐                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 PAGE HIERARCHY

```
ROOT
│
├── 📝 PUBLIC (No Login Required)
│   ├── /login ──────────────────────→ Login Page
│   └── /report ─────────────────────→ Report Form (QR Entry)
│
└── 🔐 ADMIN (Login Required + Role Guard)
    │
    ├── 📊 DASHBOARD & ANALYTICS
    │   ├── /dashboard ──────────────→ Dashboard (KPIs + Charts)
    │   └── /admin/analytics ────────→ Analytics (Advanced Charts)
    │
    ├── 📦 ASSET MANAGEMENT
    │   ├── /admin/assets ───────────→ Asset List (Table/Grid)
    │   │   ├── /admin/assets/new ───→ Add Asset Form
    │   │   ├── /admin/assets/edit/:id → Edit Asset Form
    │   │   ├── /admin/assets/print/:id → Print QR (No Sidebar)
    │   │   └── /admin/assets/:id/history → Asset Timeline ⭐
    │   │
    │   └── [NEW FEATURES]
    │       ├── Warranty Badges (Green/Gray/Blue) ⭐
    │       └── History Button (Purple Clock Icon) ⭐
    │
    ├── 🔧 MAINTENANCE
    │   ├── /admin/maintenance ──────→ Schedule List
    │   └── /admin/maintenance/generate → Wizard
    │
    ├── 🎫 TICKET MANAGEMENT
    │   ├── /admin/tickets ──────────→ Ticket List (Tabs)
    │   │   └── /admin/tickets/:id ──→ Ticket Detail (5 Stages)
    │   │
    │   └── WORKFLOW
    │       └── Pending → Open → Assigned → In Progress →
    │           Resolved → Verified → Closed
    │
    ├── 👥 USER MANAGEMENT
    │   ├── /admin/users ────────────→ User List
    │   ├── /admin/users/create ─────→ Add User Form
    │   ├── /admin/users/edit/:id ───→ Edit User Form
    │   ├── /admin/users/roles ──────→ Role List
    │   │   └── [NEW] Manage Permissions Button ⭐
    │   │
    │   └── /admin/users/roles/:id/permissions → Permission UI ⭐
    │       ├── Checkbox Interface
    │       ├── Section Grouping
    │       └── Quick Actions
    │
    ├── 🏢 VENDOR MANAGEMENT ⭐ NEW
    │   ├── /admin/vendors ──────────→ Vendor List
    │   │   ├── Stats Cards (4)
    │   │   ├── Search & Filter
    │   │   └── Detail Modal
    │   │
    │   └── /admin/vendors/new ──────→ Add Vendor Form
    │       └── /admin/vendors/edit/:id → Edit Vendor Form
    │
    ├── 📋 SPK MANAGEMENT
    │   ├── /admin/spk ──────────────→ SPK List
    │   │   ├── Warranty Badge (Pink) ⭐
    │   │   └── Status Filters
    │   │
    │   └── /admin/spk/:id ──────────→ SPK Detail
    │       ├── Items List
    │       ├── Status Workflow
    │       ├── PDF Download
    │       └── [NEW] Generate BA Button ⭐
    │
    ├── 📜 CONFIGURATION
    │   ├── /admin/history ──────────→ Global History
    │   │   └── News Reports (Berita Acara)
    │   │
    │   ├── /admin/logs ─────────────→ System Logs
    │   ├── /admin/configs ──────────→ App Configs
    │   └── /admin/pricelist ────────→ Pricelist Management
    │
    └── 🔍 SUPPORT
        └── (All routes have 404 handler → /login)
```

---

## 🎯 COMPONENT TREE

```
App Root
│
├── AppComponent
│   │
│   └── RouterOutlet
│       │
│       ├── LoginComponent (Public)
│       ├── ReportFormComponent (Public)
│       │
│       └── AdminLayout (Protected)
│           │
│           ├── Sidebar Component ⭐
│           │   ├── Dynamic Menu (Permission-based)
│           │   ├── Brand Section
│           │   ├── Navigation Sections
│           │   │   ├── Principal (2 items)
│           │   │   ├── Operational (3 items)
│           │   │   └── Administration (5+ items)
│           │   ├── User Profile Footer
│           │   └── Logout Button
│           │
│           └── RouterOutlet (Admin Pages)
│               │
│               ├── DashboardComponent
│               ├── AnalyticsComponent
│               │
│               ├── Asset Pages
│               │   ├── AssetListComponent
│               │   ├── AssetFormComponent
│               │   ├── PrintQrComponent
│               │   └── AssetHistoryComponent ⭐
│               │
│               ├── Maintenance Pages
│               │   └── Maintenance Routes
│               │
│               ├── Ticket Pages
│               │   ├── TicketListComponent
│               │   └── TicketDetailComponent
│               │
│               ├── User Pages
│               │   ├── UserListComponent
│               │   ├── UserFormComponent
│               │   ├── RoleListComponent
│               │   └── RolePermissionsComponent ⭐
│               │
│               ├── Vendor Pages ⭐
│               │   ├── VendorListComponent
│               │   └── VendorFormComponent
│               │
│               ├── SPK Pages
│               │   ├── SpkListComponent
│               │   └── SpkDetailComponent
│               │
│               └── Config Pages
│                   ├── HistoryComponent
│                   ├── LogsComponent
│                   ├── ConfigsComponent
│                   └── PricelistComponent
│
└── Shared Components
    ├── CustomDropdownComponent
    ├── ToastComponent
    └── (SweetAlert2 Service - External)
```

---

## 🔄 USER FLOW EXAMPLES

### **Flow 1: Staff Reports AC Issue**
```
1. Staff scans QR code on AC unit
   ↓
2. Opens /report?sku=GB001
   ↓
3. Fills form (NIK auto-verifies name)
   ↓
4. Submits report
   ↓
5. Ticket created with status: "pending_validation"
   ↓
6. Email notification sent to reporter
```

### **Flow 2: Admin Validates Ticket**
```
1. Admin logs in → /admin/tickets
   ↓
2. Sees tab "Butuh Validasi" with count
   ↓
3. Reviews ticket details
   ↓
4. Clicks "Valid" or "Reject"
   ↓
5. If Valid → Status: "open" → Technician can see
   ↓
6. If Reject → Status: "false_alarm" → Auto-closed
```

### **Flow 3: Technician → Vendor Escalation**
```
1. Technician assigned to ticket
   ↓
2. Inspects AC → Confirms damage
   ↓
3. Determines needs vendor specialist
   ↓
4. Selects vendor from dropdown
   ↓
5. Creates SPK (Surat Perintah Kerja)
   ↓
6. SPK sent to vendor (email)
   ↓
7. Vendor accepts and works
   ↓
8. Vendor completes + uploads photos
   ↓
9. Admin generates Berita Acara ⭐
   ↓
10. Warranty period starts (3 months) ⭐
```

### **Flow 4: Permission Management** ⭐ NEW
```
1. Super Admin → /admin/users/roles
   ↓
2. Clicks "Manage Permissions" on a role
   ↓
3. Sees checkbox interface with sections
   ↓
4. Checks/unchecks menus
   ↓
5. Clicks "Save Permission"
   ↓
6. Permissions updated in database
   ↓
7. User with that role logs in
   ↓
8. Sidebar shows only assigned menus ⭐
```

### **Flow 5: Asset History Review** ⭐ NEW
```
1. Admin → /admin/assets
   ↓
2. Sees asset with warranty badge (e.g., "2mo LEFT")
   ↓
3. Clicks purple clock icon (History)
   ↓
4. Opens /admin/assets/:id/history
   ↓
5. Sees:
   - Asset info card
   - Warranty status with progress bar
   - Timeline of all tickets/SPKs
   - Statistics (total repairs, cost)
   ↓
6. Clicks timeline item for detail modal
   ↓
7. Can navigate to ticket/SPK detail
```

---

## 📱 RESPONSIVE BEHAVIOR

```
┌─────────────────────────────────────────────────────────┐
│ DESKTOP (≥1024px)                                       │
├─────────────────────────────────────────────────────────┤
│ ┌────────┐ ┌──────────────────────────────────────┐   │
│ │        │ │                                      │   │
│ │Sidebar │ │         Main Content Area            │   │
│ │(280px) │ │         - Dashboard                  │   │
│ │Expanded│ │         - Tables                     │   │
│ │        │ │         - Forms                      │   │
│ │        │ │         - Charts                     │   │
│ └────────┘ └──────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ TABLET (768px - 1023px)                                 │
├─────────────────────────────────────────────────────────┤
│ ┌───────┐ ┌───────────────────────────────────────┐    │
│ │       │ │                                       │    │
│ │Sidebar│ │        Main Content Area              │    │
│ │(84px) │ │        - Responsive Tables            │    │
│ │       │ │        - 2-column Grids               │    │
│ │       │ │                                       │    │
│ └───────┘ └───────────────────────────────────────┘    │
│          (Sidebar expands on hover to 280px)            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ MOBILE (<768px)                                         │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐    │
│ │              Main Content Area                  │    │
│ │              - Full Width                       │    │
│ │              - Stacked Forms                    │    │
│ │              - Horizontal Scroll Tables         │    │
│ └─────────────────────────────────────────────────┘    │
│                                                         │
│ (Sidebar becomes hamburger menu or bottom nav)          │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 VISUAL HIERARCHY

```
Priority 1 (Most Important)
├── Dashboard KPIs (Large numbers, gradients)
├── Status Badges (Color-coded)
└── Action Buttons (Primary blue)

Priority 2 (Important)
├── Page Titles (2xl, bold)
├── Table Headers (uppercase, bold)
└── Section Headers (lg, semibold)

Priority 3 (Supporting)
├── Body Text (base, regular)
├── Secondary Text (sm, gray-600)
└── Labels (xs, uppercase)

Priority 4 (Decorative)
├── Icons (consistent 16-20px)
├── Dividers (border-gray-200)
└── Backgrounds (gray-50)
```

---

## ⭐ NEW UI ELEMENTS (This Session)

### **1. Permission Checkbox Interface**
```
┌────────────────────────────────────────────┐
│  PRINCIPAL SECTION (Blue)                  │
│  ☑ Dashboard                               │
│  ☑ Analytics                               │
├────────────────────────────────────────────┤
│  OPERATIONAL SECTION (Green)               │
│  ☑ Data Aset                               │
│  ☐ Jadwal Maintenance                      │
│  ☑ Tiket Laporan                           │
├────────────────────────────────────────────┤
│  ADMINISTRATION SECTION (Purple)           │
│  ☑ Histori & Laporan                       │
│  ☐ Manajemen User                          │
│  ☐ System Logs                             │
└────────────────────────────────────────────┘
```

### **2. Vendor Stats Cards**
```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Total    │ │ Aktif    │ │ Total    │ │ Rating   │
│ Vendor   │ │ Vendor   │ │ Pekerjaan│ │ Rata-rata│
│   12     │ │    8     │ │   45     │ │   4.5    │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

### **3. Asset Warranty Badge**
```
┌─────────────────────────────────┐
│ Status: Normal                  │
│ ┌──────────────────────────┐   │
│ │ 🛡️ 2mo LEFT (Green)      │   │ ← Under warranty
│ └──────────────────────────┘   │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Status: Rusak                   │
│ ┌──────────────────────────┐   │
│ │ 🛡️ EXPIRED (45d) (Gray)  │   │ ← Warranty expired
│ └──────────────────────────┘   │
└─────────────────────────────────┘
```

### **4. SPK Warranty Claim Badge**
```
┌─────────────────────────────────────┐
│ SPK-20260226-1234                   │
│ ┌──────────────────────────────┐   │
│ │ 🏷️ KLAIM GARANSI (Pink)     │   │ ← Warranty claim
│ └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

### **5. Timeline View**
```
┌─────────────────────────────────────┐
│ 📅 Timeline Riwayat                 │
│                                     │
│ ● Ticket Laporan (Blue)             │
│   26 Feb 2026, 10:30                │
│   "AC Tidak Dingin"                 │
│                                     │
│ ● SPK (Purple)                      │
│   27 Feb 2026, 14:00                │
│   "SPK-20260227-5678"               │
│   🏷️ KLAIM GARANSI                 │
│                                     │
│ ● Maintenance (Green)               │
│   01 Mar 2026, 09:00                │
│   "Servis Rutin"                    │
└─────────────────────────────────────┘
```

---

## 📊 NAVIGATION STATISTICS

**Total Routes:** 30+  
**Total Pages:** 25  
**Lazy Loaded:** 20+  
**Public Pages:** 2  
**Protected Pages:** 23  

**Menu Items by Section:**
- Principal: 2 items
- Operational: 3 items
- Administration: 8+ items
- Total: 13+ items

**New This Session:**
- Pages: 4 (Vendor List/Form, Asset History, Role Permissions)
- Routes: 6
- Components: 6
- UI Patterns: 5 (Permission checkboxes, Vendor stats, Warranty badges, Timeline, BA button)

---

**Last Updated**: 26 Februari 2026  
**Status**: Complete & Production Ready ✅
