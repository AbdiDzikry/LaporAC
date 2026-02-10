import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase/supabase';
import { AuditService } from '../audit/audit'; // Import
import { ErrorHandlerService } from '../error-handler/error-handler.service';
import { NotificationService } from '../notification/notification.service';

export interface Ticket {
  id?: number;
  created_at?: string;
  asset_id: number;
  reporter_nik?: string;
  reporter_name?: string;
  issue_category: string;
  description?: string;
  status: 'pending_validation' | 'open' | 'assigned' | 'in_progress' | 'pending_verification' | 'resolved' | 'closed' | 'cancelled' | 'false_alarm';
  photo_url?: string;

  // Maker-Checker Fields
  technician_id?: string; // UUID
  started_at?: string;
  completed_at?: string; // Technician finished

  verified_by?: string; // UUID (Admin)
  verified_at?: string;
  verification_notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  constructor(
    private supabase: SupabaseService,
    private audit: AuditService, // Inject
    private errorHandler: ErrorHandlerService,
    private notificationService: NotificationService
  ) { }

  async createTicket(ticket: Ticket) {
    try {
      const result = await this.supabase.client
        .from('tickets')
        .insert(ticket)
        .select()
        .single();

      if (result.error) {
        throw result.error;
      }

      // Log the creation
      await this.audit.logAction('TICKET_CREATED', 'tickets', result.data?.id || 0, { 
        asset_id: ticket.asset_id,
        reporter_nik: ticket.reporter_nik,
        issue_category: ticket.issue_category
      });

      // Notify about ticket creation
      if (result.data) {
        this.notificationService.notifyTicketCreated(result.data.id, ticket.asset_id.toString());
      }

      return result;
    } catch (error) {
      this.errorHandler.handleError(error, 'Gagal membuat tiket baru');
      throw error;
    }
  }

  async getTickets() {
    try {
      return await this.supabase.client
        .from('tickets')
        .select('*, assets(name, location, sku)')
        .order('created_at', { ascending: false });
    } catch (error) {
      this.errorHandler.handleError(error, 'Gagal mengambil daftar tiket');
      throw error;
    }
  }

  async getTicketById(id: number) {
    try {
      return await this.supabase.client
        .from('tickets')
        .select('*, assets(*)')
        .eq('id', id)
        .single();
    } catch (error) {
      this.errorHandler.handleError(error, 'Gagal mengambil detail tiket');
      throw error;
    }
  }

  async updateTicket(id: number, ticket: Partial<Ticket> | any) {
    try {
      const result = await this.supabase.client
        .from('tickets')
        .update(ticket)
        .eq('id', id)
        .select()
        .single();

      if (result.error) {
        throw result.error;
      }

      // Log the update
      await this.audit.logAction('TICKET_UPDATED', 'tickets', id, { 
        changes: ticket,
        updated_at: new Date().toISOString()
      });

      // Notify about ticket update
      if (ticket.status) {
        this.notificationService.notifyTicketUpdated(id, ticket.status);
      }

      return result;
    } catch (error) {
      this.errorHandler.handleError(error, 'Gagal memperbarui tiket');
      throw error;
    }
  }

  // --- Business Process Methods ---

  async assignTicket(id: number, technicianId: string) {
    try {
      const result = await this.updateTicket(id, {
        status: 'assigned',
        technician_id: technicianId
      });
      
      // Additional notification for assignment
      this.notificationService.showInfo(`Tiket #${id} telah ditugaskan ke teknisi`, 'Tiket Ditugaskan');
      
      return result;
    } catch (error) {
      this.errorHandler.handleError(error, 'Gagal menetapkan teknisi ke tiket');
      throw error;
    }
  }

  async startWork(id: number) {
    try {
      const result = await this.updateTicket(id, {
        status: 'in_progress',
        started_at: new Date().toISOString()
      });
      
      // Additional notification for work start
      this.notificationService.showInfo(`Pengerjaan tiket #${id} telah dimulai`, 'Pengerjaan Dimulai');
      
      return result;
    } catch (error) {
      this.errorHandler.handleError(error, 'Gagal memulai pengerjaan tiket');
      throw error;
    }
  }

  async submitForVerification(id: number, notes: string, cost: number) {
    try {
      const result = await this.updateTicket(id, {
        status: 'pending_verification',
        resolution_notes: notes,
        repair_cost: cost,
        completed_at: new Date().toISOString()
      });
      
      // Additional notification for verification submission
      this.notificationService.showInfo(`Tiket #${id} menunggu verifikasi`, 'Verifikasi Diperlukan');
      
      return result;
    } catch (error) {
      this.errorHandler.handleError(error, 'Gagal mengirim tiket untuk verifikasi');
      throw error;
    }
  }

  async verifyTicket(id: number, verifierId: string, notes: string) {
    try {
      const response = await this.updateTicket(id, {
        status: 'resolved', // or 'closed'
        verified_by: verifierId,
        verified_at: new Date().toISOString(),
        verification_notes: notes
      });

      if (!response.error) {
        await this.audit.logAction('TICKET_VERIFIED', 'tickets', id, { verified_by: verifierId });
        
        // Additional notification for verification
        this.notificationService.showSuccess(`Tiket #${id} telah diverifikasi`, 'Tiket Terverifikasi');
      }
      return response;
    } catch (error) {
      this.errorHandler.handleError(error, 'Gagal memverifikasi tiket');
      throw error;
    }
  }

  // --- GA Validation Flow ---
  async validateTicket(id: number, decision: 'valid' | 'invalid', notes?: string) {
    try {
      const newStatus = decision === 'valid' ? 'open' : 'false_alarm';

      // If invalid/false_alarm, we might want to close it immediately
      const updatePayload: any = { status: newStatus };

      if (newStatus === 'false_alarm') {
        updatePayload.completed_at = new Date().toISOString();
        updatePayload.resolution_notes = notes || 'Marked as False Alarm by GA';
      }

      const response = await this.updateTicket(id, updatePayload);

      if (!response.error) {
        await this.audit.logAction('TICKET_VALIDATED', 'tickets', id, { decision, notes });
        
        // Additional notification for validation
        if (decision === 'valid') {
          this.notificationService.showSuccess(`Tiket #${id} divalidasi sebagai valid`, 'Tiket Divalidasi');
        } else {
          this.notificationService.showInfo(`Tiket #${id} ditandai sebagai false alarm`, 'Tiket Divalidasi');
        }
      }
      return response;
    } catch (error) {
      this.errorHandler.handleError(error, 'Gagal memvalidasi tiket');
      throw error;
    }
  }
}
