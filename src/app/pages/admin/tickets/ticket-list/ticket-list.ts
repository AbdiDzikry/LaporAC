import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TicketService } from '../../../../services/ticket/ticket';
import { ToastService } from '../../../../services/toast/toast'; // Import Toast
import { VendorService } from '../../../../services/vendor/vendor.service'; // Import VendorService
import { AuthService } from '../../../../services/auth/auth.service';

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
  isAdminOrStaff = false;
  isVendor = false;
  currentUserId: number | null = null;

  constructor(
    private ticketService: TicketService,
    private toast: ToastService, // Add Toast
    private vendorService: VendorService, // Add VendorService
    private authService: AuthService
  ) { }

  async ngOnInit() {
    this.loadTickets();
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.isAdminOrStaff = ['super_admin', 'admin', 'staff', 'technician', 'dept_head'].includes(user.role);
      this.isVendor = user.role === 'vendor';
      this.currentUserId = Number(user.id);
    }
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

    // Vendor only sees tickets assigned to them
    if (this.isVendor) {
      filtered = filtered.filter(t =>
        ['assigned', 'in_progress', 'pending_verification', 'resolved', 'closed'].includes(t.status)
      );
    }

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
      case 'waiting_for_spk_approval': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'assigned': return 'status-assigned';
      case 'in_progress': return 'status-in_progress';
      case 'pending_verification': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'resolved': return 'status-resolved';
      case 'closed': return 'status-closed';
      case 'false_alarm': return 'status-false_alarm';
      default: return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  }

  // --- GA Validation Modal Logic ---
  selectedTicket: any = null;
  validationAction: 'internal' | 'vendor' | 'false_alarm' | null = null;
  validationNotes: string = '';

  // Selection data
  vendors: any[] = [];
  technicians: any[] = []; // In a real app, this should be fetched from UserService/RoleService

  selectedVendorId: number | null = null;
  selectedTechnicianId: number | null = null;
  selectedTechnicianName: string = '';

  openValidationModal(ticket: any) {
    this.selectedTicket = ticket;
    this.validationAction = null;
    this.validationNotes = '';
    this.selectedVendorId = null;
    this.selectedTechnicianId = null;
    this.selectedTechnicianName = '';
    this.loadVendors();
    // Simulate loading internal technicians (usually those with role 'technician')
    this.technicians = [
      { id: 2, name: 'Teknisi Internal 1' },
      { id: 3, name: 'Teknisi Internal 2' }
    ];
  }

  closeValidationModal() {
    this.selectedTicket = null;
  }

  async loadVendors() {
    try {
      const { data, error } = await this.vendorService.getActiveVendors();
      if (data) {
        this.vendors = data;
      } else if (error) {
        console.error('Failed to load active vendors:', error);
      }
    } catch (e) {
      console.error('Failed to load vendors', e);
    }
  }

  async submitValidation() {
    if (!this.selectedTicket || !this.validationAction) return;

    this.loading = true;
    try {
      let updatePayload: any = {
        status: '',
        action_type: this.validationAction,
        validation_notes: this.validationNotes
      };

      if (this.validationAction === 'false_alarm') {
        updatePayload.status = 'false_alarm';
        updatePayload.completion_date = new Date().toISOString();
        updatePayload.completion_notes = this.validationNotes;
      } else if (this.validationAction === 'internal') {
        if (!this.selectedTechnicianId) {
          this.toast.show('Pilih teknisi internal terlebih dahulu', 'warning');
          this.loading = false;
          return;
        }
        updatePayload.status = 'assigned';
        updatePayload.assigned_technician_id = this.selectedTechnicianId;

        const tech = this.technicians.find(t => t.id == this.selectedTechnicianId);
        if (tech) updatePayload.assigned_technician_name = tech.name;

      } else if (this.validationAction === 'vendor') {
        if (!this.selectedVendorId) {
          this.toast.show('Pilih vendor terlebih dahulu', 'warning');
          this.loading = false;
          return;
        }
        updatePayload.status = 'waiting_for_spk_approval'; // Waiting for Section Head
        // Note: Assuming Your Ticket Model handles assigned_vendor_id (needs to be added if not present)
        updatePayload.assigned_vendor_id = this.selectedVendorId;
      }

      const { error } = await this.ticketService.updateTicket(this.selectedTicket.id, updatePayload);

      if (error) throw error;

      this.toast.show('Penerusan Laporan Berhasil!', 'success');
      this.closeValidationModal();
      this.loadTickets(); // Reload
    } catch (e) {
      console.error(e);
      this.toast.show('Gagal memproses validasi', 'error');
    } finally {
      this.loading = false;
    }
  }
}
