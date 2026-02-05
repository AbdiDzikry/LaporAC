import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssetService } from '../../services/asset/asset';
import { TicketService } from '../../services/ticket/ticket';
import { SupabaseService } from '../../services/supabase/supabase';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
  today = new Date();
  loading = false;
  isAdmin = false;
  userProfile: any = null;

  constructor(
    private assetService: AssetService,
    private ticketService: TicketService,
    private supabase: SupabaseService
  ) { }

  ngOnInit() {
    this.checkUser();
    this.loadStats();
  }

  async checkUser() {
    const profile = await this.supabase.getProfile();
    this.userProfile = profile?.data;
    this.isAdmin = this.userProfile?.role === 'admin' || this.userProfile?.role === 'super_admin';
  }

  async loadStats() {
    this.loading = true;
    try {
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

      const { data: tickets } = await this.ticketService.getTickets();
      if (tickets) {
        this.analytics.recentTickets = tickets.slice(0, 5);

        // Calculate Stats
        let openCount = 0;
        let resolvedCount = 0;
        let cost = 0;

        tickets.forEach((t: any) => {
          if (t.status === 'open' || t.status === 'in_progress') openCount++;
          if (t.status === 'resolved' || t.status === 'closed') resolvedCount++;
          if (t.repair_cost) cost += Number(t.repair_cost);
        });

        this.analytics.openTickets = openCount;
        this.analytics.resolvedTickets = resolvedCount;
        this.analytics.maintenanceCost = cost;
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  // Helper to get days until maintenance
  getDaysUntil(dateString: string): number {
    const today = new Date();
    const maintenanceDate = new Date(dateString);
    const diffTime = maintenanceDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
