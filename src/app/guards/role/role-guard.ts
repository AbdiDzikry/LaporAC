import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SessionService } from '../../services/session/session.service';
import { AuthService } from '../../services/auth/auth.service';

export const roleGuard: CanActivateFn = async (route, state) => {
  const sessionService = inject(SessionService);
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if authenticated
  const isAuthenticated = await sessionService.checkAuthStatus();
  if (!isAuthenticated) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Check Role
  const userRole = sessionService.getCurrentUserRole();
  if (userRole && (userRole === 'super_admin' || userRole === 'admin' || userRole === 'technician')) {
    // Technician can access dashboard
    return true;
  }

  // Logic:
  // If Super Admin -> All access.
  // If Technician -> Ticket access (but we block setting? we don't have settings yet).
  // For now, allow all roles to access admin routes if defined in routes.

  if (userRole && userRole === 'staff') {
    alert('Akses Ditolak. Anda hanya Staff.');
    router.navigate(['/report']);
    return false;
  }

  return true;
};
