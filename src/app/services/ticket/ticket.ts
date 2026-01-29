import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase/supabase';

export interface Ticket {
  id?: number;
  created_at?: string;
  asset_id: number;
  reporter_nik?: string;
  reporter_name?: string;
  issue_category: string;
  description?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  photo_url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  constructor(private supabase: SupabaseService) { }

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
}
