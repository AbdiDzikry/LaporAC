-- Enable Admin Access to Manage Profiles
-- 1. Create a helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  current_role text;
BEGIN
  SELECT role INTO current_role FROM public.profiles WHERE id = auth.uid();
  RETURN current_role IN ('super_admin', 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop existing restrictive policies if necessary (Optional, or just add new permisive ones)
-- We will add a specific policy for Admins.

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (is_admin() OR auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (is_admin());

-- 3. Ensure RLS is on
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
