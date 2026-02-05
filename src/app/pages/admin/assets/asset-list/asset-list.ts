import { Component, OnInit } from '@angular/core'; // Added OnInit
import { CommonModule } from '@angular/common'; // Added CommonModule for *ngFor
import { AssetService, Asset, AssetDisposal } from '../../../../services/asset/asset';
import { ToastService } from '../../../../services/toast/toast'; // Import Toast
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-asset-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './asset-list.html',
  styleUrl: './asset-list.css'
})
export class AssetListComponent implements OnInit {
  allAssets: Asset[] = [];
  filteredAssets: Asset[] = [];
  loading = true;

  // View State
  viewMode: 'list' | 'visual' = 'list';

  // Filtering
  locations: string[] = [];
  brands: string[] = [];

  selectedLocation: string = 'Semua';
  selectedBrand: string = 'Semua';
  selectedStatus: string = 'Semua';
  searchQuery: string = '';

  // Custom Dropdown States
  locationDropdownOpen = false;
  brandDropdownOpen = false;
  statusDropdownOpen = false;

  // Disposal Modal State
  showDisposalModal = false;
  disposalForm: FormGroup;
  selectedAssetForDisposal: Asset | null = null;
  isSubmitting = false;

  constructor(
    private assetService: AssetService,
    private fb: FormBuilder,
    private toast: ToastService // Inject
  ) {
    this.disposalForm = this.fb.group({
      disposal_type: ['scrapped', Validators.required],
      sale_price: [0],
      notes: ['']
    });
  }

  ngOnInit() {
    this.loadAssets();
  }

