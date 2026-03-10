-- ============================================
-- LAPORAC - DATABASE MIGRATION SUMMARY
-- ============================================
-- File: DATABASE_CHANGES_SUMMARY.sql
-- Date: 26 Februari 2026
-- Description: Ringkasan semua perubahan database yang diperlukan
-- ============================================

-- ============================================
-- 1. TABEL BARU: menu_permissions
-- ============================================
-- Untuk manajemen permission menu berbasis role
CREATE TABLE IF NOT EXISTS menu_permissions (
    id BIGSERIAL PRIMARY KEY,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    menu_route VARCHAR(255) NOT NULL,
    menu_label VARCHAR(100) NOT NULL,
    menu_icon VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (role_id, menu_route)
);

CREATE INDEX IF NOT EXISTS idx_menu_permissions_role_active ON menu_permissions(role_id, is_active);

-- ============================================
-- 2. TABEL BARU: vendor_profiles
-- ============================================
-- Untuk menyimpan informasi detail vendor
CREATE TABLE IF NOT EXISTS vendor_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    company_address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    npwp VARCHAR(50),
    bank_name VARCHAR(100),
    bank_account VARCHAR(50),
    account_holder VARCHAR(100),
    specialties JSONB,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'active',
    rating DECIMAL(3,2) DEFAULT 0.00,
    completed_jobs INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_profiles_status_rating ON vendor_profiles(status, rating);

