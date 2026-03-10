import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuditService } from '../audit/audit';

export interface UserProfile {
  id: string | number;
  email?: string;
  name?: string;
  full_name?: string; // Kept for compatibility if used elsewhere
  nik?: string;
  role: 'super_admin' | 'admin' | 'technician' | 'staff' | 'dept_head' | 'vendor';
  avatar_url?: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private apiUrl = environment.apiUrl;
  private initPromise: Promise<void>;

  constructor(
    private http: HttpClient,
    private router: Router,
    private audit: AuditService
  ) {
    this.initPromise = this.initializeAuthState();
  }

  private async initializeAuthState() {
    const token = localStorage.getItem('laporac_token');
    if (token) {
      try {
        const profile = await this.fetchUserProfile();
        if (profile) {
          this.currentUserSubject.next(this.mapProfile(profile));
        } else {
          // Token might be invalid
          this.clearAuth();
        }
      } catch (e) {
        console.error('AuthService: Failed to restore session', e);
        this.clearAuth();
      }
    }
  }

  async waitForInit(): Promise<void> {
    return this.initPromise;
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response: any = await firstValueFrom(
        this.http.post(`${this.apiUrl}/login`, { email, password })
      );

      if (response && response.token) {
        localStorage.setItem('laporac_token', response.token);
        const mappedUser = this.mapProfile(response.user);
        this.currentUserSubject.next(mappedUser);

        // Optional Audit logging
        try {
          await this.audit.logAction('LOGIN', 'auth', mappedUser.id as number, {
            email,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          });
        } catch (e) { } // Ignore audit errors on login

        return { success: true };
      }

      return { success: false, error: 'Token tidak diterima dari server' };
    } catch (error: any) {
      const msg = error.error?.message || error.message || 'Login failed';
      return { success: false, error: msg };
    }
  }

  async signOut(): Promise<void> {
    const user = this.currentUserSubject.value;

    try {
      if (localStorage.getItem('laporac_token')) {
        await firstValueFrom(this.http.post(`${this.apiUrl}/logout`, {}));
      }
    } catch (e) {
      console.warn('Logout API failed, ignoring client-side');
    }

    if (user) {
      try {
        await this.audit.logAction('LOGOUT', 'auth', user.id as number, {
          timestamp: new Date().toISOString()
        });
      } catch (e) { }
    }

    this.clearAuth();
    this.router.navigate(['/login']);
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    await this.initPromise;
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getUserRole(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user.role : null;
  }

  hasRole(requiredRole: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;

    const roleHierarchy: { [key: string]: number } = {
      'staff': 1,
      'vendor': 1,
      'technician': 2,
      'dept_head': 3,
      'admin': 4,
      'super_admin': 5
    };

    return (roleHierarchy[user.role] || 0) >= (roleHierarchy[requiredRole] || 0);
  }

  private async fetchUserProfile(): Promise<any | null> {
    try {
      return await firstValueFrom(this.http.get(`${this.apiUrl}/me`));
    } catch (error) {
      return null;
    }
  }

  private clearAuth() {
    localStorage.removeItem('laporac_token');
    this.currentUserSubject.next(null);
  }

  // Helper to map Laravel User model to Angular UserProfile interface
  private mapProfile(laravelUser: any): UserProfile {
    return {
      id: laravelUser.id,
      email: laravelUser.email,
      name: laravelUser.name,
      full_name: laravelUser.name, // alias
      nik: laravelUser.nik,
      role: laravelUser.role || 'staff',
      created_at: laravelUser.created_at
    };
  }
}