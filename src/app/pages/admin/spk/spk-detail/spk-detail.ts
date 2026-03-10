import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SpkService, Spk, SpkItem } from '../../../../services/spk/spk';
import { PricelistService, PricelistItem } from '../../../../services/pricelist/pricelist';
import { NewsReportService } from '../../../../services/news-report/news-report.service';
import { SweetAlertService } from '../../../../services/sweet-alert/sweet-alert.service';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-spk-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './spk-detail.html',
  styleUrl: './spk-detail.css',
})
export class SpkDetailComponent implements OnInit {
  spkId: number = 0;
  spk: Spk | null = null;
  isLoading = false;
  userRole: string | null = null;
  hasBeritaAcara = false;

  isItemsModalOpen = false;
  itemsFormData: { name: string, qty: number, price: number } = { name: '', qty: 1, price: 0 };

  pricelistItems: PricelistItem[] = [];

  completionNotes = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private spkService: SpkService,
    private pricelistService: PricelistService,
    private newsReportService: NewsReportService,
    private swal: SweetAlertService,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.auth.currentUser$.subscribe((u: any) => this.userRole = u?.role || null);
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.spkId = parseInt(id, 10);
        this.loadSpkDetail();
      }
    });
    this.loadPricelist();
  }

  async loadPricelist() {
    const { data } = await this.pricelistService.getItems();
    if (data) {
      this.pricelistItems = data;
    }
  }

  onPricelistChange(event: any) {
    const selectedId = parseInt(event.target.value, 10);
    const item = this.pricelistItems.find(p => p.id === selectedId);
    if (item) {
      this.itemsFormData.name = item.name;
      this.itemsFormData.price = item.price;
    }
  }

  async loadSpkDetail() {
    this.isLoading = true;
    const { data, error } = await this.spkService.getSpkById(this.spkId);
    this.isLoading = false;

    if (error) {
      this.swal.error('Ops!', error);
      this.router.navigate(['/admin/spk']);
      return;
    }

    this.spk = data;
    this.completionNotes = this.spk?.completion_notes || '';
  }

  async changeStatus(newStatus: string) {
    const confirm = await this.swal.confirm('Ubah Status SPK?', `Status akan diubah menjadi ${newStatus}.`);
    if (!confirm) return;

    this.isLoading = true;
    const { error } = await this.spkService.updateSpk(this.spkId, { status: newStatus });
    this.isLoading = false;

    if (error) {
      this.swal.error('Error', error);
    } else {
      this.swal.success('Berhasil', 'Status SPK diperbarui');
      this.loadSpkDetail();
    }
  }

  openAddItemModal() {
    this.itemsFormData = { name: '', qty: 1, price: 0 };
    this.isItemsModalOpen = true;
  }

  closeItemsModal() {
    this.isItemsModalOpen = false;
  }

  async addSpkItem() {
    if (!this.itemsFormData.name || this.itemsFormData.qty <= 0 || this.itemsFormData.price <= 0) {
      this.swal.warning('Data tidak lengkap', 'Pastikan nama, jumlah, dan harga diisi');
      return;
    }

    const currentItems = this.spk?.items || [];
    const newItems = [...currentItems, {
      item_name: this.itemsFormData.name,
      qty: this.itemsFormData.qty,
      price_per_item: this.itemsFormData.price,
      pricelist_item_id: this.pricelistItems.find(p => p.name === this.itemsFormData.name)?.id || null
    }];

    this.isLoading = true;
    const { error } = await this.spkService.updateSpk(this.spkId, { items: newItems } as any);
    this.isLoading = false;

    if (error) {
      this.swal.error('Error', error);
    } else {
      this.swal.success('Berhasil', 'Item pekerjaan ditambahkan');
      this.closeItemsModal();
      this.loadSpkDetail();
    }
  }

  async removeItem(itemIndex: number) {
    const currentItems = this.spk?.items || [];
    const newItems = currentItems.filter((_, idx) => idx !== itemIndex);

    this.isLoading = true;
    const { error } = await this.spkService.updateSpk(this.spkId, { items: newItems } as any);
    this.isLoading = false;

    if (error) {
      this.swal.error('Error', error);
    } else {
      this.loadSpkDetail();
    }
  }

  async saveCompletion() {
    this.isLoading = true;
    const { error } = await this.spkService.updateSpk(this.spkId, {
      completion_notes: this.completionNotes,
      status: 'completed'
    });
    this.isLoading = false;

    if (error) {
      this.swal.error('Error', error);
    } else {
      this.swal.success('Selesai', 'SPK telah ditandai selesai.');
      this.loadSpkDetail();
    }
  }

  async downloadPdf() {
    try {
      this.isLoading = true;
      await this.spkService.downloadSpkPdf(this.spkId);
      this.isLoading = false;
    } catch (e) {
      this.isLoading = false;
      this.swal.error('Gagal Ekspor', 'Tidak dapat membuat PDF laporan SPK.');
    }
  }

  async generateBeritaAcara() {
    if (!this.spk) return;

    const confirmed = await this.swal.confirm(
      'Generate Berita Acara',
      'Apakah Anda yakin ingin membuat Berita Acara dari SPK ini?'
    );

    if (!confirmed) return;

    this.isLoading = true;

    try {
      const { data, error } = await this.newsReportService.createNewsReport({
        spk_id: this.spkId,
        title: `Berita Acara - ${this.spk.spk_number}`,
        report_date: new Date().toISOString(),
        completion_date: this.spk.updated_at || new Date().toISOString(),
        total_cost: this.spk.total_cost,
        is_warranty_claim: this.spk.is_warranty_claim,
        work_description: this.spk.completion_notes,
        status: 'draft'
      });

      if (error) {
        throw new Error(error);
      }

      this.hasBeritaAcara = true;
      this.swal.success('Berhasil', 'Berita Acara berhasil dibuat');

      // Navigate to news report detail or list
      if (data?.id) {
        this.router.navigate(['/admin/history'], {
          queryParams: { ba_id: data.id }
        });
      }
    } catch (error: any) {
      this.swal.error('Gagal', error.message || 'Gagal membuat Berita Acara');
    } finally {
      this.isLoading = false;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700 ring-gray-600/20';
      case 'assigned': return 'bg-blue-50 text-blue-700 ring-blue-600/20';
      case 'in_progress': return 'bg-amber-50 text-amber-700 ring-amber-600/20';
      case 'completed': return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
      case 'cancelled': return 'bg-red-50 text-red-700 ring-red-600/20';
      default: return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  }

  formatRupiah(amount: number | undefined): string {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }
}