-- ============================================
-- 3. TABEL BARU: news_reports
-- ============================================
-- Untuk menyimpan Berita Acara perbaikan
CREATE TABLE IF NOT EXISTS news_reports (
    id BIGSERIAL PRIMARY KEY,
    document_number VARCHAR(100) UNIQUE NOT NULL,
    spk_id BIGINT NOT NULL REFERENCES spks(id) ON DELETE CASCADE,
    asset_id BIGINT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    ticket_id BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    report_date DATE NOT NULL,
    completion_date DATE NOT NULL,
    total_cost DECIMAL(15,2) DEFAULT 0,
    is_warranty_claim BOOLEAN DEFAULT false,
    work_description TEXT,
    parts_replaced JSONB,
    recommendations TEXT,
    generated_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    approved_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    vendor_signed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    vendor_signed_at TIMESTAMP,
    approved_at TIMESTAMP,
    pdf_path VARCHAR(255),
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_reports_document_status ON news_reports(document_number, status);
CREATE INDEX IF NOT EXISTS idx_news_reports_dates ON news_reports(report_date, completion_date);

-- ============================================
-- 4. TABEL BARU: pricelist_logs (sudah ada, pastikan struktur benar)
-- ============================================
-- Untuk tracking perubahan pricelist
-- Note: Tabel ini seharusnya sudah ada dari migration sebelumnya

-- ============================================
-- 5. UPDATE TABEL: spks
-- ============================================
-- Menambahkan field untuk signature dan workflow
ALTER TABLE spks 
ADD COLUMN IF NOT EXISTS approved_by_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS vendor_signed_by_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS vendor_signed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS vendor_notes TEXT,
ADD COLUMN IF NOT EXISTS work_start_date DATE,
ADD COLUMN IF NOT EXISTS work_end_date DATE,
ADD COLUMN IF NOT EXISTS spk_type VARCHAR(50) DEFAULT 'repair';

CREATE INDEX IF NOT EXISTS idx_spks_status_warranty ON spks(status, is_warranty_claim);

-- ============================================
-- 6. UPDATE TABEL: tickets
-- ============================================
-- Menambahkan field untuk warranty tracking
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS assigned_vendor_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS resolution_category VARCHAR(50),
ADD COLUMN IF NOT EXISTS is_warranty_work BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS warranty_start_date DATE,
ADD COLUMN IF NOT EXISTS warranty_end_date DATE,
ADD COLUMN IF NOT EXISTS news_report_id BIGINT REFERENCES news_reports(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tickets_status_warranty ON tickets(status, is_warranty_work);

-- ============================================
-- 7. UPDATE TABEL: assets
-- ============================================
-- Menambahkan field untuk warranty dan repair tracking
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS warranty_status VARCHAR(50) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS warranty_months INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS last_repair_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_repair_spk_id BIGINT REFERENCES spks(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS total_repairs INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_repair_cost DECIMAL(15,2) DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_assets_warranty ON assets(warranty_status, warranty_expiry);

-- ============================================
-- 8. SEED DATA: Menu Permissions
-- ============================================
-- Insert default menu permissions untuk setiap role

-- Pertama, pastikan roles ada
INSERT INTO roles (name, description, created_at, updated_at) VALUES
    ('super_admin', 'Full system access with all permissions', NOW(), NOW()),
    ('admin', 'Administrative access for daily operations', NOW(), NOW()),
    ('technician', 'Technical staff for maintenance and repairs', NOW(), NOW()),
    ('vendor', 'External vendor for specialized repairs', NOW(), NOW()),
    ('staff', 'Regular staff with reporting access only', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Dapatkan role IDs (akan di-handle di application seeder)
-- Atau bisa manual seperti di bawah:

-- Super Admin - All menus
INSERT INTO menu_permissions (role_id, menu_route, menu_label, menu_icon, sort_order, is_visible, is_active)
SELECT 
    r.id,
    unnest(ARRAY['/dashboard', '/admin/analytics', '/admin/assets', '/admin/maintenance', '/admin/tickets', '/admin/history', '/admin/users', '/admin/users/roles', '/admin/logs', '/admin/configs', '/admin/pricelist', '/admin/spk', '/admin/vendors']),
    unnest(ARRAY['Dashboard', 'Analitik', 'Data Aset', 'Jadwal Maintenance', 'Tiket Laporan', 'Histori & Laporan', 'Manajemen User', 'Manajemen Roles', 'System Logs', 'Konfigurasi', 'Pricelist', 'Daftar SPK', 'Manajemen Vendor']),
    unnest(ARRAY['dashboard', 'analytics', 'assets', 'maintenance', 'tickets', 'history', 'users', 'roles', 'logs', 'configs', 'pricelist', 'spk', 'vendors']),
    generate_series(0, 12),
    true,
    true
FROM roles r 
WHERE r.name = 'super_admin'
ON CONFLICT (role_id, menu_route) DO NOTHING;

-- Admin - Most menus except vendor management
INSERT INTO menu_permissions (role_id, menu_route, menu_label, menu_icon, sort_order, is_visible, is_active)
SELECT 
    r.id,
    unnest(ARRAY['/dashboard', '/admin/analytics', '/admin/assets', '/admin/maintenance', '/admin/tickets', '/admin/history', '/admin/users', '/admin/users/roles', '/admin/logs', '/admin/configs', '/admin/pricelist', '/admin/spk']),
    unnest(ARRAY['Dashboard', 'Analitik', 'Data Aset', 'Jadwal Maintenance', 'Tiket Laporan', 'Histori & Laporan', 'Manajemen User', 'Manajemen Roles', 'System Logs', 'Konfigurasi', 'Pricelist', 'Daftar SPK']),
    unnest(ARRAY['dashboard', 'analytics', 'assets', 'maintenance', 'tickets', 'history', 'users', 'roles', 'logs', 'configs', 'pricelist', 'spk']),
    generate_series(0, 11),
    true,
    true
FROM roles r 
WHERE r.name = 'admin'
ON CONFLICT (role_id, menu_route) DO NOTHING;

-- Technician - Limited access
INSERT INTO menu_permissions (role_id, menu_route, menu_label, menu_icon, sort_order, is_visible, is_active)
SELECT 
    r.id,
    unnest(ARRAY['/dashboard', '/admin/analytics', '/admin/assets', '/admin/tickets', '/admin/history']),
    unnest(ARRAY['Dashboard', 'Analitik', 'Data Aset', 'Tiket Laporan', 'Histori & Laporan']),
    unnest(ARRAY['dashboard', 'analytics', 'assets', 'tickets', 'history']),
    generate_series(0, 4),
    true,
    true
FROM roles r 
WHERE r.name = 'technician'
ON CONFLICT (role_id, menu_route) DO NOTHING;

-- Vendor - Only SPK/Tickets
INSERT INTO menu_permissions (role_id, menu_route, menu_label, menu_icon, sort_order, is_visible, is_active)
SELECT 
    r.id,
    unnest(ARRAY['/dashboard', '/admin/tickets']),
    unnest(ARRAY['Dashboard', 'Daftar SPK']),
    unnest(ARRAY['dashboard', 'tickets']),
    generate_series(0, 1),
    true,
    true
FROM roles r 
WHERE r.name = 'vendor'
ON CONFLICT (role_id, menu_route) DO NOTHING;

-- ============================================
-- 9. UPDATE CONFIG: Tambah warranty duration
-- ============================================
INSERT INTO app_configs (identifier, value, description, created_at, updated_at) VALUES
    ('warranty_duration_months', '3', 'Duration of warranty period in months after repair', NOW(), NOW()),
    ('smtp_host', '', 'SMTP server host for email notifications', NOW(), NOW()),
    ('smtp_port', '587', 'SMTP server port', NOW(), NOW()),
    ('smtp_username', '', 'SMTP username for authentication', NOW(), NOW()),
    ('smtp_password', '', 'SMTP password for authentication', NOW(), NOW()),
    ('smtp_from_address', '', 'Email address to send from', NOW(), NOW()),
    ('smtp_from_name', 'LaporAC System', 'Name to display as sender', NOW(), NOW())
ON CONFLICT (identifier) DO UPDATE SET 
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ============================================
-- NOTES:
-- ============================================
-- 1. Jalankan migration Laravel terlebih dahulu dengan: php artisan migrate
-- 2. Atau jalankan SQL ini di Supabase SQL Editor
-- 3. Setelah itu jalankan seeder: php artisan db:seed --class=MenuPermissionSeeder
-- 4. Pastikan untuk backup database sebelum menjalankan migration
-- ============================================
