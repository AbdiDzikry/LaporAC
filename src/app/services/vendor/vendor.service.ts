import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface VendorProfile {
    id?: number;
    user_id: number;
    company_name?: string;
    company_address?: string;
    phone?: string;
    email?: string;
    npwp?: string;
    bank_name?: string;
    bank_account?: string;
    account_holder?: string;
    specialties?: string[];
    notes?: string;
    status: 'active' | 'inactive' | 'suspended';
    rating: number;
    completed_jobs: number;
    created_at?: string;
    updated_at?: string;
    user?: any;
    spks?: any[];
    completed_spks?: any[];
}

export interface VendorStatistics {
    total_spks: number;
    completed_spks: number;
    pending_spks: number;
    in_progress_spks: number;
    total_earnings: number;
    average_rating: number;
}

@Injectable({
    providedIn: 'root'
})
export class VendorService {
    private apiUrl = `${environment.apiUrl}/vendors`;

    constructor(private http: HttpClient) { }

    /**
     * Get all vendors
     */
    async getVendors(): Promise<{ data: VendorProfile[] | null; error: any }> {
        try {
            const data = await firstValueFrom(this.http.get<VendorProfile[]>(this.apiUrl));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: error.message || 'Gagal mengambil vendor' };
        }
    }

    /**
     * Get active vendors only
     */
    async getActiveVendors(): Promise<{ data: VendorProfile[] | null; error: any }> {
        try {
            const data = await firstValueFrom(this.http.get<VendorProfile[]>(`${this.apiUrl}/active`));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: error.message || 'Gagal mengambil vendor aktif' };
        }
    }

    /**
     * Get vendor by ID
     */
    async getVendorById(id: number): Promise<{ data: VendorProfile | null; error: any }> {
        try {
            const data = await firstValueFrom(this.http.get<VendorProfile>(`${this.apiUrl}/${id}`));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: error.message || 'Gagal mengambil detail vendor' };
        }
    }

    /**
     * Get vendor statistics
     */
    async getVendorStatistics(id: number): Promise<{ data: VendorStatistics | null; error: any }> {
        try {
            const data = await firstValueFrom(this.http.get<VendorStatistics>(`${this.apiUrl}/${id}/statistics`));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: error.message || 'Gagal mengambil statistik vendor' };
        }
    }

    /**
     * Create new vendor
     */
    async createVendor(vendor: Partial<VendorProfile> & { name: string; email: string; password: string }): Promise<{ data: VendorProfile | null; error: any }> {
        try {
            const data = await firstValueFrom(this.http.post<VendorProfile>(this.apiUrl, vendor));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: error.message || 'Gagal menambah vendor' };
        }
    }

    /**
     * Update vendor
     */
    async updateVendor(id: number, vendor: Partial<VendorProfile>): Promise<{ data: VendorProfile | null; error: any }> {
        try {
            const data = await firstValueFrom(this.http.put<VendorProfile>(`${this.apiUrl}/${id}`, vendor));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: error.message || 'Gagal update vendor' };
        }
    }

    /**
     * Delete vendor
     */
    async deleteVendor(id: number): Promise<{ success: boolean; error: any }> {
        try {
            await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
            return { success: true, error: null };
        } catch (error: any) {
            return { success: false, error: error.message || 'Gagal hapus vendor' };
        }
    }

    /**
     * Update vendor rating
     */
    async updateVendorRating(id: number): Promise<{ data: VendorProfile | null; error: any }> {
        try {
            const data = await firstValueFrom(this.http.post<VendorProfile>(`${this.apiUrl}/${id}/update-rating`, {}));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: error.message || 'Gagal update rating vendor' };
        }
    }
}
