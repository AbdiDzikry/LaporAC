import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { AssetService } from '../../../services/asset/asset';
import { TicketService } from '../../../services/ticket/ticket';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, RouterLink, FormsModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css',
})
export class AnalyticsComponent implements OnInit {
  loading = false;
  currentDate = new Date();

  // Date Range Filter
  startDate: string = '';
  endDate: string = '';
  activePreset: string = 'all';

  // Summary Stats
  stats = {
    totalAssets: 0,
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    maintenanceAssets: 0,
    brokenAssets: 0,
    totalMaintenanceCost: 0,
    avgResolutionTime: 0,
    avgResolutionLabel: '0 jam'
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
    labels: [],
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

  // Date Filter Presets
  setPreset(preset: string) {
    this.activePreset = preset;
    const now = new Date();
    switch (preset) {
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        this.startDate = weekAgo.toISOString().split('T')[0];
        this.endDate = now.toISOString().split('T')[0];
        break;
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        this.startDate = monthStart.toISOString().split('T')[0];
        this.endDate = now.toISOString().split('T')[0];
        break;
      case '3months':
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        this.startDate = threeMonthsAgo.toISOString().split('T')[0];
        this.endDate = now.toISOString().split('T')[0];
        break;
      case 'all':
      default:
        this.startDate = '';
        this.endDate = '';
        break;
    }
    this.loadAnalytics();
  }

  applyDateFilter() {
    this.activePreset = 'custom';
    this.loadAnalytics();
  }

  private filterByDateRange(items: any[], dateField: string): any[] {
    if (!this.startDate && !this.endDate) return items;
    return items.filter((item: any) => {
      if (!item[dateField]) return false;
      const date = new Date(item[dateField]);
      if (this.startDate && date < new Date(this.startDate)) return false;
      if (this.endDate) {
        const end = new Date(this.endDate);
        end.setHours(23, 59, 59);
        if (date > end) return false;
      }
      return true;
    });
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
      const { data: allTickets } = await this.ticketService.getTickets();
      if (allTickets) {
        // Apply date filter to tickets
        const tickets = this.filterByDateRange(allTickets, 'created_at');
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

        // #4: Calculate Average Resolution Time
        const resolvedTickets = tickets.filter((t: any) =>
          (t.status === 'resolved' || t.status === 'closed') && t.created_at && t.completed_at
        );
        if (resolvedTickets.length > 0) {
          const totalHours = resolvedTickets.reduce((sum: number, t: any) => {
            const created = new Date(t.created_at).getTime();
            const completed = new Date(t.completed_at).getTime();
            return sum + (completed - created) / (1000 * 60 * 60); // hours
          }, 0);
          this.stats.avgResolutionTime = Math.round(totalHours / resolvedTickets.length);
          // Format label
          const avgHours = this.stats.avgResolutionTime;
          if (avgHours >= 24) {
            this.stats.avgResolutionLabel = `${Math.round(avgHours / 24)} hari`;
          } else {
            this.stats.avgResolutionLabel = `${avgHours} jam`;
          }
        } else {
          this.stats.avgResolutionTime = 0;
          this.stats.avgResolutionLabel = '-';
        }

        // #3: Dynamic Monthly Trend (last 6 months from actual data)
        this.buildMonthlyTrend(allTickets);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      this.loading = false;
    }
  }

  private buildMonthlyTrend(tickets: any[]) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const now = new Date();
    const labels: string[] = [];
    const newTickets: number[] = [];
    const resolvedTickets: number[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      labels.push(`${monthNames[month]} ${year.toString().slice(-2)}`);

      newTickets.push(tickets.filter((t: any) => {
        if (!t.created_at) return false;
        const cd = new Date(t.created_at);
        return cd.getFullYear() === year && cd.getMonth() === month;
      }).length);

      resolvedTickets.push(tickets.filter((t: any) => {
        if (!t.completed_at) return false;
        const cd = new Date(t.completed_at);
        return cd.getFullYear() === year && cd.getMonth() === month &&
          (t.status === 'resolved' || t.status === 'closed');
      }).length);
    }

    this.monthlyTrendChartData.labels = labels;
    this.monthlyTrendChartData.datasets[0].data = newTickets;
    this.monthlyTrendChartData.datasets[1].data = resolvedTickets;
  }

  // #9: Export Analytics PDF
  exportPDF() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Laporan Analitik LaporAC', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    const dateStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(`Dicetak pada: ${dateStr}`, 14, 30);
    if (this.startDate || this.endDate) {
      doc.text(`Periode: ${this.startDate || 'awal'} s/d ${this.endDate || 'sekarang'}`, 14, 36);
    }

    const summaryData = [
      ['Total Aset', this.stats.totalAssets.toString()],
      ['Total Tiket', this.stats.totalTickets.toString()],
      ['Tiket Aktif', this.stats.openTickets.toString()],
      ['Tiket Selesai', this.stats.resolvedTickets.toString()],
      ['Aset Rusak', this.stats.brokenAssets.toString()],
      ['Aset Maintenance', this.stats.maintenanceAssets.toString()],
      ['Estimasi Biaya', `Rp ${this.stats.totalMaintenanceCost.toLocaleString('id-ID')}`],
      ['Rata-rata Resolusi', this.stats.avgResolutionLabel]
    ];

    autoTable(doc, {
      head: [['Metrik', 'Nilai']],
      body: summaryData,
      startY: this.startDate || this.endDate ? 42 : 36,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] }
    });

    doc.save(`Analitik_LaporAC_${new Date().toISOString().split('T')[0]}.pdf`);
  }
}
