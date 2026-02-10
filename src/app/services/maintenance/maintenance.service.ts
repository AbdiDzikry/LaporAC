import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase/supabase';
import { AssetService } from './asset/asset';
import { TicketService } from './ticket/ticket';
import { AuditService } from './audit/audit';
import { ErrorHandlerService } from './error-handler/error-handler.service';
import { NotificationService } from './notification/notification.service';

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
    brand?: string;
    pk?: string;
    maintenance_interval_days: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {

  constructor(
    private supabase: SupabaseService,
    private assetService: AssetService,
    private ticketService: TicketService,
    private audit: AuditService,
    private errorHandler: ErrorHandlerService,
    private notificationService: NotificationService
  ) { }

  /**
   * Get maintenance schedules.
   * @param filter 'upcoming' | 'history' | 'all' | 'overdue'
   */
  async getSchedules(filter: 'upcoming' | 'history' | 'all' | 'overdue' | 'today' = 'upcoming') {
    try {
      let query = this.supabase.client
        .from('maintenance_schedules')
        .select('*, assets(name, location, sku, brand, pk, maintenance_interval_days)')
        .order('scheduled_date', { ascending: true });

      const today = new Date().toISOString().split('T')[0];

      switch (filter) {
        case 'upcoming':
          // Only show non-completed items that are today or in the future
          query = query.gte('scheduled_date', today).neq('status', 'completed').neq('status', 'skipped');
          break;
        case 'today':
          // Only show items scheduled for today
          query = query.eq('scheduled_date', today).neq('status', 'completed').neq('status', 'skipped');
          break;
        case 'overdue':
          // Show items that were scheduled before today but not completed
          query = query.lt('scheduled_date', today).neq('status', 'completed').neq('status', 'skipped');
          break;
        case 'history':
          query = query.in('status', ['completed', 'skipped']);
          break;
        case 'all':
          // No additional filters
          break;
      }

      const result = await query;
      if (result.error) {
        throw result.error;
      }

      return result;
    } catch (error) {
      this.errorHandler.handleError(error, 'Gagal mengambil jadwal pemeliharaan');
      throw error;
    }
  }

  /**
   * Get assets due for maintenance in the next X days.
   * This checks the `next_maintenance_date` on the ASSETS table.
   */
  async getAssetsDue(days: number = 7) {
    try {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + days);

      const result = await this.supabase.client
        .from('assets')
        .select('*')
        .lte('next_maintenance_date', futureDate.toISOString().split('T')[0])
        .order('next_maintenance_date', { ascending: true });

      if (result.error) {
        throw result.error;
      }

      return result;
    } catch (error) {
      this.errorHandler.handleError(error, `Gagal mengambil aset yang jatuh tempo dalam ${days} hari`);
      throw error;
    }
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
      const ticketResult = await this.ticketService.createTicket({
        asset_id: asset.id,
        issue_category: 'preventive_maintenance',
        description: description,
        reporter_name: 'System Auto-Scheduler',
        status: 'open', // Direct to open for technician
        reporter_nik: 'SYSTEM'
      } as any);

      if (ticketResult.error) {
        throw ticketResult.error;
      }

      const ticketId = (ticketResult.data as any)?.id || (ticketResult.data as any)[0]?.id;

      // 2. Create Schedule Record
      const scheduleResult = await this.supabase.client
        .from('maintenance_schedules')
        .insert({
          asset_id: asset.id,
          scheduled_date: new Date().toISOString().split('T')[0], // Scheduled for Today
          status: 'in_progress', // Created and immediately active
          ticket_id: ticketId
        })
        .select()
        .single();

      if (scheduleResult.error) {
        throw scheduleResult.error;
      }

      await this.audit.logAction('PM_GENERATED', 'maintenance_schedules', asset.id, { ticket_id: ticketId });

      // Notify about PM generation
      this.notificationService.showSuccess(`Jadwal PM dibuat untuk aset ${asset.name}`, 'PM Terjadwal');

      return { success: true, ticketId, scheduleId: scheduleResult.data?.id };
    } catch (error) {
      this.errorHandler.handleError(error, 'Gagal membuat tiket pemeliharaan preventif');
      throw error;
    }
  }

  /**
   * Create a single maintenance schedule manually
   */
  async createSchedule(assetId: number, scheduledDate: string) {
    try {
      const payload: any = {
        asset_id: assetId,
        scheduled_date: scheduledDate,
        status: 'scheduled'
      };

      const result = await this.supabase.client
        .from('maintenance_schedules')
        .insert(payload)
        .select()
        .single();

      if (result.error) {
        throw result.error;
      }

      await this.audit.logAction('SCHEDULE_CREATED', 'maintenance_schedules', assetId, {
        scheduled_date: scheduledDate
      });

      // Notify about schedule creation
      const assetResult = await this.assetService.getAssetById(assetId);
      if (assetResult.data) {
        this.notificationService.showInfo(`Jadwal PM dibuat untuk ${assetResult.data.name} pada ${scheduledDate}`, 'Jadwal Dibuat');
      }

      return result;
    } catch (error) {
      this.errorHandler.handleError(error, 'Gagal membuat jadwal pemeliharaan');
      throw error;
    }
  }

  /**
   * Create multiple schedules for the same date (bulk creation)
   */
  async createBulkSchedules(assetIds: number[], scheduledDate: string) {
    try {
      const schedules = assetIds.map(assetId => ({
        asset_id: assetId,
        scheduled_date: scheduledDate,
        status: 'scheduled' as const
      }));

      const result = await this.supabase.client
        .from('maintenance_schedules')
        .insert(schedules)
        .select();

      if (result.error) {
        throw result.error;
      }

      await this.audit.logAction('BULK_SCHEDULE_CREATED', 'maintenance_schedules', 0, {
        count: assetIds.length,
        scheduled_date: scheduledDate
      });

      // Notify about bulk schedule creation
      this.notificationService.showSuccess(`Jadwal PM massal dibuat untuk ${assetIds.length} aset`, 'Jadwal Massal Dibuat');

      return result;
    } catch (error) {
      this.errorHandler.handleError(error, 'Gagal membuat jadwal pemeliharaan massal');
      throw error;
    }
  }

  /**
   * Complete a maintenance schedule
   */
  async completeMaintenance(id: number, notes: string) {
    try {
      // 1. Update Schedule
      const result = await this.supabase.client
        .from('maintenance_schedules')
        .update({
          status: 'completed',
          completed_date: new Date().toISOString(),
          technician_notes: notes
        })
        .eq('id', id)
        .select()
        .single();

      if (result.error) {
        throw result.error;
      }

      // 2. Update asset's maintenance dates
      await this.updateNextMaintenanceDate(result.data.asset_id);

      // 3. Log the action
      await this.audit.logAction('MAINTENANCE_COMPLETED', 'maintenance_schedules', id, { notes });

      // 4. Notify about completion
      const scheduleResult = await this.supabase.client
        .from('maintenance_schedules')
        .select('assets(name)')
        .eq('id', id)
        .single();

      if (scheduleResult.data?.assets?.name) {
        this.notificationService.showSuccess(`Pemeliharaan selesai untuk ${scheduleResult.data.assets.name}`, 'PM Selesai');
      }

      return result;
    } catch (error) {
      this.errorHandler.handleError(error, 'Gagal menyelesaikan pemeliharaan');
      throw error;
    }
  }

  /**
   * Skip a maintenance schedule
   */
  async skipMaintenance(id: number, reason: string) {
    try {
      const result = await this.supabase.client
        .from('maintenance_schedules')
        .update({
          status: 'skipped',
          technician_notes: `Dilewati: ${reason}`
        })
        .eq('id', id)
        .select()
        .single();

      if (result.error) {
        throw result.error;
      }

      // Log the action
      await this.audit.logAction('MAINTENANCE_SKIPPED', 'maintenance_schedules', id, { reason });

      // Notify about skipping
      const scheduleResult = await this.supabase.client
        .from('maintenance_schedules')
        .select('assets(name)')
        .eq('id', id)
        .single();

      if (scheduleResult.data?.assets?.name) {
        this.notificationService.showInfo(`Pemeliharaan dilewati untuk ${scheduleResult.data.assets.name}: ${reason}`, 'PM Dilewati');
      }

      return result;
    } catch (error) {
      this.errorHandler.handleError(error, 'Gagal melewati pemeliharaan');
      throw error;
    }
  }

  async updateNextMaintenanceDate(assetId: number) {
    try {
      // Get asset interval
      const { data: asset } = await this.supabase.client
        .from('assets')
        .select('maintenance_interval_days')
        .eq('id', assetId)
        .single();

      if (!asset || !asset.maintenance_interval_days) return;

      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + asset.maintenance_interval_days);

      const result = await this.supabase.client.from('assets').update({
        last_maintenance_date: new Date().toISOString(),
        next_maintenance_date: nextDate.toISOString()
      }).eq('id', assetId);

      if (result.error) {
        throw result.error;
      }

      return result;
    } catch (error) {
      console.error('Error updating next maintenance date:', error);
      // Don't throw error here as it's not critical to the main operation
    }
  }

  /**
   * Automatically generate maintenance schedules for all assets
   */
  async generateAllMaintenanceSchedules(monthsAhead: number = 3) {
    try {
      // Get all active assets
      const { data: assets } = await this.assetService.getAssets();
      
      if (!assets) {
        throw new Error('Tidak dapat mengambil data aset');
      }

      const activeAssets = assets.filter(asset => asset.is_active !== false);
      const schedulesToCreate = [];

      // Generate schedules for each asset for the next few months
      for (const asset of activeAssets) {
        if (!asset.maintenance_interval_days) continue;

        // Generate schedule for the next occurrence
        const nextDate = new Date();
        if (asset.next_maintenance_date) {
          // If there's already a next maintenance date, use that as the starting point
          nextDate.setTime(new Date(asset.next_maintenance_date).getTime());
        } else if (asset.last_maintenance_date) {
          // If no next date but has last maintenance date, calculate from there
          nextDate.setTime(new Date(asset.last_maintenance_date).getTime());
          nextDate.setDate(nextDate.getDate() + asset.maintenance_interval_days);
        } else {
          // If no maintenance history, start from today
          nextDate.setDate(nextDate.getDate() + asset.maintenance_interval_days);
        }

        // Add schedule if it's within our target timeframe
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + monthsAhead);

        if (nextDate <= maxDate) {
          schedulesToCreate.push({
            asset_id: asset.id,
            scheduled_date: nextDate.toISOString().split('T')[0],
            status: 'scheduled'
          });
        }
      }

      if (schedulesToCreate.length > 0) {
        const result = await this.supabase.client
          .from('maintenance_schedules')
          .insert(schedulesToCreate)
          .select();

        if (result.error) {
          throw result.error;
        }

        await this.audit.logAction('AUTO_SCHEDULE_GENERATED', 'maintenance_schedules', 0, {
          count: schedulesToCreate.length,
          months_ahead: monthsAhead
        });

        this.notificationService.showSuccess(`Jadwal PM otomatis dibuat untuk ${schedulesToCreate.length} aset`, 'Jadwal Otomatis Dibuat');
        
        return { success: true, count: schedulesToCreate.length };
      }

      return { success: true, count: 0 };
    } catch (error) {
      this.errorHandler.handleError(error, 'Gagal membuat jadwal pemeliharaan otomatis');
      throw error;
    }
  }
}