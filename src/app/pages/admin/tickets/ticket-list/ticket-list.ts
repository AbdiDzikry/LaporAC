import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TicketService } from '../../../../services/ticket/ticket';
import { ToastService } from '../../../../services/toast/toast'; // Import Toast

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NgClass],
  templateUrl: './ticket-list.html',
  styleUrl: './ticket-list.css'
})
export class TicketListComponent implements OnInit {
  tickets: any[] = [];
  loading = false;
  today = new Date();

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

  // Search and Filter Logic
  activeTab: 'all' | 'pending' | 'open' | 'resolved' = 'all';
  searchQuery: string = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;

  get filteredTickets() {
    let filtered = this.tickets;

    // Status Filter
    if (this.activeTab !== 'all') {
      if (this.activeTab === 'pending') {
        filtered = filtered.filter(t => t.status === 'pending_validation');
      } else if (this.activeTab === 'open') {
        filtered = filtered.filter(t => ['open', 'assigned', 'in_progress', 'vendor_prep'].includes(t.status));
      } else if (this.activeTab === 'resolved') {
        filtered = filtered.filter(t => ['pending_verification', 'resolved', 'closed'].includes(t.status));
      }
    }

    // Search Filter
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.id?.toString().includes(q) ||
        t.assets?.name?.toLowerCase().includes(q) ||
        t.assets?.sku?.toLowerCase().includes(q) ||
        t.reporter_name?.toLowerCase().includes(q) ||
        t.issue_category?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredTickets.length / this.pageSize) || 1;
  }

  get paginatedTickets() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredTickets.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) pages.push(i);
    return pages;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  setTab(tab: 'all' | 'pending' | 'open' | 'resolved') {
    this.activeTab = tab;
    this.currentPage = 1;
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

  // #9: Export CSV
  exportCSV() {
    const headers = ['ID', 'Aset', 'SKU', 'Lokasi', 'Kategori', 'Pelapor', 'NPK', 'Status', 'Tanggal'];
    const rows = this.filteredTickets.map((t: any) => [
      t.id,
      t.assets?.name || '-',
      t.assets?.sku || '-',
      t.assets?.location || '-',
      t.issue_category || '-',
      t.reporter_name || '-',
      t.reporter_nik || '-',
      t.status,
      t.created_at ? new Date(t.created_at).toLocaleDateString('id-ID') : '-'
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tiket_LaporAC_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast.show('CSV berhasil didownload', 'success');
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'pending_validation': return 'status-pending_validation';
      case 'open': return 'status-open';
      case 'assigned': return 'status-assigned';
      case 'in_progress': return 'status-in_progress';
      case 'vendor_prep': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'pending_verification': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'resolved': return 'status-resolved';
      case 'closed': return 'status-closed';
      case 'false_alarm': return 'status-false_alarm';
      default: return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  }
}
