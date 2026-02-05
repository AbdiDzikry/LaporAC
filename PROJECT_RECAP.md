# 📋 Rekap Project LaporAC

> **AC Asset Management System**  
> Aplikasi manajemen aset AC berbasis web untuk Dharma Group  
> *Last Updated: 2 Februari 2026*

---

## 🎯 Tujuan Sistem

Aplikasi ini dibuat untuk menyelesaikan masalah-masalah berikut:

1. **Keterlambatan Pelaporan Kerusakan**  
   Staff kesulitan melapor AC rusak → harus cari kontak GA → sering lupa/tertunda

2. **Maintenance Tidak Teratur**  
   Jadwal servis rutin sering terlewat karena tracking manual

3. **Biaya Tidak Terdokumentasi**  
   Sulit tracking total pengeluaran maintenance per tahun untuk budgeting

4. **Data Aset Tersebar**  
   Informasi AC (lokasi, serial number, riwayat) ada di Excel berbeda-beda

**Solusi**: Sistem terintegrasi dengan QR code reporting, auto-scheduling, dan dashboard analytics.

---


---

## ✅ Fitur yang Sudah Selesai

### 1. **Authentication & Authorization**
- Login dengan email/password 
- Role-Based Access Control (RBAC):
  - `super_adminga`: Full access
  - `admin_ga`: GA Staff (manage assets, validate tickets)
  - `technician`: View & update assigned tickets
  - `dept_headga`: Read-only analytics and setting Policy
-
- User Management UI untuk invite & assign roles

### 2. **Asset Management**
**Fitur**:
- CRUD Data AC (Create, Read, Update, Delete)
- Fields: SKU, Name, Brand, Location, PK, Status, Purchase Date
- **QR Code Generator**: Download stiker per unit (PNG) dengan info: SKU, Nama, Lokasi
- Import bulk data dari CSV (258 unit AC berhasil di-import)
- Filter & Search by location, status, brand
- Asset detail view dengan riwayat tickets

**UI**: Table view dengan pagination, filter sidebar, form modal (outline style)

### 3. **Report Form (Public Access - No Login)**
**URL**: `http://localhost:4200/report?sku=XXX`

**Flow**:
1. Staff scan QR code di unit AC fisik
2. Browser buka link → Auto-load asset info (Nama AC, Lokasi, SKU)
3. Input NIK → System cek API eksternal → Auto-fill nama pelapor
4. Pilih kategori masalah:
   - AC Tidak Dingin / Panas
   - Bocor Air / Menetes
   - Suara Berisik / Aneh
   - Mati Total
   - Bau Tidak Sedap
5. Tambah keterangan (opsional)
6. Submit → Ticket created dengan status `pending_validation`

**UI**: Clean, professional card layout (tidak ada elemen "playful")

### 4. **GA Validation Workflow** ✅ (Feature 1 - COMPLETED)
**Business Logic**:
- Staff lapor → Status: `pending_validation`
- GA Staff review:
  - **Validasi (Valid)**: Status → `open` (diteruskan ke teknisi)
  - **Tolak (False Alarm)**: Status → `false_alarm` + auto closed
- Teknisi hanya melihat tiket yang sudah `open` ke atas

**UI - Admin Ticket List**:
- Tab Filter:
  - **Semua**: All tickets
  - **Butuh Validasi**: `pending_validation` tickets (with action buttons)
  - **Open / Proses**: `open`, `assigned`, `in_progress`
  - **Riwayat**: `resolved`, `closed`
- Action Buttons:
  - **Valid** (blue): Approve report
  - **Reject** (red X icon): Mark as false alarm
- Toast notifications untuk feedback

### 5. **Ticket Management (Admin/Teknisi)**
**Fitur**:
- List tickets dengan relasi ke asset & reporter
- Status tracking: `pending_validation` → `open` → `assigned` → `in_progress` → `resolved` → `closed`
- Assign teknisi
- Update progress & resolution notes
- Upload foto bukti (coming soon)
- Track repair cost

**UI**: Table dengan status badges (colored), filter tabs, detail modal

