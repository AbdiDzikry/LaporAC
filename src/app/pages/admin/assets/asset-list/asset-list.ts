import { Component, OnInit } from '@angular/core'; // Added OnInit
import { CommonModule } from '@angular/common'; // Added CommonModule for *ngFor
import { AssetService, Asset } from '../../../../services/asset/asset'; // Correct relative path
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-asset-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
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

  constructor(private assetService: AssetService) { }

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
        alert('Gagal menghapus aset: ' + error.message);
        return;
      }

      // Remove from local arrays
      this.allAssets = this.allAssets.filter(a => a.id !== asset.id);
      this.filterAssets();

      alert('Aset berhasil dihapus!');
    } catch (e: any) {
      console.error('Delete error:', e);
      alert('Terjadi kesalahan saat menghapus aset');
    }
  }

}
