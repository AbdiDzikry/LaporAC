import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VendorService, VendorProfile, VendorStatistics } from '../../../../services/vendor/vendor.service';
import { SweetAlertService } from '../../../../services/sweet-alert/sweet-alert.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vendor-list.html',
  styleUrl: './vendor-list.css'
})
export class VendorListComponent implements OnInit {
  vendors: VendorProfile[] = [];
  filteredVendors: VendorProfile[] = [];
  loading = false;
  showDetailModal = false;
  selectedVendor: VendorProfile | null = null;
  vendorStats: VendorStatistics | null = null;

  // Stats
  totalVendors = 0;
  activeVendors = 0;
  totalJobs = 0;
  averageRating: string = '0.00';

  // Filters
  searchQuery = '';
  statusFilter = '';

  constructor(
    private vendorService: VendorService,
    private sweetAlert: SweetAlertService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadVendors();
  }

  async loadVendors() {
    this.loading = true;
    const { data, error } = await this.vendorService.getVendors();
    this.loading = false;

    if (error) {
      this.sweetAlert.error('Gagal', 'Gagal memuat data vendor: ' + error);
      return;
    }

    if (data) {
      this.vendors = data;
      this.filteredVendors = data;
      this.calculateStats();
    }
  }

  calculateStats() {
    this.totalVendors = this.vendors.length;
    this.activeVendors = this.vendors.filter(v => v.status === 'active').length;
    this.totalJobs = this.vendors.reduce((sum, v) => sum + (v.completed_jobs || 0), 0);

    const ratings = this.vendors.filter(v => v.rating > 0).map(v => v.rating);
    this.averageRating = ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(2).toString()
      : '0.00';
  }

  applyFilters() {
    let filtered = [...this.vendors];

    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(v => 
        v.user?.name?.toLowerCase().includes(query) ||
        v.user?.email?.toLowerCase().includes(query) ||
        v.company_name?.toLowerCase().includes(query) ||
        v.phone?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (this.statusFilter) {
      filtered = filtered.filter(v => v.status === this.statusFilter);
    }

    this.filteredVendors = filtered;
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'active': 'Aktif',
      'inactive': 'Nonaktif',
      'suspended': 'Suspended'
    };
    return labels[status] || status;
  }

  async viewVendor(vendor: VendorProfile) {
    this.selectedVendor = vendor;
    this.showDetailModal = true;
    
    // Load statistics
    if (vendor.id) {
      const { data } = await this.vendorService.getVendorStatistics(vendor.id);
      this.vendorStats = data || null;
    }
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedVendor = null;
    this.vendorStats = null;
  }

  editVendor(vendor: VendorProfile) {
    this.closeDetailModal();
    this.router.navigate(['/admin/vendors/edit', vendor.id]);
  }

  openAddVendorModal() {
    this.router.navigate(['/admin/vendors/new']);
  }

  async deleteVendor(vendor: VendorProfile) {
    const confirmed = await this.sweetAlert.confirm(
      'Hapus Vendor',
      `Apakah Anda yakin ingin menghapus vendor "${vendor.user?.name}"? Data vendor tidak dapat dikembalikan.`
    );

    if (!confirmed) return;

    if (!vendor.id) return;

    const { error } = await this.vendorService.deleteVendor(vendor.id);
    
    if (error) {
      this.sweetAlert.error('Gagal', 'Gagal menghapus vendor: ' + error);
    } else {
      this.sweetAlert.success('Berhasil', 'Vendor berhasil dihapus');
      await this.loadVendors();
    }
  }
}
