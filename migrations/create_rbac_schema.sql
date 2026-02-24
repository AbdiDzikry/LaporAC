-- ==========================================
-- RBAC SCHEMA SETUP
-- ==========================================

BEGIN;

-- 1. Create Roles Table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Permissions Table
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE, -- e.g. 'user.create', 'ticket.view'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Role Permissions (Join Table)
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

-- 4. Add role_id to profiles, reference roles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.roles(id);

-- 5. Seed Default Roles
INSERT INTO public.roles (name, description) VALUES 
('Super Admin', 'Full access to all system features'),
('Admin', 'Administrative access to manage users and maintenance'),
('Technician', 'Operational access to view and update tickets'),
('Staff', 'Basic access to view dashboard and submit tickets')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- 6. Seed Permissions
INSERT INTO public.permissions (code, description) VALUES
-- User Management
('user.view', 'View list of users'),
('user.create', 'Create new users'),
('user.edit', 'Edit user details and roles'),
('user.delete', 'Delete users'),
-- Role Management
('role.view', 'View roles and permissions'),
('role.manage', 'Create and modify roles'),
-- Ticket Management
('ticket.view', 'View tickets'),
('ticket.create', 'Create new tickets'),
('ticket.edit', 'Edit tickets'),
('ticket.delete', 'Delete tickets'),
('ticket.assign', 'Assign tickets to technicians'),
-- Maintenance Management
('maintenance.view', 'View maintenance schedules'),
('maintenance.manage', 'Create and modify maintenance schedules'),
('maintenance.report', 'View and generate reports')
ON CONFLICT (code) DO NOTHING;

-- 7. Assign Permissions to Roles (Initial Setup)

-- Helper DO block to assign permissions
DO $$
DECLARE
    super_admin_id UUID;
    admin_id UUID;
    tech_id UUID;
    staff_id UUID;
BEGIN
    SELECT id INTO super_admin_id FROM public.roles WHERE name = 'Super Admin';
    SELECT id INTO admin_id FROM public.roles WHERE name = 'Admin';
    SELECT id INTO tech_id FROM public.roles WHERE name = 'Technician';
    SELECT id INTO staff_id FROM public.roles WHERE name = 'Staff';

    -- Super Admin: ALL Permissions
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT super_admin_id, id FROM public.permissions
    ON CONFLICT DO NOTHING;

    -- Admin: Everything EXCEPT role management (optional restriction)
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT admin_id, id FROM public.permissions 
    WHERE code IN (
        'user.view', 'user.create', 'user.edit',
        'ticket.view', 'ticket.create', 'ticket.edit', 'ticket.assign', 'ticket.delete',
        'maintenance.view', 'maintenance.manage', 'maintenance.report'
    )
    ON CONFLICT DO NOTHING;

    -- Technician: Ticket related
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT tech_id, id FROM public.permissions 
    WHERE code IN (
        'ticket.view', 'ticket.edit', -- Can edit own tickets? Logic handled in app
        'maintenance.view'
    )
    ON CONFLICT DO NOTHING;

    -- Staff: View only (or basic create ticket)
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT staff_id, id FROM public.permissions 
    WHERE code IN (
        'ticket.view', 'ticket.create'
    )
    ON CONFLICT DO NOTHING;

END $$;

-- 8. Migrate Existing Data in Profiles
-- Map string roles to new UUID roles
UPDATE public.profiles p
SET role_id = r.id
FROM public.roles r
WHERE 
    (p.role = 'super_admin' AND r.name = 'Super Admin') OR
    (p.role = 'admin' AND r.name = 'Admin') OR
    (p.role = 'technician' AND r.name = 'Technician') OR
    (p.role = 'staff' AND r.name = 'Staff')
AND p.role_id IS NULL;

-- 9. Add RLS Policies for Roles
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users (so they can load their permissions)
CREATE POLICY "Allow read access for authenticated users" ON public.roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON public.permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON public.role_permissions FOR SELECT TO authenticated USING (true);

-- Allow write access only to Super Admin (using is_admin function or check role_id)
-- Note: existing is_admin() checks string 'role'. We should update it eventually.

COMMIT;
