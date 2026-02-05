import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase/supabase';
import { AuditService } from '../audit/audit'; // Import

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
    private audit: AuditService // Inject
  ) { }

  async createTicket(ticket: Ticket) {
    return await this.supabase.client
      .from('tickets')
      .insert(ticket);
  }

  async getTickets() {
    return await this.supabase.client
      .from('tickets')
      .select('*, assets(name, location, sku)')
      .order('created_at', { ascending: false });
  }
  async getTicketById(id: number) {
    return await this.supabase.client
      .from('tickets')
      .select('*, assets(*)')
      .eq('id', id)
      .single();
  }

  async updateTicket(id: number, ticket: Partial<Ticket> | any) {
    return await this.supabase.client
      .from('tickets')
      .update(ticket)
      .eq('id', id);
  }

  // --- Business Process Methods ---

  async assignTicket(id: number, technicianId: string) {
    return await this.updateTicket(id, {
      status: 'assigned',
      technician_id: technicianId
    });
  }

  async startWork(id: number) {
    return await this.updateTicket(id, {
      status: 'in_progress',
      started_at: new Date().toISOString()
    });
  }

  async submitForVerification(id: number, notes: string, cost: number) {
    return await this.updateTicket(id, {
      status: 'pending_verification',
      resolution_notes: notes,
      repair_cost: cost,
      completed_at: new Date().toISOString()
    });
  }

  async verifyTicket(id: number, verifierId: string, notes: string) {
    const response = await this.updateTicket(id, {
      status: 'resolved', // or 'closed'
      verified_by: verifierId,
      verified_at: new Date().toISOString(),
      verification_notes: notes
    });

    if (!response.error) {
      await this.audit.logAction('TICKET_VERIFIED', 'tickets', id, { verified_by: verifierId });
    }
    return response;
  }
  // --- GA Validation Flow ---
  async validateTicket(id: number, decision: 'valid' | 'invalid', notes?: string) {
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
    }
    return response;
  }
}
