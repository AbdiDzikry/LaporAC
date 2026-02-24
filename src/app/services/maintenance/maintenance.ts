import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TicketService } from '../ticket/ticket';
import { AuditService } from '../audit/audit';
import { ErrorHandlerService } from '../error-handler/error-handler.service';

export interface MaintenanceSchedule {
    id?: number;
    asset_id: number;
    scheduled_date: string;
    completed_date?: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'missed' | 'skipped' | string;
    ticket_id?: number;
    technician_notes?: string;
    period_id?: number;
    created_at?: string;
    updated_at?: string;

    // Joins
    asset?: {
        id: number;
        name: string;
        location: string;
        sku: string;
        brand?: string;
        pk?: string;
        maintenance_interval_days: number;
    };
    assets?: any; // Compatibility
}

@Injectable({
    providedIn: 'root'
})
export class MaintenanceService {
    private apiUrl = `${environment.apiUrl}/maintenance`;

    constructor(
        private http: HttpClient,
        private ticketService: TicketService,
        private audit: AuditService,
        private errorHandler: ErrorHandlerService
    ) { }

    /**
     * Get maintenance schedules.
     * @param filter 'upcoming' | 'history' | 'all' | 'period'
     */
    async getSchedules(filter: 'upcoming' | 'history' | 'all' | 'period' = 'upcoming', periodId?: number) {
        try {
            let url = this.apiUrl;
            if (filter === 'period' && periodId) {
                url += `?period_id=${periodId}`;
            }

            const schedules = await firstValueFrom(this.http.get<MaintenanceSchedule[]>(url));

            // Map asset relationship to keep compatibility with old code relying on 'assets'
            let processedSchedules = schedules.map(s => {
                if (s.asset) s.assets = s.asset;
                return s;
            });

            // Client-side filtering to mimic Supabase logic
            if (filter === 'upcoming') {
                processedSchedules = processedSchedules.filter(s => s.status !== 'completed' && s.status !== 'skipped');
            } else if (filter === 'history') {
                processedSchedules = processedSchedules.filter(s => s.status === 'completed' || s.status === 'skipped');
            }

            return { data: processedSchedules, error: null };
        } catch (error: any) {
            this.errorHandler.handleError(error, 'Gagal mengambil jadwal maintenance');
            return { data: null, error };
        }
    }

    /**
     * Get assets due for maintenance in the next X days.
     * Note: This fetches all assets and filters client-side for MVP simplicity
     */
    async getAssetsDue(days: number = 7) {
        try {
            const today = new Date();
            const futureDate = new Date();
            futureDate.setDate(today.getDate() + days);
            const targetDateStr = futureDate.toISOString().split('T')[0];

            const response = await firstValueFrom(this.http.get<any[]>(`${environment.apiUrl}/assets`));

            const dueAssets = response.filter(asset => {
                if (!asset.next_maintenance_date) return false;
                return asset.next_maintenance_date <= targetDateStr;
            }).sort((a, b) => new Date(a.next_maintenance_date).getTime() - new Date(b.next_maintenance_date).getTime());

            return { data: dueAssets, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    /**
     * Generate a PM Ticket for an asset.
     */
    async generatePMTicket(asset: any) {
        try {
            // 1. Create Ticket
            const description = `Preventive Maintenance Rutin untuk ${asset.name} (${asset.maintenance_interval_days} hari)`;
            const ticketResult = await this.ticketService.createTicket({
                asset_id: asset.id,
                issue_category: 'preventive_maintenance',
                description: description,
                reporter_name: 'System Auto-Scheduler',
                status: 'open',
                reporter_nik: 'SYSTEM'
            } as any);

            if (ticketResult.error) throw ticketResult.error;
            if (!ticketResult.data) throw new Error("Failed to create ticket");

            const ticketId = ticketResult.data.id;

            // 2. Create Schedule Record
            const payload = {
                asset_id: asset.id,
                scheduled_date: new Date().toISOString().split('T')[0],
                status: 'in_progress',
                ticket_id: ticketId
            };

            await firstValueFrom(this.http.post(this.apiUrl, payload));

            try {
                await this.audit.logAction('PM_GENERATED', 'maintenance_schedules', asset.id, { ticket_id: ticketId });
            } catch (e) { }

            return { success: true };

        } catch (e) {
            console.error("PM Generation Failed", e);
            return { error: e };
        }
    }

    /**
     * Create a single maintenance schedule manually
     */
    async createSchedule(assetId: number, scheduledDate: string, periodId?: number) {
        try {
            const payload: any = {
                asset_id: assetId,
                scheduled_date: scheduledDate,
                status: 'scheduled'
            };

            if (periodId) {
                payload.period_id = periodId;
            }

            const data = await firstValueFrom(this.http.post<MaintenanceSchedule>(this.apiUrl, payload));

            try {
                await this.audit.logAction('SCHEDULE_CREATED', 'maintenance_schedules', assetId, {
                    scheduled_date: scheduledDate
                });
            } catch (e) { }

            return { data: [data], error: null }; // Wrap in array for compatibility if needed
        } catch (error: any) {
            this.errorHandler.handleError(error, 'Gagal membuat jadwal');
            return { data: null, error };
        }
    }

    /**
     * Create multiple schedules for the same date (bulk creation)
     */
    async createBulkSchedules(assetIds: number[], scheduledDate: string, periodId?: number) {
        try {
            // Laravel MVP doesn't have bulk store yet, loop through them
            const promises = assetIds.map(assetId => this.createSchedule(assetId, scheduledDate, periodId));
            const results = await Promise.all(promises);

            // Check for errors
            const hasError = results.find(r => r.error);
            if (hasError) throw hasError.error;

            try {
                await this.audit.logAction('BULK_SCHEDULE_CREATED', 'maintenance_schedules', 0, {
                    count: assetIds.length,
                    scheduled_date: scheduledDate
                });
            } catch (e) { }

            return { data: results.map(r => r.data?.[0]), error: null };
        } catch (error: any) {
            this.errorHandler.handleError(error, 'Gagal membuat jadwal massal');
            return { data: null, error };
        }
    }

    /**
     * Create multiple schedules with INDIVIDUAL dates (Mixed Bulk)
     */
    async createVariedBulkSchedule(items: { asset_id: number, scheduled_date: string }[]) {
        try {
            const promises = items.map(item => this.createSchedule(item.asset_id, item.scheduled_date));
            const results = await Promise.all(promises);

            const hasError = results.find(r => r.error);
            if (hasError) throw hasError.error;

            try {
                await this.audit.logAction('BULK_SCHEDULE_VARIED', 'maintenance_schedules', 0, {
                    count: items.length
                });
            } catch (e) { }

            return { data: results.map(r => r.data?.[0]), error: null };
        } catch (error: any) {
            this.errorHandler.handleError(error, 'Gagal membuat jadwal massal bervariasi');
            return { data: null, error };
        }
    }

    /**
     * Complete a maintenance schedule
     */
    async completeMaintenance(id: number, notes: string) {
        try {
            const data = await firstValueFrom(this.http.post(`${this.apiUrl}/${id}/complete`, { notes }));
            return { data: true, error: null };
        } catch (error: any) {
            this.errorHandler.handleError(error, 'Gagal menyelesaikan jadwal');
            return { data: null, error };
        }
    }

    async updateNextMaintenanceDate(assetId: number) {
        // Handled entirely by Laravel backend endpoint /complete
    }
}