### 6. **Executive Dashboard (Analytics)**
**KPI Cards**:
- Total Assets
- Open Tickets
- Pending Validation Tickets
- Total Maintenance Cost (YTD)

**Charts** (Chart.js):
1. **Ticket Trend**: Line chart (30 hari terakhir)
2. **Top 5 Most Reported Assets**: Bar chart (horizontal)
3. **Tickets by Category**: Pie chart (panas, bocor, berisik, etc.)
4. **Tickets by Location**: Bar chart (per gedung/lantai)

**Target User**: Dept Head untuk monitoring KPI & budgeting

### 7. **Audit Trail System**
**Database**: Tabel `audit_logs`
- Mencatat setiap aksi penting: CREATE, UPDATE, DELETE, LOGIN
- Fields: `user_id`, `action`, `target_table`, `target_id`, `details` (JSONB), `timestamp`

**Service**: `AuditService` (centralized logging)
- Integrated di: `AuthService`, `TicketService`, `AssetService`, `UserService`

**UI**: Activity Log Viewer (Super Admin only)
- Filter by date range, user, action type
- Search by target ID

### 8. **User Management (Super Admin)**
**Fitur**:
- List semua users dengan role
- **Invite User**: Kirim magic link via email (Supabase Auth)
- Assign/Change role
- Deactivate user (soft delete)

**Security**: Row-Level Security (RLS) di Supabase untuk proteksi data

### 9. **UI/UX Design - Corporate Professional**
**Style Guide**:
- **Theme**: Clean, Minimalist, "Outline" aesthetic
- **Colors**:
  - Primary: Gray scale (50-900)
  - Accents: Blue (info), Green (success), Red (error), Yellow (warning)
- **Typography**: Sans-serif, bold headers, readable body text
- **Components**:
  - Outline buttons with hover states
  - Card-based layouts with subtle borders
  - Responsive sidebar navigation
  - Toast notifications (top-right)
  - Form inputs dengan focus rings

**Pages Redesigned**:
- Login Page (corporate branding)
- Dashboard (Bento grid layout)
- Asset List (outline table dengan filters)
- Ticket List (tabs + action buttons)
- Asset Form (minimalist input style)
- Analytics (clean charts)

---

## 🗄️ Database Schema (Supabase)

