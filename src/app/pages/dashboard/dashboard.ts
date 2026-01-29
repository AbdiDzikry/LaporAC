import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssetService } from '../../services/asset/asset';
import { TicketService } from '../../services/ticket/ticket';
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
    openTickets: 0,
    maintenanceCost: 0,
    resolvedTickets: 0,
    recentTickets: [] as any[]
  };
  today = new Date();
  loading = false;

  constructor(
    private assetService: AssetService,
    private ticketService: TicketService
  ) { }

  ngOnInit() {
    this.loadStats();
  }

  async loadStats() {
    this.loading = true;
    try {
      const { data: assets } = await this.assetService.getAssets();
      if (assets) this.analytics.totalAssets = assets.length;

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
}
