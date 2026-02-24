import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Role {
    id: string | number;
    name: string;
    description?: string;
    created_at?: string;
    permissions?: Permission[]; // For UI convenience
}

export interface Permission {
    id: string | number;
    code: string;
    description?: string;
}

export interface RolePermission {
    role_id: string | number;
    permission_id: string | number;
}

@Injectable({
    providedIn: 'root'
})
export class RoleService {
    private apiUrl = `${environment.apiUrl}/roles`;
    private permissionsUrl = `${environment.apiUrl}/permissions`;

    constructor(private http: HttpClient) { }

    /**
     * Get all roles
     */
    async getRoles() {
        try {
            const data = await firstValueFrom(this.http.get<Role[]>(this.apiUrl));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    /**
     * Get a single role with its permissions
     */
    async getRoleWithPermissions(roleId: string | number) {
        try {
            const data = await firstValueFrom(this.http.get<Role>(`${this.apiUrl}/${roleId}`));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    /**
     * Get all available permissions
     */
    async getAllPermissions() {
        try {
            const data = await firstValueFrom(this.http.get<Permission[]>(this.permissionsUrl));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    /**
     * Create a new role
     */
    async createRole(name: string, description: string) {
        try {
            const data = await firstValueFrom(this.http.post<Role>(this.apiUrl, { name, description }));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    /**
     * Update a role
     */
    async updateRole(id: string | number, name: string, description: string) {
        try {
            const data = await firstValueFrom(this.http.put<Role>(`${this.apiUrl}/${id}`, { name, description }));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    /**
     * Delete a role
     */
    async deleteRole(id: string | number) {
        try {
            await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
            return { data: true, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    /**
     * Update permissions for a role (Bulk replace)
     */
    async updateRolePermissions(roleId: string | number, permissionIds: (string | number)[]) {
        try {
            const data = await firstValueFrom(this.http.post(`${this.apiUrl}/${roleId}/permissions`, { permissions: permissionIds }));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }
}
