import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssetService } from '../../services/asset/asset';
import { TicketService } from '../../services/ticket/ticket';
import { SessionService } from '../../services/session/session.service';
import { AuthService } from '../../services/auth/auth.service';
import { LoadingService } from '../../services/loading/loading.service';
import { SweetAlertService } from '../../services/sweet-alert/sweet-alert.service';
import { RouterLink, Router } from '@angular/router';
import { SpkService } from '../../services/spk/spk.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  analytics = {
    totalAssets: 0,
    maintenanceAssets: 0,
    brokenAssets: 0,
    openTickets: 0,
    maintenanceCost: 0,
    resolvedTickets: 0,
    recentTickets: [] as any[],
    upcomingMaintenance: [] as any[] // Assets with upcoming maintenance
  };

  vendorData = {
    activeSpks: 0,
    completedSpks: 0,
    pendingApprovalSpks: [] as any[], // SPKs waiting for section head approval
    activeSpkList: [] as any[]
  };

  today = new Date();
  isAdmin = false;
  isVendor = false;
  userRole: string | null = null;
  userName: string | null = null;

  constructor(
    private assetService: AssetService,
    private ticketService: TicketService,
    private sessionService: SessionService,
    private authService: AuthService,
    private loadingService: LoadingService,
    private spkService: SpkService,
    private sweetAlert: SweetAlertService,
    private router: Router
  ) { }

  async ngOnInit() {
    await this.checkUser();
    this.loadStats();
  }

  async checkUser() {
    this.userRole = this.sessionService.getCurrentUserRole();
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.userName = user.name || null;
    }

    if (!this.userRole) {
      // Refresh session if not set
      await this.sessionService.checkAuthStatus();
      this.userRole = this.sessionService.getCurrentUserRole();
      const refUser = await this.authService.getCurrentUser();
      if (refUser) this.userName = refUser.name || null;
    }
    this.isAdmin = this.userRole === 'admin' || this.userRole === 'super_admin';
    this.isVendor = this.userRole === 'vendor';
  }

  async loadStats() {
    this.loadingService.show();
    try {
      if (this.isVendor) {
        // --- VENDOR DASHBOARD LOGIC ---
        const { data: spks, error } = await this.spkService.getSpks();
        if (spks) {
          this.vendorData.activeSpks = spks.filter((s: any) => s.status === 'assigned' || s.status === 'in_progress' || s.status === 'pending_vendor_response').length;
          this.vendorData.completedSpks = spks.filter((s: any) => s.status === 'completed').length;

          this.vendorData.pendingApprovalSpks = spks.filter((s: any) => s.status === 'pending_approval');
          this.vendorData.activeSpkList = spks.filter((s: any) => s.status === 'assigned' || s.status === 'in_progress' || s.status === 'pending_vendor_response');
        }
      } else {
        // --- ADMIN DASHBOARD LOGIC ---
        const { data: assets } = await this.assetService.getAssets();
        if (assets) {
          this.analytics.totalAssets = assets.length;
          this.analytics.maintenanceAssets = assets.filter((a: any) => a.status === 'maintenance').length;
          this.analytics.brokenAssets = assets.filter((a: any) => a.status === 'broken').length;

          // Get upcoming maintenance (next 7 days)
          const today = new Date();
          const nextWeek = new Date();
          nextWeek.setDate(today.getDate() + 7);

          this.analytics.upcomingMaintenance = assets
            .filter((asset: any) => {
              if (!asset.next_maintenance_date) return false;
              const maintenanceDate = new Date(asset.next_maintenance_date);
              return maintenanceDate >= today && maintenanceDate <= nextWeek;
            })
            .sort((a: any, b: any) => {
              return new Date(a.next_maintenance_date).getTime() - new Date(b.next_maintenance_date).getTime();
            })
            .slice(0, 5); // Top 5 upcoming
        }

        const { data: tickets, error } = await this.ticketService.getTickets();
        if (error) console.error('Error fetching tickets:', error);

        if (tickets) {
          console.log('Dashboard Tickets:', tickets); // Debug log
          this.analytics.recentTickets = tickets.slice(0, 5);

          // Calculate Stats
          let openCount = 0;
          let resolvedCount = 0;
          let cost = 0;

          tickets.forEach((t: any) => {
            // Check status carefully
            if (t.status === 'open' || t.status === 'in_progress' || t.status === 'pending_validation' || t.status === 'assigned' || t.status === 'vendor_assigned' || t.status === 'vendor_prep') {
              openCount++;
            }
            if (t.status === 'resolved' || t.status === 'closed') resolvedCount++;
            if (t.repair_cost) cost += Number(t.repair_cost);
          });

          console.log('Calculated Open Tickets:', openCount); // Debug log
          this.analytics.openTickets = openCount;
          this.analytics.resolvedTickets = resolvedCount;
          this.analytics.maintenanceCost = cost;
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.loadingService.hide();
    }
  }

  // Helper to get days until maintenance
  getDaysUntil(dateString: string): number {
    const today = new Date();
    const maintenanceDate = new Date(dateString);
    const diffTime = maintenanceDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }


  // Action: Navigate to detail to update costs/items
  goToSpkDetail(spk: any) {
    this.router.navigate(['/admin/spk', spk.id]);
  }

  formatStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending_validation': 'Menunggu Validasi',
      'valid': 'Valid',
      'invalid': 'Tidak Valid / False Alarm',
      'vendor_prep': 'Persiapan Vendor',
      'assigned': 'Ditugaskan',
      'vendor_assigned': 'Vendor Ditugaskan',
      'waiting_for_spk_approval': 'Menunggu Persetujuan SPK',
      'pending_vendor_response': 'Menunggu Respon Vendor',
      'in_progress': 'Sedang Dikerjakan',
      'pending_verification': 'Menunggu Verifikasi',
      'resolved': 'Terselesaikan',
      'closed': 'Ditutup',
      'open': 'Terbuka',
      'cancelled': 'Dibatalkan',
      'pending_approval': 'Menunggu Persetujuan',
      'completed': 'Selesai',
      'scheduled': 'Terjadwal',
      'missed': 'Terlewat'
    };
    return statusMap[status] || status.replace(/_/g, ' ').toUpperCase();
  }
}
