import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MaintenancePeriod {
    id?: number;
    name: string;
    month: number;
    year: number;
    status: 'draft' | 'active' | 'completed' | 'archived' | 'overdue';
    total_schedules?: number;
    completed_schedules?: number;
    created_by?: number;
    created_at?: string;
    updated_at?: string;
}

export interface PeriodStats {
    total_periods: number;
    active_periods: number;
    total_schedules: number;
    completed_schedules: number;
    completion_rate: number;
}

@Injectable({
    providedIn: 'root'
})
export class PeriodService {
    private apiUrl = `${environment.apiUrl}/periods`;

    constructor(private http: HttpClient) { }

    /**
     * Get all maintenance periods with optional filters
     */
    async getPeriods(year?: number, status?: string) {
        try {
            let params = new HttpParams();
            if (year) params = params.set('year', year);
            if (status && status !== 'all') params = params.set('status', status);

            const data = await firstValueFrom(this.http.get<MaintenancePeriod[]>(this.apiUrl, { params }));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    /**
     * Get a single period by ID
     */
    async getPeriodById(id: number) {
        try {
            const data = await firstValueFrom(this.http.get<MaintenancePeriod>(`${this.apiUrl}/${id}`));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    /**
     * Create a new maintenance period
     */
    async createPeriod(month: number, year: number, templatePeriodId?: number) {
        try {
            const monthNames = [
                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
            ];
            const name = `${monthNames[month - 1]} ${year}`;

            const payload: any = { name, month, year, status: 'draft' };
            if (templatePeriodId) {
                payload.template_period_id = templatePeriodId;
            }

            const data = await firstValueFrom(this.http.post<MaintenancePeriod>(this.apiUrl, payload));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    /**
     * Update a period
     */
    async updatePeriod(id: number, updates: Partial<MaintenancePeriod>) {
        try {
            const data = await firstValueFrom(this.http.put<MaintenancePeriod>(`${this.apiUrl}/${id}`, updates));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    /**
     * Delete a period (only if no schedules)
     */
    async deletePeriod(id: number) {
        try {
            await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
            return { data: true, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    /**
     * Update period statistics
     */
    async updatePeriodStats(periodId: number) {
        try {
            await firstValueFrom(this.http.post(`${this.apiUrl}/${periodId}/recalculate-stats`, {}));
        } catch (e) { }
    }

    /**
     * Sync period statuses based on current date
     */
    async syncPeriodStatuses() {
        try {
            await firstValueFrom(this.http.post(`${this.apiUrl}/sync-statuses`, {}));
        } catch (e) { }
    }

    /**
     * Get statistics for a specific year
     */
    async getYearStats(year: number): Promise<PeriodStats> {
        try {
            const data = await firstValueFrom(this.http.get<PeriodStats>(`${this.apiUrl}/stats`, { params: { year } }));
            return data;
        } catch (error: any) {
            return {
                total_periods: 0,
                active_periods: 0,
                total_schedules: 0,
                completed_schedules: 0,
                completion_rate: 0
            };
        }
    }

    /**
     * Get available years
     */
    async getAvailableYears(): Promise<number[]> {
        try {
            const data = await firstValueFrom(this.http.get<number[]>(`${this.apiUrl}/available-years`));
            return data;
        } catch (error: any) {
            return [new Date().getFullYear()];
        }
    }
}
