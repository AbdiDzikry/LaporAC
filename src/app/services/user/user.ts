import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserProfile {
    id: string | number;
    email?: string;
    full_name?: string;
    name?: string; // Laravel default
    role: 'super_admin' | 'admin' | 'technician' | 'staff' | string;
    avatar_url?: string;
    created_at?: string;
    nik?: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = `${environment.apiUrl}/users`;

    constructor(private http: HttpClient) { }

    /**
     * Get all user profiles (for Admin Management List)
     */
    async getAllUsers() {
        try {
            // we will need an endpoint for this in Laravel
            const data = await firstValueFrom(this.http.get<UserProfile[]>(this.apiUrl));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    /**
     * Get only technicians (for Ticket Assignment Dropdown)
     */
    async getTechnicians() {
        try {
            const data = await firstValueFrom(this.http.get<UserProfile[]>(`${this.apiUrl}?role=technician`));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    /**
     * Get User By ID
     */
    async getUserById(id: string | number) {
        try {
            const data = await firstValueFrom(this.http.get<UserProfile>(`${this.apiUrl}/${id}`));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    /**
     * Update User Role
     */
    async updateUserRole(id: string | number, role: UserProfile['role']) {
        return this.updateUser(id, { role });
    }

    /**
     * Update General User Profile
     */
    async updateUser(id: string | number, updates: Partial<UserProfile>) {
        try {
            const data = await firstValueFrom(this.http.put<UserProfile>(`${this.apiUrl}/${id}`, updates));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }
}
