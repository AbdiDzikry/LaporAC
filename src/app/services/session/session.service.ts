import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService, UserProfile } from './auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private userRoleSubject = new BehaviorSubject<string | null>(null);
  public userRole$ = this.userRoleSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private authService: AuthService) {
    this.initializeSession();
  }

  private async initializeSession() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.userRoleSubject.next(user.role);
      this.isAuthenticatedSubject.next(true);
    } else {
      this.userRoleSubject.next(null);
      this.isAuthenticatedSubject.next(false);
    }
  }

  getUserRole(): Observable<string | null> {
    return this.userRole$;
  }

  getIsAuthenticated(): Observable<boolean> {
    return this.isAuthenticated$;
  }

  getCurrentUserRole(): string | null {
    return this.userRoleSubject.value;
  }

  setIsAuthenticated(authenticated: boolean): void {
    this.isAuthenticatedSubject.next(authenticated);
  }

  setUserRole(role: string | null): void {
    this.userRoleSubject.next(role);
  }

  async checkAuthStatus(): Promise<boolean> {
    const user = await this.authService.getCurrentUser();
    const isAuthenticated = !!user;
    
    this.isAuthenticatedSubject.next(isAuthenticated);
    if (user) {
      this.userRoleSubject.next(user.role);
    }
    
    return isAuthenticated;
  }

  hasRole(requiredRole: string): boolean {
    const currentRole = this.getCurrentUserRole();
    if (!currentRole) return false;
    
    // Define role hierarchy
    const roleHierarchy: { [key: string]: number } = {
      'staff': 1,
      'technician': 2,
      'dept_head': 3,
      'admin': 4,
      'super_admin': 5
    };
    
    return roleHierarchy[currentRole] >= roleHierarchy[requiredRole];
  }

  canAccessAdminFeatures(): boolean {
    const role = this.getCurrentUserRole();
    return role === 'admin' || role === 'super_admin';
  }

  canViewReports(): boolean {
    const role = this.getCurrentUserRole();
    return ['admin', 'super_admin', 'dept_head'].includes(role || '');
  }

  canManageTickets(): boolean {
    const role = this.getCurrentUserRole();
    return ['admin', 'super_admin', 'technician'].includes(role || '');
  }
}