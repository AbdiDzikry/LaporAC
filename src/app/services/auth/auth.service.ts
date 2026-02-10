import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase/supabase';
import { AuditService } from '../audit/audit';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  role: 'super_admin' | 'admin' | 'technician' | 'staff' | 'dept_head';
  avatar_url?: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private supabase: SupabaseService,
    private audit: AuditService,
    private router: Router
  ) {
    this.initializeAuthState();
  }

  private async initializeAuthState() {
    const session = await this.supabase.session;
    if (session.data.session) {
      const profile = await this.fetchUserProfile();
      if (profile) {
        this.currentUserSubject.next(profile);
      }
    }
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabase.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        const profile = await this.fetchUserProfile();
        if (profile) {
          this.currentUserSubject.next(profile);
          
          // Log login action
          await this.audit.logAction('LOGIN', 'auth', profile.id, { 
            email, 
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          });
        }
        
        return { success: true };
      }
      
      return { success: false, error: 'No session returned' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  }

  async signUp(email: string, password: string, fullName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabase.client.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        throw error;
      }

      // Create profile in our profiles table
      if (data.user) {
        const profileResult = await this.supabase.client
          .from('profiles')
          .insert([{
            id: data.user.id,
            email,
            full_name: fullName,
            role: 'staff' // Default role for new users
          }]);

        if (profileResult.error) {
          console.error('Error creating profile:', profileResult.error);
        }
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  }

  async signOut(): Promise<void> {
    const user = this.currentUserSubject.value;
    
    await this.supabase.client.auth.signOut();
    this.currentUserSubject.next(null);
    
    if (user) {
      // Log logout action
      await this.audit.logAction('LOGOUT', 'auth', user.id, { 
        timestamp: new Date().toISOString()
      });
    }
    
    this.router.navigate(['/login']);
  }

  async forgotPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.client.auth.resetPasswordForEmail(email);
      
      if (error) {
        throw error;
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Password reset request failed' };
    }
  }

  async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.client.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        throw error;
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Password update failed' };
    }
  }

  async getCurrentUser(): Promise<UserProfile | null> {
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
    
    // Define role hierarchy
    const roleHierarchy: { [key: string]: number } = {
      'staff': 1,
      'technician': 2,
      'dept_head': 3,
      'admin': 4,
      'super_admin': 5
    };
    
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  }

  private async fetchUserProfile(): Promise<UserProfile | null> {
    try {
      const { data: { user }, error: userError } = await this.supabase.client.auth.getUser();
      if (userError || !user) {
        console.error('Error getting user from auth:', userError);
        return null;
      }

      const { data, error } = await this.supabase.client
        .from('profiles')
        .select('id, email, full_name, role, avatar_url, created_at')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, create a default one
        if (error.code === 'PGRST116') { // Row not found
          console.log('Profile not found, creating default profile...');
          const defaultProfile: UserProfile = {
            id: user.id,
            email: user.email || '',
            full_name: (user.user_metadata as any)?.full_name || user.email?.split('@')[0] || 'Unknown User',
            role: 'staff', // Default role
            created_at: new Date().toISOString()
          };
          
          // Attempt to create the profile
          const { error: insertError } = await this.supabase.client
            .from('profiles')
            .insert([{
              id: user.id,
              email: user.email,
              full_name: defaultProfile.full_name,
              role: 'staff'
            }]);
            
          if (insertError) {
            console.error('Error creating default profile:', insertError);
            return null;
          }
          
          return defaultProfile;
        }
        return null;
      }

      return data as UserProfile;
    } catch (error: any) {
      console.error('Error in fetchUserProfile:', error?.message || error);
      return null;
    }
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> {
    try {
      const user = this.currentUserSubject.value;
      if (!user) {
        return { success: false, error: 'No user logged in' };
      }

      const { error } = await this.supabase.client
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Update the local user state
      const updatedUser = { ...user, ...updates };
      this.currentUserSubject.next(updatedUser);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Profile update failed' };
    }
  }
}