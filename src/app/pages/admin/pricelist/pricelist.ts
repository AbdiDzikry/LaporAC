import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PricelistService, PricelistItem, PricelistLog } from '../../../services/pricelist/pricelist';
import { VendorService, VendorProfile } from '../../../services/vendor/vendor.service';
import { SweetAlertService } from '../../../services/sweet-alert/sweet-alert.service';
import { AuthService } from '../../../services/auth/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-pricelist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pricelist.html',
  styleUrl: './pricelist.css',
})
export class PricelistComponent implements OnInit {
  items: PricelistItem[] = [];
  filteredItems: PricelistItem[] = [];
  logs: PricelistLog[] = [];

  isLoading = false;
  isLogModalOpen = false;
  isFormModalOpen = false;

  searchQuery = '';
  filterType: 'all' | 'jasa' | 'sparepart' = 'all';

  userRole: string | null = null;
  vendors: VendorProfile[] = [];
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  backendUrl = environment.apiUrl.replace('/api', '');

  formData: PricelistItem = {
    category: '',
    name: '',
    type: 'sparepart',
    old_price: 0,
    price: 0,
    unit: '',
    vendor_id: undefined
  };

  constructor(
    private pricelistService: PricelistService,
    private vendorService: VendorService,
    private swal: SweetAlertService,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.auth.currentUser$.subscribe(u => {
      this.userRole = u?.role || null;
      if (this.userRole === 'super_admin' || this.userRole === 'admin') {
        this.loadVendors();
      }
    });
    this.loadItems();
  }

  async loadVendors() {
    const { data } = await this.vendorService.getActiveVendors();
    if (data) {
      this.vendors = data;
    }
  }

  async loadItems() {
    this.isLoading = true;
    const { data, error } = await this.pricelistService.getItems();
    this.isLoading = false;

    if (error) {
      this.swal.error('Ops!', error);
      return;
    }
    this.items = data || [];
    this.applyFilters();
  }

  applyFilters() {
    this.filteredItems = this.items.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchType = this.filterType === 'all' || item.type === this.filterType;
      return matchSearch && matchType;
    });
  }

  openAddModal() {
    this.formData = { category: '', name: '', type: 'sparepart', price: 0, unit: '', vendor_id: undefined };
    this.selectedFile = null;
    this.imagePreview = null;
    this.isFormModalOpen = true;
  }

  openEditModal(item: PricelistItem) {
    this.formData = { ...item };
    this.selectedFile = null;
    this.imagePreview = item.image_path ? `${this.backendUrl}/storage/${item.image_path}` : null;
    this.isFormModalOpen = true;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = e => this.imagePreview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  closeFormModal() {
    this.isFormModalOpen = false;
  }

  async saveItem() {
    if (!this.formData.name || this.formData.price <= 0) {
      this.swal.warning('Peringatan', 'Nama dan Harga harus diisi dengan benar');
      return;
    }

    this.isLoading = true;

    const payload = new FormData();
    if (this.formData.category) {
      payload.append('category', this.formData.category);
    }
    payload.append('name', this.formData.name);
    payload.append('type', this.formData.type);
    payload.append('price', this.formData.price.toString());
    if (this.formData.old_price !== undefined && this.formData.old_price > 0) {
      payload.append('old_price', this.formData.old_price.toString());
    }
    if (this.formData.unit) {
      payload.append('unit', this.formData.unit);
    }

    if (this.formData.vendor_id) {
      payload.append('vendor_id', this.formData.vendor_id.toString());
    }

    if (this.selectedFile) {
      payload.append('image', this.selectedFile);
    }

    let res;
    if (this.formData.id) {
      res = await this.pricelistService.updateItem(this.formData.id, payload);
    } else {
      res = await this.pricelistService.createItem(payload);
    }
    this.isLoading = false;

    if (res.error) {
      this.swal.error('Error', res.error);
    } else {
      this.swal.success('Berhasil', 'Item berhasil disimpan');
      this.closeFormModal();
      this.loadItems();
    }
  }

  async viewLogs(id: number) {
    this.isLoading = true;
    const { data, error } = await this.pricelistService.getLogs(id);
    this.isLoading = false;

    if (error) {
      this.swal.error('Error', error);
      return;
    }

    this.logs = data || [];
    this.isLogModalOpen = true;
  }

  closeLogModal() {
    this.isLogModalOpen = false;
    this.logs = [];
  }

  async deleteItem(id: number) {
    const confirm = await this.swal.confirm('Hapus Item?', 'Item ini akan dihapus dari katalog harga.');
    if (!confirm) return;

    this.isLoading = true;
    const { error } = await this.pricelistService.deleteItem(id);
    this.isLoading = false;

    if (error) {
      this.swal.error('Error', error);
    } else {
      this.swal.success('Terhapus', 'Item berhasil dihapus');
      this.loadItems();
    }
  }

  formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }
}
