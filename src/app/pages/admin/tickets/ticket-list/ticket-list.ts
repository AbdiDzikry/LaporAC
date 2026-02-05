import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TicketService } from '../../../../services/ticket/ticket';
import { ToastService } from '../../../../services/toast/toast'; // Import Toast

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ticket-list.html',
  styleUrl: './ticket-list.css'
})
export class TicketListComponent implements OnInit {
  tickets: any[] = [];
  loading = false;

  constructor(
    private ticketService: TicketService,
    private toast: ToastService // Add Toast
  ) { }

  ngOnInit() {
    this.loadTickets();
  }

  async loadTickets() {
    this.loading = true;
    const { data, error } = await this.ticketService.getTickets();
    if (data) {
      this.tickets = data;
    }
    this.loading = false;
  }

  // Filter Logic
  activeTab: 'all' | 'pending' | 'open' | 'resolved' = 'all';

  get filteredTickets() {
    if (this.activeTab === 'all') return this.tickets;

    if (this.activeTab === 'pending') {
      return this.tickets.filter(t => t.status === 'pending_validation');
    }

    if (this.activeTab === 'open') {
      return this.tickets.filter(t => ['open', 'assigned', 'in_progress'].includes(t.status));
    }

    if (this.activeTab === 'resolved') {
      return this.tickets.filter(t => ['resolved', 'closed'].includes(t.status));
    }

    return this.tickets;
  }

  setTab(tab: 'all' | 'pending' | 'open' | 'resolved') {
    this.activeTab = tab;
  }

  // Action Logic
  async validateTicket(ticket: any, isValid: boolean) {
    if (!confirm(isValid
      ? 'Validasi laporan ini sebagai kerusakan nyata? (Akan diteruskan ke teknisi)'
      : 'Tolak laporan ini sebagai False Alarm? (Laporan akan ditutup)')) return;

    try {
      const { error } = await this.ticketService.validateTicket(ticket.id, isValid ? 'valid' : 'invalid');
      if (error) throw error;

      this.toast.show(isValid ? 'Laporan Divalidasi!' : 'Laporan Ditolak / False Alarm', 'success');
      this.loadTickets(); // Reload
    } catch (e) {
      console.error(e);
      this.toast.show('Gagal memproses validasi', 'error');
    }
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'pending_validation': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'open': return 'bg-red-50 text-red-700 border-red-200';
      case 'assigned': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'in_progress': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'resolved': return 'bg-green-50 text-green-700 border-green-200';
      case 'closed': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'false_alarm': return 'bg-gray-100 text-gray-500 border-gray-200 line-through';
      default: return 'bg-gray-50 text-gray-800';
    }
  }
}
