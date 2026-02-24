                                                                                                                                    -- ====================================================
                                                                                                                                    -- SEED: RBAC (Roles & Permissions)
                                                                                                                                    -- Jalankan di Supabase Dashboard > SQL Editor
                                                                                                                                    -- Mirip konsep Laravel Seeder — input data dari kodingan
                                                                                                                                    -- ====================================================

                                                                                                                                    BEGIN;

                                                                                                                                    -- ===== 1. CREATE PERMISSIONS TABLE (if not exists) =====
                                                                                                                                    CREATE TABLE IF NOT EXISTS public.permissions (
                                                                                                                                        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                                                                                                                                        code VARCHAR(100) UNIQUE NOT NULL,
                                                                                                                                        description TEXT,
                                                                                                                                        created_at TIMESTAMPTZ DEFAULT NOW()
                                                                                                                                    );

                                                                                                                                    -- ===== 2. CREATE ROLES TABLE (if not exists) =====
                                                                                                                                    CREATE TABLE IF NOT EXISTS public.roles (
                                                                                                                                        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                                                                                                                                        name VARCHAR(100) UNIQUE NOT NULL,
                                                                                                                                        description TEXT,
                                                                                                                                        created_at TIMESTAMPTZ DEFAULT NOW()
                                                                                                                                    );

                                                                                                                                    -- ===== 3. CREATE ROLE_PERMISSIONS JOIN TABLE =====
                                                                                                                                    CREATE TABLE IF NOT EXISTS public.role_permissions (
                                                                                                                                        role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
                                                                                                                                        permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
                                                                                                                                        PRIMARY KEY (role_id, permission_id)
                                                                                                                                    );

                                                                                                                                    -- ===== 4. SEED PERMISSIONS (Hak Akses) =====
                                                                                                                                    INSERT INTO public.permissions (code, description) VALUES
                                                                                                                                        ('ticket.view',     'Melihat daftar tiket laporan'),
                                                                                                                                        ('ticket.create',   'Membuat tiket laporan baru'),
                                                                                                                                        ('ticket.validate', 'Memvalidasi tiket masuk (Pak Wija)'),
                                                                                                                                        ('ticket.inspect',  'Melakukan cek fisik unit AC (Pak Budi)'),
                                                                                                                                        ('ticket.action',   'Menentukan tindakan (Internal/Vendor)'),
                                                                                                                                        ('ticket.complete', 'Menyelesaikan pekerjaan tiket'),
                                                                                                                                        ('asset.view',      'Melihat daftar aset AC'),
                                                                                                                                        ('asset.create',    'Menambah aset AC baru'),
                                                                                                                                        ('asset.edit',      'Mengedit data aset'),
                                                                                                                                        ('asset.delete',    'Menghapus aset'),
                                                                                                                                        ('maintenance.view',      'Melihat jadwal maintenance'),
                                                                                                                                        ('maintenance.create',    'Membuat jadwal maintenance baru'),
                                                                                                                                        ('maintenance.complete',  'Menandai maintenance selesai'),
                                                                                                                                        ('maintenance.generate',  'Generate jadwal rutin otomatis'),
                                                                                                                                        ('user.view',       'Melihat daftar user'),
                                                                                                                                        ('user.manage',     'Mengelola user dan role'),
                                                                                                                                        ('analytics.view',  'Melihat halaman analytics'),
                                                                                                                                        ('log.view',        'Melihat audit log')
                                                                                                                                    ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description;

                                                                                                                                    -- ===== 5. SEED ROLES =====
                                                                                                                                    INSERT INTO public.roles (name, description) VALUES
                                                                                                                                        ('Super Admin',  'Akses penuh ke semua fitur sistem'),
                                                                                                                                        ('Admin',        'Admin operasional (Pak Wija) — validasi tiket, jadwal, user'),
                                                                                                                                        ('Technician',   'Teknisi lapangan (Pak Budi) — cek fisik, perbaikan'),
                                                                                                                                        ('Staff',        'User biasa — hanya bisa lapor dan lihat status')
                                                                                                                                    ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

                                                                                                                                    -- ===== 6. ASSIGN PERMISSIONS TO ROLES =====

                                                                                                                                    -- Super Admin -> ALL permissions
                                                                                                                                    INSERT INTO public.role_permissions (role_id, permission_id)
                                                                                                                                    SELECT r.id, p.id FROM public.roles r, public.permissions p
                                                                                                                                    WHERE r.name = 'Super Admin'
                                                                                                                                    ON CONFLICT DO NOTHING;

                                                                                                                                    -- Admin -> Most permissions (except ticket.inspect and ticket.complete)
                                                                                                                                    INSERT INTO public.role_permissions (role_id, permission_id)
                                                                                                                                    SELECT r.id, p.id FROM public.roles r, public.permissions p
                                                                                                                                    WHERE r.name = 'Admin' AND p.code IN (
                                                                                                                                        'ticket.view', 'ticket.create', 'ticket.validate', 'ticket.action',
                                                                                                                                        'asset.view', 'asset.create', 'asset.edit', 'asset.delete',
                                                                                                                                        'maintenance.view', 'maintenance.create', 'maintenance.generate',
                                                                                                                                        'user.view', 'user.manage', 'analytics.view', 'log.view'
                                                                                                                                    )
                                                                                                                                    ON CONFLICT DO NOTHING;

                                                                                                                                    -- Technician -> Inspection & completion
                                                                                                                                    INSERT INTO public.role_permissions (role_id, permission_id)
                                                                                                                                    SELECT r.id, p.id FROM public.roles r, public.permissions p
                                                                                                                                    WHERE r.name = 'Technician' AND p.code IN (
                                                                                                                                        'ticket.view', 'ticket.inspect', 'ticket.complete',
                                                                                                                                        'asset.view',
                                                                                                                                        'maintenance.view', 'maintenance.complete'
                                                                                                                                    )
                                                                                                                                    ON CONFLICT DO NOTHING;

                                                                                                                                    -- Staff -> View only + create ticket
                                                                                                                                    INSERT INTO public.role_permissions (role_id, permission_id)
                                                                                                                                    SELECT r.id, p.id FROM public.roles r, public.permissions p
                                                                                                                                    WHERE r.name = 'Staff' AND p.code IN (
                                                                                                                                        'ticket.view', 'ticket.create',
                                                                                                                                        'asset.view',
                                                                                                                                        'maintenance.view'
                                                                                                                                    )
                                                                                                                                    ON CONFLICT DO NOTHING;

                                                                                                                                    -- ===== 7. ENABLE RLS =====
                                                                                                                                    ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
                                                                                                                                    ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
                                                                                                                                    ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

                                                                                                                                    -- Allow authenticated users to read
                                                                                                                                    DROP POLICY IF EXISTS "Allow read permissions" ON public.permissions;
                                                                                                                                    CREATE POLICY "Allow read permissions" ON public.permissions FOR SELECT TO authenticated USING (true);

                                                                                                                                    DROP POLICY IF EXISTS "Allow read roles" ON public.roles;
                                                                                                                                    CREATE POLICY "Allow read roles" ON public.roles FOR SELECT TO authenticated USING (true);

                                                                                                                                    DROP POLICY IF EXISTS "Allow read role_permissions" ON public.role_permissions;
                                                                                                                                    CREATE POLICY "Allow read role_permissions" ON public.role_permissions FOR SELECT TO authenticated USING (true);

                                                                                                                                    -- Allow admins to manage (insert/update/delete)
                                                                                                                                    DROP POLICY IF EXISTS "Allow manage permissions" ON public.permissions;
                                                                                                                                    CREATE POLICY "Allow manage permissions" ON public.permissions FOR ALL TO authenticated USING (true) WITH CHECK (true);

                                                                                                                                    DROP POLICY IF EXISTS "Allow manage roles" ON public.roles;
                                                                                                                                    CREATE POLICY "Allow manage roles" ON public.roles FOR ALL TO authenticated USING (true) WITH CHECK (true);

                                                                                                                                    DROP POLICY IF EXISTS "Allow manage role_permissions" ON public.role_permissions;
                                                                                                                                    CREATE POLICY "Allow manage role_permissions" ON public.role_permissions FOR ALL TO authenticated USING (true) WITH CHECK (true);

                                                                                                                                    COMMIT;

                                                                                                                                    -- ===== VERIFICATION =====
                                                                                                                                    -- Jalankan query ini untuk verifikasi:
                                                                                                                                    -- SELECT r.name as role, array_agg(p.code) as permissions
                                                                                                                                    -- FROM roles r
                                                                                                                                    -- JOIN role_permissions rp ON rp.role_id = r.id
                                                                                                                                    -- JOIN permissions p ON p.id = rp.permission_id
                                                                                                                                    -- GROUP BY r.name;
