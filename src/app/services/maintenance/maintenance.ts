import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase/supabase';
import { TicketService } from '../ticket/ticket';
import { AuditService } from '../audit/audit';

export interface MaintenanceSchedule {
    id?: number;
    asset_id: number;
    scheduled_date: string;
    completed_date?: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'missed' | 'skipped';
    ticket_id?: number;
    technician_notes?: string;
    created_at?: string;
    updated_at?: string;

    // Joins
    assets?: {
        name: string;
        location: string;
        sku: string;
        maintenance_interval_days: number;
    };
}

@Injectable({
    providedIn: 'root'
})
export class MaintenanceService {

    constructor(
        private supabase: SupabaseService,
        private ticketService: TicketService,
        private audit: AuditService
    ) { }

    /**
     * Get maintenance schedules.
     * @param filter 'upcoming' | 'history' | 'all'
     */
    async getSchedules(filter: 'upcoming' | 'history' | 'all' = 'upcoming') {
        let query = this.supabase.client
            .from('maintenance_schedules')
            .select('*, assets(name, location, sku, maintenance_interval_days)')
            .order('scheduled_date', { ascending: true });

        const today = new Date().toISOString().split('T')[0];

        if (filter === 'upcoming') {
            // Status scheduled/in_progress OR (missed but not too old?)
            // Let's just get everything >= today OR status != completed
            query = query.neq('status', 'completed').neq('status', 'skipped');
        } else if (filter === 'history') {
            query = query.in('status', ['completed', 'skipped']);
        }

        return await query;
    }

    /**
     * Get assets due for maintenance in the next X days.
     * This checks the `next_maintenance_date` on the ASSETS table.
     */
    async getAssetsDue(days: number = 7) {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);

        return await this.supabase.client
            .from('assets')
            .select('*')
            .lte('next_maintenance_date', futureDate.toISOString().split('T')[0])
            .order('next_maintenance_date', { ascending: true });
    }

    /**
     * Generate a PM Ticket for an asset.
     * 1. Create Ticket
     * 2. Create Maintenance Schedule Record
     */
    async generatePMTicket(asset: any) {
        try {
            // 1. Create Ticket
            const description = `Preventive Maintenance Rutin untuk ${asset.name} (${asset.maintenance_interval_days} hari)`;
            const { data: ticket, error: ticketError } = await this.ticketService.createTicket({
                asset_id: asset.id,
                issue_category: 'preventive_maintenance', // Need to handle this new category in UI maybe
                description: description,
                reporter_name: 'System Auto-Scheduler',
                status: 'open', // Direct to open for technician
                reporter_nik: 'SYSTEM'
            } as any); // Type cast if needed

            if (ticketError) throw ticketError;
            if (!ticket) throw new Error("Failed to create ticket");

            const ticketId = (ticket as any)[0]?.id || (ticket as any).id; // Handle array return if any

            // 2. Create Schedule Record
            const { error: scheduleError } = await this.supabase.client
                .from('maintenance_schedules')
                .insert({
                    asset_id: asset.id,
                    scheduled_date: new Date().toISOString().split('T')[0], // Scheduled for Today
                    status: 'in_progress', // Created and immediately active
                    ticket_id: ticketId
                });

            if (scheduleError) throw scheduleError;

            await this.audit.logAction('PM_GENERATED', 'maintenance_schedules', asset.id, { ticket_id: ticketId });

            return { success: true };

        } catch (e) {
            console.error("PM Generation Failed", e);
            return { error: e };
        }
    }

    /**
     * Complete a maintenance schedule
     */
    async completeMaintenance(id: number, notes: string) {
        // 1. Update Schedule
        const { error } = await this.supabase.client
            .from('maintenance_schedules')
            .update({
                status: 'completed',
                completed_date: new Date().toISOString(),
                technician_notes: notes
            })
            .eq('id', id);

        if (error) return { error };

        // 2. Trigger DB Trigger usually updates next_maintenance_date, 
        // but since we don't have triggers yet, let's update asset manually in client or ensure DB does it.
        // Let's rely on client logic for MVP to be safe.

        // Fetch schedule to get asset_id
        const { data: schedule } = await this.supabase.client.from('maintenance_schedules').select('asset_id').eq('id', id).single();
        if (schedule) {
            await this.updateNextMaintenanceDate(schedule.asset_id);
        }

        return { data: true };
    }

    async updateNextMaintenanceDate(assetId: number) {
        // Get asset interval
        const { data: asset } = await this.supabase.client
            .from('assets')
            .select('maintenance_interval_days')
            .eq('id', assetId)
            .single();

        if (!asset || !asset.maintenance_interval_days) return;

        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + asset.maintenance_interval_days);

        await this.supabase.client.from('assets').update({
            last_maintenance_date: new Date().toISOString(),
            next_maintenance_date: nextDate.toISOString()
        }).eq('id', assetId);
    }
}
