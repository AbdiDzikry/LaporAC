import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssetService, Asset, AssetDisposal } from '../../../../services/asset/asset';
import { ToastService } from '../../../../services/toast/toast';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TicketService } from '../../../../services/ticket/ticket';

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

  // Ticket-aware data
  activeTicketsByAssetId: Map<number, { count: number; latestStatus: string; ticketId: number }> = new Map();

  // Stats
  get totalAssets() { return this.allAssets.length; }
  get normalCount() { return this.allAssets.filter(a => a.status === 'good').length; }
  get brokenCount() { return this.allAssets.filter(a => a.status === 'broken').length; }
  get maintenanceCount() { return this.allAssets.filter(a => a.status === 'maintenance').length; }
  get assetsWithTickets() { return this.activeTicketsByAssetId.size; }

  // Filtering
  locations: string[] = [];
  categories: string[] = [];
  brands: string[] = [];

  visualLocations: string[] = []; // Property to store creatively sorted locations for the Visual Tab

  selectedLocation: string = 'Semua';
  selectedCategory: string = 'Semua';
  selectedBrand: string = 'Semua';
  selectedStatus: string = 'Semua';
  searchQuery: string = '';

  // Custom Dropdown States
  locationDropdownOpen = false;
  categoryDropdownOpen = false;
  brandDropdownOpen = false;
  statusDropdownOpen = false;

  // Disposal Modal State
  showDisposalModal = false;
  disposalForm: FormGroup;
  selectedAssetForDisposal: Asset | null = null;
  isSubmitting = false;

  constructor(
    private assetService: AssetService,
    private ticketService: TicketService,
    private fb: FormBuilder,
    private toast: ToastService
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
      // Load assets and tickets
      const [assetsResult, ticketsResult] = await Promise.all([
        this.assetService.getAssets(),
        this.ticketService.getTickets()
      ]);

      if (assetsResult.data) {
        this.allAssets = assetsResult.data as Asset[];
        this.extractFilters();
      }

      // Build ticket lookup map
      this.activeTicketsByAssetId.clear();
      if (ticketsResult.data) {
        const activeTickets = (ticketsResult.data as any[]).filter(t =>
          !['resolved', 'closed', 'cancelled', 'false_alarm'].includes(t.status)
        );

        for (const t of activeTickets) {
          const existing = this.activeTicketsByAssetId.get(t.asset_id);
          if (existing) {
            existing.count++;
          } else {
            this.activeTicketsByAssetId.set(t.asset_id, {
              count: 1,
              latestStatus: t.status,
              ticketId: t.id
            });
          }
        }
      }

      this.filterAssets();
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  extractFilters() {
    const locs = this.allAssets.map(a => a.location).filter((loc): loc is string => !!loc);
    this.locations = [...new Set(locs)].sort();

    const cats = this.allAssets.map(a => a.category).filter((cat): cat is string => !!cat);
    this.categories = [...new Set(cats)].sort();

    // Refinement: If brand contains a known category (legacy data), maybe exclude it from brands list
    // for now just filter out undefined
    const brands = this.allAssets.map(a => a.brand).filter((brand): brand is string => !!brand);
    this.brands = [...new Set(brands)].sort();
  }

  setName(e: any) { this.searchQuery = e.target.value; this.filterAssets(); }
  setLocation(e: any) { this.selectedLocation = e.target.value; this.filterAssets(); }
  setCategory(e: any) { this.selectedCategory = e.target.value; this.filterAssets(); }
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  filterAssets() {
    let result = this.allAssets;

    if (this.selectedLocation !== 'Semua') {
      result = result.filter(a => a.location === this.selectedLocation);
    }

    if (this.selectedCategory !== 'Semua') {
      result = result.filter(a => a.category === this.selectedCategory);
    }

    if (this.selectedBrand !== 'Semua') {
      result = result.filter(a => a.brand === this.selectedBrand);
    }

    if (this.selectedStatus !== 'Semua') {
      if (this.selectedStatus === 'has_ticket') {
        result = result.filter(a => this.hasActiveTicket(a));
      } else {
        result = result.filter(a => a.status === this.selectedStatus);
      }
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(a =>
        (a.name || '').toLowerCase().includes(q) ||
        (a.sku || '').toLowerCase().includes(q) ||
        (a.brand || '').toLowerCase().includes(q) ||
        (a.category || '').toLowerCase().includes(q) ||
        (a.pk || '').toLowerCase().includes(q) ||
        (a.location || '').toLowerCase().includes(q)
      );
    }

    // Sort: assets with active tickets go to the TOP
    result = result.sort((a, b) => {
      const aHasTicket = this.hasActiveTicket(a) ? 1 : 0;
      const bHasTicket = this.hasActiveTicket(b) ? 1 : 0;
      if (aHasTicket !== bHasTicket) return bHasTicket - aHasTicket; // ticket assets first

      // Secondary sort: broken > maintenance > good
      const statusOrder: Record<string, number> = { broken: 0, maintenance: 1, good: 2 };
      const aOrder = statusOrder[a.status] ?? 2;
      const bOrder = statusOrder[b.status] ?? 2;
      return aOrder - bOrder;
    });

    this.filteredAssets = result;
    this.currentPage = 1;

    this.updateVisualLocations();
  }

  // Visual Map specific logic
  updateVisualLocations() {
    const locs = this.selectedLocation === 'Semua' ? this.locations : [this.selectedLocation];
    this.visualLocations = [...locs].sort((a, b) => {
      // 1. Locations with tickets
      const aHasTicket = this.locationHasTickets(a) ? 1 : 0;
      const bHasTicket = this.locationHasTickets(b) ? 1 : 0;
      if (aHasTicket !== bHasTicket) return bHasTicket - aHasTicket;

      // 2. Locations with Maintenance assets
      const aHasMaint = this.getAssetsByLocation(a).some(asset => asset.status === 'maintenance') ? 1 : 0;
      const bHasMaint = this.getAssetsByLocation(b).some(asset => asset.status === 'maintenance') ? 1 : 0;
      if (aHasMaint !== bHasMaint) return bHasMaint - aHasMaint;

      // 3. Locations with Broken assets
      const aHasBroken = this.getAssetsByLocation(a).some(asset => asset.status === 'broken') ? 1 : 0;
      const bHasBroken = this.getAssetsByLocation(b).some(asset => asset.status === 'broken') ? 1 : 0;
      if (aHasBroken !== bHasBroken) return bHasBroken - aHasBroken;

      // 4. Fallback: Alphabetical
      return a.localeCompare(b);
    });
  }

  // Ticket helpers
  hasActiveTicket(asset: Asset): boolean {
    return this.activeTicketsByAssetId.has(asset.id!);
  }

  getTicketInfo(asset: Asset): { count: number; latestStatus: string; ticketId: number } | null {
    return this.activeTicketsByAssetId.get(asset.id!) || null;
  }

  getTicketStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending_validation: 'Menunggu Validasi',
      open: 'Baru Lapor',
      assigned: 'Ditugaskan',
      internal_assigned: 'Ditugaskan (Internal)',
      vendor_assigned: 'Menunggu Vendor',
      vendor_prep: 'Persiapan Vendor',
      in_progress: 'Sedang Dikerjakan',
      pending_verification: 'Menunggu Verifikasi',
      resolved: 'Selesai / Menunggu Penutupan',
      closed: 'Selesai (Ditutup)',
      cancelled: 'Dibatalkan',
      declined: 'Ditolak'
    };
    return labels[status] || status;
  }

  // Helper for Visual Map
  getAssetsByLocation(location: string): Asset[] {
    return this.filteredAssets.filter(a => a.location === location);
  }

  // Check if location has any assets with tickets
  locationHasTickets(location: string): boolean {
    return this.getAssetsByLocation(location).some(a => this.hasActiveTicket(a));
  }

  // Custom Dropdown Methods
  toggleLocationDropdown() {
    this.locationDropdownOpen = !this.locationDropdownOpen;
    this.categoryDropdownOpen = false;
    this.brandDropdownOpen = false;
    this.statusDropdownOpen = false;
  }

  toggleCategoryDropdown() {
    this.categoryDropdownOpen = !this.categoryDropdownOpen;
    this.locationDropdownOpen = false;
    this.brandDropdownOpen = false;
    this.statusDropdownOpen = false;
  }

  toggleBrandDropdown() {
    this.brandDropdownOpen = !this.brandDropdownOpen;
    this.locationDropdownOpen = false;
    this.categoryDropdownOpen = false;
    this.statusDropdownOpen = false;
  }

  toggleStatusDropdown() {
    this.statusDropdownOpen = !this.statusDropdownOpen;
    this.locationDropdownOpen = false;
    this.categoryDropdownOpen = false;
    this.brandDropdownOpen = false;
  }

  selectLocation(loc: string) {
    this.selectedLocation = loc;
    this.locationDropdownOpen = false;
    this.filterAssets();
  }

  selectCategory(cat: string) {
    this.selectedCategory = cat;
    this.categoryDropdownOpen = false;
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
    this.categoryDropdownOpen = false;
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

      this.closeDisposalModal();
      await this.loadAssets();
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
    const category = (asset.category || '').toUpperCase();
    if (category.includes('STANDING') || category.includes('PORTABLE')) return 'standing';
    if (category.includes('CASSETTE') || category.includes('CASSET') || category.includes('CEILING')) return 'cassette';
    return 'split';
  }

  // Warranty methods
  isUnderWarranty(asset: Asset): boolean {
    if (!asset.warranty_expiry_date) return false;
    return new Date(asset.warranty_expiry_date) > new Date();
  }

  isWarrantyExpired(asset: Asset): boolean {
    if (!asset.warranty_expiry_date) return false;
    return new Date(asset.warranty_expiry_date) <= new Date();
  }

  getWarrantyLabel(asset: Asset): string {
    if (!asset.warranty_expiry_date) return 'NO WARRANTY';

    const expiry = new Date(asset.warranty_expiry_date);
    const now = new Date();
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `EXPIRED (${Math.abs(diffDays)}d)`;
    } else if (diffDays <= 30) {
      return `${diffDays}d LEFT`;
    } else {
      return `${Math.floor(diffDays / 30)}mo LEFT`;
    }
  }

  // Calculate Asset Age
  getAssetAgeLabel(asset: Asset): string {
    if (!asset.purchase_date) return '-';

    const purchaseDate = new Date(asset.purchase_date);
    const now = new Date();

    // Check if future date (invalid data)
    if (purchaseDate > now) return 'Baru';

    let years = now.getFullYear() - purchaseDate.getFullYear();
    let months = now.getMonth() - purchaseDate.getMonth();

    if (months < 0 || (months === 0 && now.getDate() < purchaseDate.getDate())) {
      years--;
      months += 12;
    }

    if (years > 0) {
      return `${years} Tahun${months > 0 ? ` ${months} Bulan` : ''}`;
    } else if (months > 0) {
      return `${months} Bulan`;
    } else {
      return 'Baru (< 1 Bulan)';
    }
  }
}
