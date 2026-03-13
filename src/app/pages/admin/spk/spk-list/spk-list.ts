import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SpkService, Spk } from '../../../../services/spk/spk';
import { SpkService as SpkApiService } from '../../../../services/spk/spk.service';
import { SweetAlertService } from '../../../../services/sweet-alert/sweet-alert.service';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-spk-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './spk-list.html',
  styleUrl: './spk-list.css',
})
export class SpkListComponent implements OnInit {
  spks: Spk[] = [];
  filteredSpks: Spk[] = [];
  isLoading = false;
  searchQuery = '';
  statusFilter = 'all';

  userRole: string | null = null;

  constructor(
    private spkService: SpkService,
    private spkApiService: SpkApiService,
    private swal: SweetAlertService,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.auth.currentUser$.subscribe((u: any) => this.userRole = u?.role || null);
    this.loadSpks();
  }

  async loadSpks() {
    this.isLoading = true;
    const { data, error } = await this.spkService.getSpks();
    this.isLoading = false;

    if (error) {
      this.swal.error('Ops!', error);
      return;
    }
    this.spks = data || [];
    this.applyFilters();
  }

  applyFilters() {
    this.filteredSpks = this.spks.filter(spk => {
      const matchSearch = (spk.spk_number || '').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (spk.ticket?.asset?.name || '').toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchStatus = this.statusFilter === 'all' || spk.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700 ring-gray-600/20';
      case 'pending_approval': return 'bg-amber-50 text-amber-700 ring-amber-600/20';
      case 'assigned': return 'bg-blue-50 text-blue-700 ring-blue-600/20';
      case 'in_progress': return 'bg-amber-50 text-amber-700 ring-amber-600/20';
      case 'completed': return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
      case 'cancelled': return 'bg-red-50 text-red-700 ring-red-600/20';
      default: return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  }

  formatStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending_approval': 'Menunggu Persetujuan',
      'assigned': 'Ditugaskan',
      'pending_vendor_response': 'Menunggu Respon Vendor',
      'in_progress': 'Sedang Dikerjakan',
      'completed': 'Selesai',
      'cancelled': 'Dibatalkan',
      'draft': 'Draf'
    };
    return statusMap[status] || status.replace(/_/g, ' ').toUpperCase();
  }

  formatRupiah(amount: number | undefined): string {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }

  async approveBySectionHead(spk: Spk) {
    const confirm = await this.swal.confirm(
      'Setujui SPK?',
      `Anda akan menyetujui SPK ${spk.spk_number}. SPK akan diteruskan ke vendor dan admin. Vendor wajib datang maksimal 1 hari.`,
      'Ya, Setujui'
    );
    if (!confirm) return;

    this.isLoading = true;
    const { data, error } = await this.spkApiService.approveBySectionHead(spk.id!);
    this.isLoading = false;

    if (error) {
      this.swal.error('Gagal', error);
    } else {
      this.swal.success('Berhasil', 'SPK telah disetujui dan diterbitkan!');
      this.loadSpks();
    }
  }

  async rejectBySectionHead(spk: Spk) {
    const { value: rejectNotes } = await this.swal.prompt(
      'Tolak SPK',
      `Masukkan alasan penolakan untuk SPK ${spk.spk_number}:`
    );

    if (!rejectNotes) return; // User cancelled

    this.isLoading = true;
    const { data, error } = await this.spkApiService.rejectBySectionHead(spk.id!, rejectNotes);
    this.isLoading = false;

    if (error) {
      this.swal.error('Gagal', error);
    } else {
      this.swal.success('Berhasil', 'SPK telah ditolak dan dikembalikan ke admin.');
      this.loadSpks();
    }
  }
}
