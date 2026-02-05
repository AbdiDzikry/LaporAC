import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase/supabase';

export interface UserProfile {
    id: string;
    email?: string;
    full_name?: string;
    role: 'super_admin' | 'admin' | 'technician' | 'staff';
    avatar_url?: string;
    created_at?: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor(private supabase: SupabaseService) { }

    /**
     * Get all user profiles (for Admin Management List)
     */
    async getAllUsers() {
        return await this.supabase.client
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
    }

    /**
     * Get only technicians (for Ticket Assignment Dropdown)
     */
    async getTechnicians() {
        return await this.supabase.client
            .from('profiles')
            .select('*')
            .eq('role', 'technician')
            .order('full_name', { ascending: true });
    }

    /**
     * Invite a new user (This usually requires Supabase Admin API or calling an Edge Function)
     * For Client-Side only, we can create a profile if the user already signed up, 
     * or we just manage the roles of existing users.
     * 
     * For this MVP corporate standard: Update Role
     */
    async updateUserRole(id: string, role: UserProfile['role']) {
        return await this.supabase.client
            .from('profiles')
            .update({ role })
            .eq('id', id);
    }
}
