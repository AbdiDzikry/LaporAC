import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase/supabase';

export interface MaintenancePeriod {
    id?: number;
    name: string;
    month: number;
    year: number;
    status: 'draft' | 'active' | 'completed' | 'archived';
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

    constructor(private supabase: SupabaseService) { }

    /**
     * Get all maintenance periods with optional filters
     */
    async getPeriods(year?: number, status?: string) {
        let query = this.supabase.client
            .from('maintenance_periods')
            .select('*')
            .order('year', { ascending: false })
            .order('month', { ascending: false });

        if (year) {
            query = query.eq('year', year);
        }

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        return await query;
    }

    /**
     * Get a single period by ID
     */
    async getPeriodById(id: number) {
        return await this.supabase.client
            .from('maintenance_periods')
            .select('*')
            .eq('id', id)
            .single();
    }

    /**
     * Create a new maintenance period
     */
    async createPeriod(month: number, year: number, templatePeriodId?: number) {
        const monthNames = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];

        const name = `${monthNames[month - 1]} ${year}`;

        // Create the period
        const { data: period, error } = await this.supabase.client
            .from('maintenance_periods')
            .insert({
                name,
                month,
                year,
                status: 'draft'
            })
            .select()
            .single();

        if (error) return { data: null, error };

        // If template is provided, copy schedules from template period
        if (templatePeriodId && period) {
            await this.copySchedulesFromTemplate(period.id, templatePeriodId, month, year);
        }

        return { data: period, error: null };
    }

    /**
     * Copy schedules from a template period
     */
    private async copySchedulesFromTemplate(
        newPeriodId: number,
        templatePeriodId: number,
        targetMonth: number,
        targetYear: number
    ) {
        // Get schedules from template period
        const { data: templateSchedules, error } = await this.supabase.client
            .from('maintenance_schedules')
            .select('asset_id, scheduled_date, status')
            .eq('period_id', templatePeriodId);

        if (error || !templateSchedules) return { data: null, error };

        // Create new schedules with adjusted dates
        const newSchedules = templateSchedules.map((schedule: any) => {
            const originalDate = new Date(schedule.scheduled_date);
            const day = originalDate.getDate();

            // Create new date with target month/year
            const newDate = new Date(targetYear, targetMonth - 1, day);

            return {
                period_id: newPeriodId,
                asset_id: schedule.asset_id,
                scheduled_date: newDate.toISOString().split('T')[0],
                status: 'scheduled'
            };
        });

        return await this.supabase.client
            .from('maintenance_schedules')
            .insert(newSchedules);
    }

    /**
     * Update a period
     */
    async updatePeriod(id: number, updates: Partial<MaintenancePeriod>) {
        return await this.supabase.client
            .from('maintenance_periods')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
    }

    /**
     * Delete a period (only if no schedules)
     */
    async deletePeriod(id: number) {
        // Check if period has schedules
        const { data: schedules } = await this.supabase.client
            .from('maintenance_schedules')
            .select('id')
            .eq('period_id', id)
            .limit(1);

        if (schedules && schedules.length > 0) {
            return {
                data: null,
                error: { message: 'Tidak dapat menghapus periode yang memiliki jadwal' }
            };
        }

        return await this.supabase.client
            .from('maintenance_periods')
            .delete()
            .eq('id', id);
    }

    /**
     * Update period statistics
     */
    async updatePeriodStats(periodId: number) {
        const { data: schedules } = await this.supabase.client
            .from('maintenance_schedules')
            .select('status')
            .eq('period_id', periodId);

        if (!schedules) return;

        const total = schedules.length;
        const completed = schedules.filter((s: any) => s.status === 'completed').length;

        await this.supabase.client
            .from('maintenance_periods')
            .update({
                total_schedules: total,
                completed_schedules: completed,
                updated_at: new Date().toISOString()
            })
            .eq('id', periodId);
    }

    /**
     * Sync period statuses based on current date
     * - Activate current month if exists and draft
     * - Complete past active periods
     */
    async syncPeriodStatuses() {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        // 1. Get current month period
        const { data: currentPeriod } = await this.supabase.client
            .from('maintenance_periods')
            .select('*')
            .eq('month', currentMonth)
            .eq('year', currentYear)
            .single();

        // Activate current period if draft
        if (currentPeriod && currentPeriod.status === 'draft') {
            await this.updatePeriod(currentPeriod.id, { status: 'active' });
        }

        // 2. Get past active periods
        // Logic: Year < CurrentYear OR (Year == CurrentYear AND Month < CurrentMonth)
        // AND status = 'active'
        const { data: pastActivePeriods } = await this.supabase.client
            .from('maintenance_periods')
            .select('*')
            .eq('status', 'active')
            .or(`year.lt.${currentYear},and(year.eq.${currentYear},month.lt.${currentMonth})`);

        if (pastActivePeriods && pastActivePeriods.length > 0) {
            for (const period of pastActivePeriods) {
                await this.updatePeriod(period.id, { status: 'completed' });
            }
        }
    }

    /**
     * Get statistics for a specific year
     */
    async getYearStats(year: number): Promise<PeriodStats> {
        const { data: periods } = await this.supabase.client
            .from('maintenance_periods')
            .select('*')
            .eq('year', year);

        if (!periods || periods.length === 0) {
            return {
                total_periods: 0,
                active_periods: 0,
                total_schedules: 0,
                completed_schedules: 0,
                completion_rate: 0
            };
        }

        const total_periods = periods.length;
        const active_periods = periods.filter((p: MaintenancePeriod) => p.status === 'active').length;
        const total_schedules = periods.reduce((sum: number, p: MaintenancePeriod) => sum + (p.total_schedules || 0), 0);
        const completed_schedules = periods.reduce((sum: number, p: MaintenancePeriod) => sum + (p.completed_schedules || 0), 0);
        const completion_rate = total_schedules > 0
            ? Math.round((completed_schedules / total_schedules) * 100)
            : 0;

        return {
            total_periods,
            active_periods,
            total_schedules,
            completed_schedules,
            completion_rate
        };
    }

    /**
     * Get available years
     */
    async getAvailableYears(): Promise<number[]> {
        const { data } = await this.supabase.client
            .from('maintenance_periods')
            .select('year')
            .order('year', { ascending: false });

        if (!data) return [];

        const uniqueYears = [...new Set(data.map((p: any) => p.year))] as number[];
        return uniqueYears;
    }
    /**
     * Migrate existing Jan 2026 data
     */
    async migrateJan2026() {
        // 1. Check if period exists
        const { data: existing } = await this.supabase.client
            .from('maintenance_periods')
            .select('id')
            .eq('month', 1)
            .eq('year', 2026)
            .single();

        let periodId = existing?.id;

        // 2. Create if not exists
        if (!periodId) {
            const { data: newPeriod } = await this.createPeriod(1, 2026);
            if (newPeriod) periodId = newPeriod.id;
        }

        if (!periodId) return { error: 'Failed to create period' };

        // 3. Update schedules
        return await this.supabase.client
            .from('maintenance_schedules')
            .update({ period_id: periodId })
            .gte('scheduled_date', '2026-01-01')
            .lt('scheduled_date', '2026-02-01')
            .is('period_id', null);
    }
}
