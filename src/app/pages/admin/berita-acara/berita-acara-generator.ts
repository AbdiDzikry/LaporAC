import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpkService, Spk } from '../../../services/spk/spk';
import { SweetAlertService } from '../../../services/sweet-alert/sweet-alert.service';
import { AuthService } from '../../../services/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-berita-acara-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './berita-acara-generator.html',
  styleUrl: './berita-acara-generator.css'
})
export class BeritaAcaraGeneratorComponent implements OnInit {
  resolvedSpks: Spk[] = [];
  selectedIds: Set<number> = new Set();
  isLoading = false;
  isGenerating = false;

  filterFrom = '';
  filterTo = '';

  constructor(
    private spkService: SpkService,
    private swal: SweetAlertService,
    private auth: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadResolvedSpks();
  }

  async loadResolvedSpks() {
    this.isLoading = true;
    const { data, error } = await this.spkService.getResolvedSpks(
      this.filterFrom || undefined,
      this.filterTo || undefined
    );
    this.isLoading = false;

    if (error) {
      this.swal.error('Error', error);
      return;
    }
    this.resolvedSpks = data || [];
    this.selectedIds.clear();
  }

  applyFilter() {
    this.loadResolvedSpks();
  }

  resetFilter() {
    this.filterFrom = '';
    this.filterTo = '';
    this.loadResolvedSpks();
  }

  toggleSelection(id: number) {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  isSelected(id: number): boolean {
    return this.selectedIds.has(id);
  }

  toggleSelectAll() {
    if (this.selectedIds.size === this.resolvedSpks.length) {
      this.selectedIds.clear();
    } else {
      this.resolvedSpks.forEach(spk => {
        if (spk.id) this.selectedIds.add(spk.id);
      });
    }
  }

  get isAllSelected(): boolean {
    return this.resolvedSpks.length > 0 && this.selectedIds.size === this.resolvedSpks.length;
  }

  async generateBeritaAcara() {
    if (this.selectedIds.size === 0) {
      this.swal.warning('Pilih SPK', 'Silakan centang minimal 1 SPK untuk digenerate.');
      return;
    }

    const confirmed = await this.swal.confirm(
      'Generate Berita Acara',
      `Anda akan meng-generate Berita Acara untuk ${this.selectedIds.size} SPK. Lanjutkan?`
    );
    if (!confirmed) return;

    this.isGenerating = true;
    try {
      const url = this.spkService.generateBeritaAcaraUrl();
      const response = await firstValueFrom(
        this.http.post(url, { spk_ids: Array.from(this.selectedIds) }, { responseType: 'blob' })
      );
      const blob = new Blob([response], { type: 'application/pdf' });
      const pdfUrl = window.URL.createObjectURL(blob);
      window.open(pdfUrl, '_blank');
    } catch (error: any) {
      this.swal.error('Gagal Generate', 'Tidak dapat meng-generate Berita Acara. Pastikan SPK sudah berstatus resolved.');
    } finally {
      this.isGenerating = false;
    }
  }

  formatRupiah(amount: number | undefined): string {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }

  get totalBiaya(): number {
    return this.resolvedSpks
      .filter(s => s.id && this.selectedIds.has(s.id))
      .reduce((sum, s) => sum + (s.is_warranty_claim ? 0 : (s.total_cost || 0)), 0);
  }
}
