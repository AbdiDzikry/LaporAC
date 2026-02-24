import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuditService } from '../audit/audit';
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
  status: 'pending_validation' | 'open' | 'assigned' | 'in_progress' | 'pending_verification' | 'resolved' | 'closed' | 'cancelled' | 'false_alarm' | 'vendor_prep';
  photo_url?: string;

  // Flowchart Specifics
  is_damage_confirmed?: boolean; // Rusak / Perlu Perbaikan?
  action_type?: 'internal' | 'vendor'; // Siapa yang kerja?
  vendor_name?: string; // If 'vendor'

  // Maker-Checker Fields
  technician_id?: string; // UUID/String
  started_at?: string;
  completed_at?: string; // Technician finished

  verified_by?: string; // UUID/String (Admin)
  verified_at?: string;
  verification_notes?: string;

  assets?: any; // To hold joined asset info
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = `${environment.apiUrl}/tickets`;

  constructor(
    private http: HttpClient,
    private audit: AuditService,
    private errorHandler: ErrorHandlerService,
    private notificationService: NotificationService
  ) { }

  async createTicket(ticket: Ticket) {
    try {
      const data = await firstValueFrom(this.http.post<Ticket>(this.apiUrl, ticket));

      try {
        await this.audit.logAction('TICKET_CREATED', 'tickets', data?.id || 0, {
          asset_id: ticket.asset_id,
          reporter_nik: ticket.reporter_nik,
          issue_category: ticket.issue_category
        });
      } catch (e) { }

      if (data && data.id) {
        this.notificationService.notifyTicketCreated(data.id, ticket.asset_id.toString());
      }

      return { data, error: null };
    } catch (error: any) {
      this.errorHandler.handleError(error, 'Gagal membuat tiket baru');
      return { data: null, error };
    }
  }

  async getTickets() {
    try {
      const data = await firstValueFrom(this.http.get<Ticket[]>(this.apiUrl));
      return { data, error: null };
    } catch (error: any) {
      this.errorHandler.handleError(error, 'Gagal mengambil daftar tiket');
      return { data: null, error };
    }
  }

  async getTicketById(id: number) {
    try {
      const data = await firstValueFrom(this.http.get<Ticket>(`${this.apiUrl}/${id}`));
      return { data, error: null };
    } catch (error: any) {
      this.errorHandler.handleError(error, 'Gagal mengambil detail tiket');
      return { data: null, error };
    }
  }

  async updateTicket(id: number, ticket: Partial<Ticket> | any) {
    try {
      const data = await firstValueFrom(this.http.put<Ticket>(`${this.apiUrl}/${id}`, ticket));

      try {
        await this.audit.logAction('TICKET_UPDATED', 'tickets', id, {
          changes: ticket,
          updated_at: new Date().toISOString()
        });
      } catch (e) { }

      if (ticket.status) {
        this.notificationService.notifyTicketUpdated(id, ticket.status);
      }

      return { data, error: null };
    } catch (error: any) {
      this.errorHandler.handleError(error, 'Gagal memperbarui tiket');
      return { data: null, error };
    }
  }

  // --- Business Process Methods ---

  async assignTicket(id: number, technicianId: string) {
    try {
      const result = await this.updateTicket(id, {
        status: 'assigned',
        assigned_technician_id: parseInt(technicianId) || technicianId // Keep string or number depending on backend schema
      });

      this.notificationService.showInfo(`Tiket #${id} telah ditugaskan ke teknisi`, 'Tiket Ditugaskan');

      return result;
    } catch (error: any) {
      this.errorHandler.handleError(error, 'Gagal menetapkan teknisi ke tiket');
      return { data: null, error };
    }
  }

  async startWork(id: number) {
    try {
      const result = await this.updateTicket(id, {
        status: 'in_progress',
        started_at: new Date().toISOString()
      });

      this.notificationService.showInfo(`Pengerjaan tiket #${id} telah dimulai`, 'Pengerjaan Dimulai');

      return result;
    } catch (error: any) {
      this.errorHandler.handleError(error, 'Gagal memulai pengerjaan tiket');
      return { data: null, error };
    }
  }

  async submitForVerification(id: number, notes: string, cost: number) {
    try {
      const result = await this.updateTicket(id, {
        status: 'pending_verification',
        resolution_notes: notes, // map to completion_notes on backend if needed, or keep resolution_notes
        completion_notes: notes,
        cost: cost,
        completed_at: new Date().toISOString(),
        completion_date: new Date().toISOString()
      });

      this.notificationService.showInfo(`Tiket #${id} menunggu verifikasi`, 'Verifikasi Diperlukan');

      return result;
    } catch (error: any) {
      this.errorHandler.handleError(error, 'Gagal mengirim tiket untuk verifikasi');
      return { data: null, error };
    }
  }

  async verifyTicket(id: number, verifierId: string, notes: string) {
    try {
      const response = await this.updateTicket(id, {
        status: 'resolved',
        validated_by_id: parseInt(verifierId) || verifierId,
        validation_date: new Date().toISOString(),
        validation_notes: notes
      });

      if (!response.error) {
        try {
          await this.audit.logAction('TICKET_VERIFIED', 'tickets', id, { verified_by: verifierId });
        } catch (e) { }

        this.notificationService.showSuccess(`Tiket #${id} telah diverifikasi`, 'Tiket Terverifikasi');
      }
      return response;
    } catch (error: any) {
      this.errorHandler.handleError(error, 'Gagal memverifikasi tiket');
      return { data: null, error };
    }
  }

  // --- GA Validation Flow ---
  async validateTicket(id: number, decision: 'valid' | 'invalid', notes?: string) {
    try {
      const newStatus = decision === 'valid' ? 'open' : 'false_alarm';

      const updatePayload: any = { status: newStatus };

      if (newStatus === 'false_alarm') {
        updatePayload.completion_date = new Date().toISOString();
        updatePayload.completion_notes = notes || 'Marked as False Alarm by GA';
      }

      const response = await this.updateTicket(id, updatePayload);

      if (!response.error) {
        try {
          await this.audit.logAction('TICKET_VALIDATED', 'tickets', id, { decision, notes });
        } catch (e) { }

        if (decision === 'valid') {
          this.notificationService.showSuccess(`Tiket #${id} divalidasi sebagai valid`, 'Tiket Divalidasi');
        } else {
          this.notificationService.showInfo(`Tiket #${id} ditandai sebagai false alarm`, 'Tiket Divalidasi');
        }
      }
      return response;
    } catch (error: any) {
      this.errorHandler.handleError(error, 'Gagal memvalidasi tiket');
      return { data: null, error };
    }
  }
}