  async loadAssets() {
    this.loading = true;
    try {
      const { data, error } = await this.assetService.getAssets();
      if (data) {
        this.allAssets = data as Asset[];
        this.extractFilters();
        this.filterAssets();
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  extractFilters() {
    // Unique Locations
    const locs = this.allAssets.map(a => a.location).filter(Boolean);
    this.locations = [...new Set(locs)].sort();

    // Unique Brands
    const brands = this.allAssets.map(a => a.brand).filter(Boolean);
    this.brands = [...new Set(brands)].sort();
  }

  setName(e: any) { this.searchQuery = e.target.value; this.filterAssets(); }
  setLocation(e: any) { this.selectedLocation = e.target.value; this.filterAssets(); }
  setBrand(e: any) { this.selectedBrand = e.target.value; this.filterAssets(); }
  setStatus(e: any) { this.selectedStatus = e.target.value; this.filterAssets(); }

  // Pagination
  currentPage = 1;
  itemsPerPage = 15;

  get paginatedAssets(): Asset[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredAssets.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredAssets.length / this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      // Scroll to top of table
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  filterAssets() {
    let result = this.allAssets;

    // 1. Location
    if (this.selectedLocation !== 'Semua') {
      result = result.filter(a => a.location === this.selectedLocation);
    }

    // 2. Brand
    if (this.selectedBrand !== 'Semua') {
      result = result.filter(a => a.brand === this.selectedBrand);
    }

    // 3. Status
    if (this.selectedStatus !== 'Semua') {
      result = result.filter(a => a.status === this.selectedStatus);
    }

    // 4. Search
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(a =>
        (a.name || '').toLowerCase().includes(q) ||
        (a.sku || '').toLowerCase().includes(q) ||
        (a.brand || '').toLowerCase().includes(q) ||
        (a.location || '').toLowerCase().includes(q)
      );
    }

    this.filteredAssets = result;
    this.currentPage = 1; // Reset to first page on filter change
  }

  // Helper for Visual Map to respect ALL filters, not just location
  // If a filter is applied, we only show locations that contain matching assets
  getAssetsByLocation(location: string): Asset[] {
    return this.filteredAssets.filter(a => a.location === location);
  }

  // Custom Dropdown Methods
  toggleLocationDropdown() {
    this.locationDropdownOpen = !this.locationDropdownOpen;
    this.brandDropdownOpen = false;
    this.statusDropdownOpen = false;
  }

  toggleBrandDropdown() {
    this.brandDropdownOpen = !this.brandDropdownOpen;
    this.locationDropdownOpen = false;
    this.statusDropdownOpen = false;
  }

  toggleStatusDropdown() {
    this.statusDropdownOpen = !this.statusDropdownOpen;
    this.locationDropdownOpen = false;
    this.brandDropdownOpen = false;
  }

  selectLocation(loc: string) {
    this.selectedLocation = loc;
    this.locationDropdownOpen = false;
    this.filterAssets();
  }

  selectBrand(brand: string) {
    this.selectedBrand = brand;
    this.brandDropdownOpen = false;
    this.filterAssets();
  }

  selectStatus(status: string) {
    this.selectedStatus = status;
    this.statusDropdownOpen = false;
    this.filterAssets();
  }

  closeAllDropdowns() {
    this.locationDropdownOpen = false;
    this.brandDropdownOpen = false;
    this.statusDropdownOpen = false;
  }

  async deleteAsset(asset: Asset) {
    const confirmDelete = confirm(
      `Apakah Anda yakin ingin menghapus aset "${asset.name}" (${asset.sku})?\n\nTindakan ini tidak dapat dibatalkan.`
    );

    if (!confirmDelete) return;

    try {
      const { error } = await this.assetService.deleteAsset(asset.id!);

      if (error) {
        this.toast.show('Gagal menghapus aset: ' + error.message, 'error');
        return;
      }

      // Remove from local arrays
      this.allAssets = this.allAssets.filter(a => a.id !== asset.id);
      this.filterAssets();

      this.toast.show('Aset berhasil dihapus!', 'success');
    } catch (e: any) {
      console.error('Delete error:', e);
      this.toast.show('Terjadi kesalahan saat menghapus aset', 'error');
    }
  }

  // --- DISPOSAL LOGIC ---

  openDisposalModal(asset: Asset) {
    this.selectedAssetForDisposal = asset;
    this.showDisposalModal = true;
    this.disposalForm.reset({
      disposal_type: 'scrapped',
      sale_price: asset.residual_value || 0,
      notes: ''
    });
  }

  closeDisposalModal() {
    this.showDisposalModal = false;
    this.selectedAssetForDisposal = null;
  }

  async submitDisposal() {
    if (this.disposalForm.invalid || !this.selectedAssetForDisposal) return;

    if (!confirm('Apakah anda yakin ingin memproses data ini? Data tidak bisa dikembalikan.')) return;

    this.isSubmitting = true;
    try {
      const disposalData: AssetDisposal = {
        asset_id: this.selectedAssetForDisposal.id!,
        disposal_date: new Date().toISOString(),
        ...this.disposalForm.value
      };

      await this.assetService.disposeAsset(disposalData);

      // Update local state
      this.closeDisposalModal();
      await this.loadAssets(); // Reload to see changes (asset likely gone or status updated)
      this.toast.show('Aset berhasil dihapus/dimusnahkan.', 'success');

    } catch (e) {
      console.error(e);
      this.toast.show('Gagal memproses penghapusan aset.', 'error');
    } finally {
      this.isSubmitting = false;
    }
  }

  calculateBookValue(asset: Asset): number {
    return this.assetService.calculateBookValue(asset);
  }

  getAssetType(asset: Asset): 'split' | 'cassette' | 'standing' {
    const text = (asset.brand + ' ' + asset.name).toLowerCase();

    // 1. FLOOR STANDING
    if (text.includes('standing') || text.includes('floor')) return 'standing';

    // 2. CASSETTE / CENTRAL / CEILING / INDUSTRIAL / LARGE PK
    // Check for keywords
    if (text.includes('cassette') || text.includes('casset') || text.includes('kaset') ||
      text.includes('ceiling') || text.includes('sentral') || text.includes('central') ||
      text.includes('ducting') || text.includes('chiller') || text.includes('aicool')) {
      return 'cassette';
    }

    // Check for High PK (>= 2.5 PK is typically Cassette/Central in this context)
    if (asset.pk) {
      const pkValue = parseFloat(asset.pk.replace(',', '.').replace(/[^\d.]/g, ''));
      if (!isNaN(pkValue) && pkValue >= 2.5) return 'cassette';
    }

    // 3. Default to SPLIT (Wall)
    return 'split';
  }
}
