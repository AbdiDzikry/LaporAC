import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { AssetService } from '../../../services/asset/asset';
import { TicketService } from '../../../services/ticket/ticket';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, RouterLink],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css',
})
export class AnalyticsComponent implements OnInit {
  loading = false;
  currentDate = new Date();

  // Summary Stats
  stats = {
    totalAssets: 0,
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    maintenanceAssets: 0,
    brokenAssets: 0,
    totalMaintenanceCost: 0,
    avgResolutionTime: 0
  };

  // Asset Status Chart
  assetStatusChartData: ChartData<'doughnut'> = {
    labels: ['Normal', 'Maintenance', 'Rusak'],
    datasets: [{
      data: [], // Empty initially
      backgroundColor: ['#10B981', '#F59E0B', '#EF4444'], // Keep semantic colors but maybe slightly muted in UI
      hoverBackgroundColor: ['#059669', '#D97706', '#DC2626'],
      borderColor: '#ffffff',
      borderWidth: 2
    }]
  };

  assetStatusChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: { size: 12, family: 'Inter' }
        }
      }
    },
    cutout: '75%' // Thinner ring
  };

  // Ticket Status Chart
  ticketStatusChartData: ChartData<'bar'> = {
    labels: ['Open', 'In Progress', 'Resolved', 'Closed'],
    datasets: [{
      label: 'Jumlah Tiket',
      data: [],
      backgroundColor: ['#DBEAFE', '#60A5FA', '#2563EB', '#1E40AF'], // Monochromatic Blue scale
      borderRadius: 4,
      barThickness: 40
    }]
  };

  ticketStatusChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter' } }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f3f4f6' },
        ticks: { stepSize: 1, font: { family: 'Inter' } },
        border: { display: false }
      }
    }
  };

  // Monthly Trend Chart
  monthlyTrendChartData: ChartData<'line'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
    datasets: [
      {
        label: 'Tiket Baru',
        data: [],
        borderColor: '#2563EB', // Blue-600
        backgroundColor: 'rgba(37, 99, 235, 0.05)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#2563EB',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4
      },
      {
        label: 'Tiket Selesai',
        data: [],
        borderColor: '#10B981', // Green-500
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4
      }
    ]
  };

  monthlyTrendChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 20,
          font: { size: 12, family: 'Inter' }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter' } }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f3f4f6', }, // dashed?
        border: { display: false }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  // Location Distribution Chart
  locationChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      data: [],
      // Professional Palette (Blues, Teals, Grays) instead of Rainbow
      backgroundColor: [
        '#1E3A8A', '#1E40AF', '#1D4ED8', '#2563EB', '#3B82F6',
        '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE', '#EFF6FF'
      ],
      hoverOffset: 4
    }]
  };

  locationChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 15,
          font: { size: 11, family: 'Inter' }
        }
      }
    },
    layout: {
      padding: { left: 0, right: 20 }
    }
  };

  constructor(
    private assetService: AssetService,
    private ticketService: TicketService
  ) { }

  ngOnInit() {
    this.loadAnalytics();
  }

  async loadAnalytics() {
    this.loading = true;
    try {
      // Load Assets
      const { data: assets } = await this.assetService.getAssets();
      if (assets) {
        this.stats.totalAssets = assets.length;

        // Count by status
        const goodCount = assets.filter((a: any) => a.status === 'good').length;
        const maintenanceCount = assets.filter((a: any) => a.status === 'maintenance').length;
        const brokenCount = assets.filter((a: any) => a.status === 'broken').length;

        this.stats.maintenanceAssets = maintenanceCount;
        this.stats.brokenAssets = brokenCount;

        // Update asset status chart
        this.assetStatusChartData.datasets[0].data = [goodCount, maintenanceCount, brokenCount];

        // Count by location
        const locationMap = new Map<string, number>();
        assets.forEach((asset: any) => {
          const loc = asset.location || 'Unknown';
          locationMap.set(loc, (locationMap.get(loc) || 0) + 1);
        });

        this.locationChartData.labels = Array.from(locationMap.keys()).slice(0, 10);
        this.locationChartData.datasets[0].data = Array.from(locationMap.values()).slice(0, 10);
      }

      // Load Tickets
      const { data: tickets } = await this.ticketService.getTickets();
      if (tickets) {
        this.stats.totalTickets = tickets.length;

        // Count by status
        const openCount = tickets.filter((t: any) => t.status === 'open').length;
        const inProgressCount = tickets.filter((t: any) => t.status === 'in_progress').length;
        const resolvedCount = tickets.filter((t: any) => t.status === 'resolved').length;
        const closedCount = tickets.filter((t: any) => t.status === 'closed').length;

        this.stats.openTickets = openCount + inProgressCount;
        this.stats.resolvedTickets = resolvedCount + closedCount;

        // Update ticket status chart
        this.ticketStatusChartData.datasets[0].data = [openCount, inProgressCount, resolvedCount, closedCount];

        // Calculate total maintenance cost
        this.stats.totalMaintenanceCost = tickets.reduce((sum: number, t: any) => {
          return sum + (Number(t.repair_cost) || 0);
        }, 0);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      this.loading = false;
    }
  }
}
