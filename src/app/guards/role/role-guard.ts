import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SupabaseService } from '../../services/supabase/supabase';

export const roleGuard: CanActivateFn = async (route, state) => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  // Check if authenticated
  const session = await supabase.session;
  if (!session.data.session) {
    router.navigate(['/login']);
    return false;
  }

  // Check Role
  const response = await supabase.getProfile();
  const data = response ? response.data : null;
  if (data && (data.role === 'super_admin' || data.role === 'admin' || data.role === 'technician')) {
    // Technician can access dashboard
    return true;
  }

  // Logic: 
  // If Super Admin -> All access.
  // If Technician -> Ticket access (but we block setting? we don't have settings yet).
  // For now, allow all roles to access admin routes if defined in routes.

  if (data && data.role === 'staff') {
    alert('Akses Ditolak. Anda hanya Staff.');
    router.navigate(['/report']);
    return false;
  }

  return true;
};
