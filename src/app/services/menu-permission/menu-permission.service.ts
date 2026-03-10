import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface MenuPermission {
    id?: number;
    role_id: number;
    menu_route: string;
    menu_label: string;
    menu_icon?: string;
    sort_order: number;
    is_visible: boolean;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface AvailableMenu {
    route: string;
    label: string;
    icon: string;
}

@Injectable({
    providedIn: 'root'
})
export class MenuPermissionService {
    private apiUrl = `${environment.apiUrl}/menu-permissions`;

    constructor(private http: HttpClient) { }

    /**
     * Get menu permissions for current user
     */
    async getMyMenus(): Promise<{ data: MenuPermission[] | null; error: any }> {
        try {
            const data = await firstValueFrom(this.http.get<MenuPermission[]>(`${this.apiUrl}/my-menus`));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: error.message || 'Gagal mengambil menu' };
        }
    }

    /**
     * Get menu permissions for a specific role
     */
    async getRoleMenus(roleId: number): Promise<{ data: MenuPermission[] | null; error: any }> {
        try {
            const data = await firstValueFrom(this.http.get<MenuPermission[]>(`${this.apiUrl}/role/${roleId}`));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: error.message || 'Gagal mengambil menu role' };
        }
    }

    /**
     * Get all available menu routes
     */
    async getAvailableMenus(): Promise<{ data: AvailableMenu[] | null; error: any }> {
        try {
            const data = await firstValueFrom(this.http.get<AvailableMenu[]>(`${this.apiUrl}/available-menus`));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: error.message || 'Gagal mengambil daftar menu' };
        }
    }

    /**
     * Check if user has access to a specific menu
     */
    async checkAccess(route: string): Promise<{ hasAccess: boolean; error: any }> {
        try {
            const result = await firstValueFrom(this.http.get<{ has_access: boolean }>(`${this.apiUrl}/check/${encodeURIComponent(route)}`));
            return { hasAccess: result.has_access, error: null };
        } catch (error: any) {
            return { hasAccess: false, error: error.message || 'Gagal cek akses' };
        }
    }

    /**
     * Update menu permissions for a role
     */
    async updateRoleMenus(roleId: number, permissions: Partial<MenuPermission>[]): Promise<{ data: MenuPermission[] | null; error: any }> {
        try {
            const data = await firstValueFrom(this.http.post<MenuPermission[]>(`${this.apiUrl}/role/${roleId}`, { permissions }));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: error.message || 'Gagal update menu role' };
        }
    }

    /**
     * Delete a menu permission
     */
    async deletePermission(id: number): Promise<{ success: boolean; error: any }> {
        try {
            await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
            return { success: true, error: null };
        } catch (error: any) {
            return { success: false, error: error.message || 'Gagal hapus permission' };
        }
    }
}