### **1. `assets` Table** (258 records)
```sql
- id (serial, PK)
- sku (text, unique)
- name (text)
- brand (text)
- location (text)
- pk (text)  -- Kapasitas PK
- status (text)  -- good, needs_repair, retired
- purchase_date (date, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

### **2. `tickets` Table**
```sql
- id (serial, PK)
- asset_id (FK → assets)
- reporter_nik (text)
- reporter_name (text)
- issue_category (text)  -- panas, bocor, berisik, mati, bau, lainnya
- description (text)
- status (enum)  -- pending_validation, open, assigned, in_progress, resolved, closed, false_alarm
- photo_url (text, nullable)
- technician_id (FK → profiles, nullable)
- started_at (timestamp, nullable)
- completed_at (timestamp, nullable)
- resolution_notes (text, nullable)
- repair_cost (decimal, nullable)
- verified_by (FK → profiles, nullable)
- verified_at (timestamp, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

### **3. `profiles` Table** (User Data)
```sql
- id (uuid, PK, FK → auth.users)
- email (text, unique)
- full_name (text)
- role (text)  -- super_admin, admin, technician, dept_head
- created_at (timestamp)
- updated_at (timestamp)
```

### **4. `audit_logs` Table**
```sql
- id (serial, PK)
- user_id (FK → profiles)
- action (text)  -- ASSET_CREATED, TICKET_VALIDATED, LOGIN, etc.
- target_table (text)  -- assets, tickets, profiles
- target_id (text)
- details (jsonb)  -- Snapshot of changes
- ip_address (text, nullable)
- created_at (timestamp)
```

### **5. `maintenance_schedules` Table** (Coming in Feature 2)
```sql
- id (serial, PK)
- asset_id (FK → assets)
- scheduled_date (date)
- completed_date (date, nullable)
- status (enum)  -- scheduled, in_progress, completed, skipped
- ticket_id (FK → tickets, nullable)
- technician_notes (text, nullable)
- created_at (timestamp)
```

---

## 👥 User Roles & Permissions

| Role | Dashboard | Assets | Tickets | Users | Audit Logs | Analytics |
|------|-----------|--------|---------|-------|------------|-----------|
| **Super Admin** | ✅ | ✅ CRUD | ✅ Full | ✅ Manage | ✅ View | ✅ Full |
| **Admin (GA)** | ✅ | ✅ CRUD | ✅ Validate & Assign | ❌ | ❌ | ✅ Full |
| **Technician** | ✅ | 👁️ View | ✅ Update Assigned | ❌ | ❌ | 👁️ Own Stats |
| **Dept Head** | ✅ | 👁️ View | 👁️ View | ❌ | ❌ | ✅ Full |
| **Public/Staff** | ❌ | ❌ | ✅ Create (Report Form) | ❌ | ❌ | ❌ |

---

## 📁 Struktur Project

```
src/app/
├── guards/
│   ├── auth.guard.ts          # Cek apakah user sudah login
│   └── role.guard.ts          # Cek role user untuk akses halaman
│
├── services/
│   ├── auth/
│   │   └── auth.ts            # Login, logout, session check
│   ├── session/
│   │   └── session.ts         # User state management (role, permissions)
│   ├── asset/
│   │   └── asset.ts           # CRUD assets, generate QR codes
│   ├── ticket/
│   │   └── ticket.ts          # CRUD tickets, validate, assign
│   ├── employee/
│   │   └── employee.ts        # Integration dengan API karyawan eksternal
│   ├── audit/
│   │   └── audit.ts           # Centralized activity logging
│   ├── toast/
│   │   └── toast.ts           # Global toast notifications
│   └── supabase/
│       └── supabase.ts        # Supabase client config
│
├── pages/
│   ├── login/                 # Login page (public)
│   ├── dashboard/             # Home dashboard (authenticated)
│   ├── admin/
│   │   ├── assets/
│   │   │   ├── asset-list/    # Table view dengan filter & search
│   │   │   ├── asset-form/    # Add/Edit asset modal
│   │   │   └── asset-detail/  # Detail view + history
│   │   ├── tickets/
│   │   │   ├── ticket-list/   # Table + tabs (All, Pending, Open, History)
│   │   │   └── ticket-detail/ # Detail + assignment + resolution
│   │   ├── users/
│   │   │   └── user-list/     # User management (invite, role)
│   │   └── logs/
│   │       └── log-viewer/    # Audit trail viewer
│   ├── analytics/
│   │   └── dashboard/         # Executive dashboard (charts & KPIs)
│   └── public/
│       └── report-form/       # Public report form (QR scan landing)
│
└── app.routes.ts              # Route config dengan guards
```

---

## 🎉 Status Development

### ✅ **Completed Features** (Production Ready)
1. ✅ Authentication & RBAC
2. ✅ Asset Management + QR Generator
3. ✅ Public Report Form
4. ✅ Ticket Management
5. ✅ **GA Validation Workflow** (Feature 1)
6. ✅ Audit Trail
7. ✅ User Management
8. ✅ Executive Analytics Dashboard
9. ✅ UI Redesign (Corporate Professional)

### 🚧 **In Progress**
- **Feature 2: Preventive Maintenance**
  - ⏳ Planning completed
  - 📝 Ready for execution

### 📝 **Planned (Backlog)**
- Feature 3: Enhanced Audit Trail UI
- Feature 4: Data Export (PDF/Excel)
- Email/Push Notifications
- Mobile PWA

---

## 🚀 Quick Start Guide

### **1. Development Setup**
```bash
# Install dependencies
npm install

# Start dev server
npm start

# Open browser
http://localhost:4200
```

### **2. Login Credentials**
**Super Admin**:
- Email: (check Supabase dashboard)
- Password: (set via "Create Admin Magic" SQL script)

### **3. Sample Workflow**

#### **Scenario: Staff Melapor AC Rusak**
1. Staff scan QR code di unit AC (contoh: `http://localhost:4200/report?sku=GB001`)
2. Form terbuka →Input NIK → Pilih "AC Tidak Dingin" → Submit
3. Laporan masuk dengan status `pending_validation`

#### **Scenario: GA Staff Memvalidasi**
1. Login as Admin
2. Menu **Tickets** → Tab **Butuh Validasi**
3. Review laporan:
   - Klik **Valid** → Status jadi `open` (teknisi bisa akses)
   - Klik **Reject** → Status jadi `false_alarm` (auto closed)

#### **Scenario: Teknisi Menyelesaikan**
1. Login as Technician
2. Lihat ticket yang assigned
3. Update status → `in_progress` → `resolved`
4. Input biaya repair & notes

#### **Scenario: Dept Head Monitor**
1. Login as Dept Head
2. Menu **Analytics**
3. Lihat:
   - Total biaya maintenance bulan ini
   - Top 5 AC sering rusak
   - Trend tickets 30 hari terakhir

---

## 📊 Current Data

### **Assets**
- **Total**: 258 AC units
- **Lokasi**: 
  - Gedung A: Auditorium, Training Room, Meeting Room, Direktur Office
  - Gedung B: SPSI, Klinik, Lobby, Office
  - Gedung C: Chemical, Incoming, Koperasi
  - Gedung D: Engineering Office
- **Brand**: SPLIT, CASSET, Standing (various brands)
- **Status**: Majority "good" (dapat diupdate sesuai kondisi real)

### **Tickets**
- Status distribution akan terlihat di Analytics Dashboard
- Sample categories: panas, bocor, berisik, mati, bau, lainnya

---

## 🔐 Security

1. **Authentication**: Supabase Auth (email/password dengan magic link support)
2. **Authorization**: Row-Level Security (RLS) di Supabase
3. **API Integration**: Header-based authentication untuk external API
4. **Audit Trail**: Semua aksi penting ter-log (who, what, when)
5. **Route Guards**: Protected routes berdasarkan role

---

## 📝 Key Files & Migrations

### **Database Migrations** (Supabase SQL Editor)
1. `create_assets_table.sql` - Struktur tabel assets
2. `create_full_tickets_table.sql` - Struktur tabel tickets (lengkap dengan maker-checker)
3. `create_profiles_table.sql` - User profiles + RLS
4. `create_admin_magic.sql` - Setup admin pertama
5. `update_ticket_status_enum.sql` - Tambah status pending_validation & false_alarm
6. `seed_full_data.sql` - Import 258 asset dari CSV

### **Artifacts (Documentation)**
- `task.md` - Development checklist
- `implementation_plan.md` - Technical plan (overall)
- `pm_implementation_plan.md` - Feature 2 plan (Preventive Maintenance)
- `improvement_proposal.md` - Proposal fitur baru ke stakeholder
- `project_recap.md` - **This file!**

---

## 🎯 Business Impact

### **Sebelum LaporAC**
- ❌ Lapor kerusakan: telpon/chat GA (bisa lupa/tertunda)
- ❌ Jadwal maintenance: Excel manual (sering terlewat)
- ❌ Tracking biaya: Sulit rekap untuk budgeting
- ❌ Data aset: Tersebar di berbagai file

### **Setelah LaporAC**
- ✅ Lapor kerusakan: Scan QR → Langsung masuk sistem (< 1 menit)
- ✅ Validasi GA: Cegah vendor call yang tidak perlu (save cost)
- ✅ Dashboard real-time: KPI, trend, top units bermasalah
- ✅ Audit trail: Transparansi penuh untuk compliance
- ✅ Centralized data: Single source of truth

---

## 🙏 Credits & Acknowledgments

**Developed by**: Sulthan Abdi Dzikry  
**For**: Dharma Group (Magang Program)  
**Tech Stack**: Angular + Supabase + Tailwind CSS  
**Timeline**: Januari - Februari 2026  

---

**Last Updated**: 2 Februari 2026, 14:00 WIB  
**Version**: 1.0 (Feature 1 Complete, Feature 2 In Planning)
