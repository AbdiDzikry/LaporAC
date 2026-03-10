import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { AssetService } from '../../../services/asset/asset';
import { TicketService } from '../../../services/ticket/ticket';
import { SpkService, Spk } from '../../../services/spk/spk';
import { MaintenanceService, MaintenanceSchedule } from '../../../services/maintenance/maintenance';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Chart.js types
const lineChartType: ChartType = 'line';
const doughnutChartType: ChartType = 'doughnut';
const barChartType: ChartType = 'bar';
const pieChartType: ChartType = 'pie';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FormsModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css',
})
export class AnalyticsComponent implements OnInit {
  loading = false;
  currentDate = new Date();
  Math = Math; // Expose Math to template for dynamic height calculations


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

  // Top 5 Most Serviced AC Units
  topServicedAssets: Array<{ name: string, location: string, serviceCount: number, sku: string }> = [];

  // Top 5 Highest Cost AC Units
  topCostAssets: Array<{ name: string, location: string, totalCost: number, sku: string }> = [];

  // Issues by Location
  issuesByLocation: Array<{ location: string, count: number }> = [];

  // Issues by Brand
  issuesByBrand: Array<{ brand: string, count: number }> = [];

  // NEW METRICS
  issuesByCategory: Array<{ category: string, count: number }> = [];
  topVendors: Array<{ vendor_name: string, count: number }> = [];
  topSpareParts: Array<{ item_name: string, qty: number }> = [];
  upcomingMaintenance: MaintenanceSchedule[] = [];

  // Asset Status Chart (Donut)
  assetStatusChartData: ChartData<'doughnut'> = {
    labels: ['Normal', 'Maintenance', 'Rusak'],
    datasets: [{
      data: [],
      backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
      hoverBackgroundColor: ['#059669', '#D97706', '#DC2626'],
      borderColor: '#ffffff',
      borderWidth: 3
    }]
  };

  assetStatusChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
          font: { size: 12, family: 'Inter, sans-serif' }
        }
      }
    },
    cutout: '72%'
  };

  // Ticket Status Chart (Vertical Bar)
  ticketStatusChartData: ChartData<'bar'> = {
    labels: ['Open', 'In Progress', 'Resolved', 'Closed'],
    datasets: [{
      label: 'Jumlah Tiket',
      data: [],
      backgroundColor: ['#FEF3C7', '#BFDBFE', '#BBF7D0', '#E0E7FF'],
      borderColor: ['#F59E0B', '#3B82F6', '#10B981', '#6366F1'],
      borderWidth: 2,
      borderRadius: 8,
      barThickness: 44
    }]
  };

  ticketStatusChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'Inter, sans-serif', size: 12 } } },
      y: {
        beginAtZero: true,
        grid: { color: '#F3F4F6' },
        ticks: { stepSize: 1, font: { family: 'Inter, sans-serif' } },
        border: { display: false }
      }
    }
  };

  // Monthly Trend Chart (Area / Line)
  monthlyTrendChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'Tiket Baru',
        data: [],
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        borderWidth: 2.5,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#6366F1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Tiket Selesai',
        data: [],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        borderWidth: 2.5,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
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
        labels: { usePointStyle: true, boxWidth: 8, padding: 20, font: { size: 12, family: 'Inter, sans-serif' } }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'Inter, sans-serif' } } },
      y: {
        beginAtZero: true,
        grid: { color: '#F3F4F6' },
        border: { display: false },
        ticks: { font: { family: 'Inter, sans-serif' } }
      }
    },
    interaction: { mode: 'index', intersect: false }
  };

  // Issues by Location Chart (Horizontal Bar)
  locationBarChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      label: 'Jumlah Masalah',
      data: [],
      backgroundColor: 'rgba(99, 102, 241, 0.15)',
      borderColor: '#6366F1',
      borderWidth: 2,
      borderRadius: 6,
      barThickness: 18
    }]
  };

  locationBarChartOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: '#F3F4F6' },
        ticks: { stepSize: 1, font: { family: 'Inter, sans-serif', size: 11 } },
        border: { display: false }
      },
      y: {
        grid: { display: false },
        ticks: { font: { family: 'Inter, sans-serif', size: 11 } }
      }
    }
  };

  // Issues by Brand Chart (Horizontal Bar)
  brandBarChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      label: 'Jumlah Masalah',
      data: [],
      backgroundColor: 'rgba(245, 158, 11, 0.15)',
      borderColor: '#F59E0B',
      borderWidth: 2,
      borderRadius: 6,
      barThickness: 18
    }]
  };

  brandBarChartOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: '#F3F4F6' },
        ticks: { stepSize: 1, font: { family: 'Inter, sans-serif', size: 11 } },
        border: { display: false }
      },
      y: {
        grid: { display: false },
        ticks: { font: { family: 'Inter, sans-serif', size: 11 } }
      }
    }
  };

  // Issues by Category Chart (Horizontal Bar)
  categoryBarChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      label: 'Kategori Keluhan',
      data: [],
      backgroundColor: 'rgba(236, 72, 153, 0.15)',
      borderColor: '#EC4899',
      borderWidth: 2,
      borderRadius: 6,
      barThickness: 18
    }]
  };

  categoryBarChartOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: '#F3F4F6' },
        ticks: { stepSize: 1, font: { family: 'Inter, sans-serif', size: 11 } },
        border: { display: false }
      },
      y: {
        grid: { display: false },
        ticks: { font: { family: 'Inter, sans-serif', size: 11 } }
      }
    }
  };

  // Asset Age Chart (Pie Chart)
  assetAgeChartData: ChartData<'pie'> = {
    labels: ['< 1 Tahun', '1 - 3 Tahun', '3 - 5 Tahun', '> 5 Tahun', 'Tidak Diketahui'],
    datasets: [{
      data: [],
      backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#9CA3AF'],
      hoverBackgroundColor: ['#059669', '#2563EB', '#D97706', '#DC2626', '#6B7280'],
      borderColor: '#ffffff',
      borderWidth: 2
    }]
  };

  assetAgeChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
          font: { size: 12, family: 'Inter, sans-serif' }
        }
      }
    }
  };

  constructor(
    private assetService: AssetService,
    private ticketService: TicketService,
    private spkService: SpkService,
    private maintenanceService: MaintenanceService
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

        // count by location
        const locationMap = new Map<string, number>();
        assets.forEach((asset: any) => {
          const loc = asset.location || 'Unknown';
          locationMap.set(loc, (locationMap.get(loc) || 0) + 1);
        });
        // Asset location distribution is now handled by calculateIssuesByLocation() below

        // NEW: Asset Age Distribution
        this.calculateAssetAges(assets);
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

        // Calculate Top 5 Most Serviced AC Units
        this.calculateTopServicedAssets(allTickets, assets || []);

        // Calculate Top 5 Highest Cost AC Units
        this.calculateTopCostAssets(allTickets, assets || []);

        // Calculate Issues by Location
        this.calculateIssuesByLocation(allTickets, assets || []);

        // Calculate Issues by Brand
        this.calculateIssuesByBrand(allTickets, assets || []);

        // NEW: Calculate Issues by Category
        this.calculateIssuesByCategory(allTickets);
      }

      // 3. Load SPKs for Vendor & Parts Analytics
      const { data: allSpks } = await this.spkService.getSpks();
      if (allSpks) {
        const spks = this.filterByDateRange(allSpks, 'created_at');
        this.calculateTopVendors(spks);
        this.calculateTopSpareParts(spks);

        // Calculate total maintenance cost from SPKs directly for more accurate costing
        if (spks.length > 0) {
          this.stats.totalMaintenanceCost = spks.reduce((sum: number, s: any) => {
            return sum + (Number(s.total_cost) || 0);
          }, 0);
        }
      }

      // 4. Load Upcoming Maintenance
      const { data: maintenance } = await this.maintenanceService.getSchedules('upcoming');
      if (maintenance) {
        this.upcomingMaintenance = maintenance
          .filter(m => m.status === 'scheduled')
          .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
          .slice(0, 5); // 5 antrean terdekat
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

  // Calculate Top 5 Most Serviced AC Units
  private calculateTopServicedAssets(tickets: any[], assets: any[]) {
    const serviceCountMap = new Map<string, { name: string, location: string, sku: string, serviceCount: number }>();

    tickets.forEach(ticket => {
      if (!ticket.asset_id) return;

      const asset = assets.find(a => a.id === ticket.asset_id);
      if (!asset) return;

      const key = asset.id.toString();
      const existing = serviceCountMap.get(key);

      if (existing) {
        existing.serviceCount++;
      } else {
        serviceCountMap.set(key, {
          name: asset.name,
          location: asset.location,
          sku: asset.sku,
          serviceCount: 1
        });
      }
    });

    // Convert to array and sort by serviceCount
    this.topServicedAssets = Array.from(serviceCountMap.values())
      .sort((a, b) => b.serviceCount - a.serviceCount)
      .slice(0, 5);
  }

  // Calculate Top 5 Highest Cost AC Units
  private calculateTopCostAssets(tickets: any[], assets: any[]) {
    const costMap = new Map<string, { name: string, location: string, sku: string, totalCost: number }>();

    tickets.forEach(ticket => {
      if (!ticket.asset_id || !ticket.repair_cost) return;

      const asset = assets.find(a => a.id === ticket.asset_id);
      if (!asset) return;

      const key = asset.id.toString();
      const existing = costMap.get(key);
      const cost = Number(ticket.repair_cost) || 0;

      if (existing) {
        existing.totalCost += cost;
      } else {
        costMap.set(key, {
          name: asset.name,
          location: asset.location,
          sku: asset.sku,
          totalCost: cost
        });
      }
    });

    // Convert to array and sort by cost
    this.topCostAssets = Array.from(costMap.values())
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 5);
  }

  // Calculate Issues by Location
  private calculateIssuesByLocation(tickets: any[], assets: any[]) {
    const locationMap = new Map<string, number>();

    tickets.forEach(ticket => {
      if (!ticket.asset_id) return;

      const asset = assets.find(a => a.id === ticket.asset_id);
      if (!asset) return;

      const location = asset.location || 'Unknown';
      locationMap.set(location, (locationMap.get(location) || 0) + 1);
    });

    const sorted = Array.from(locationMap.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
    this.issuesByLocation = sorted;
    this.locationBarChartData = {
      ...this.locationBarChartData,
      labels: sorted.map(l => l.location),
      datasets: [{ ...this.locationBarChartData.datasets[0], data: sorted.map(l => l.count) }]
    };
  }

  // Calculate Issues by Brand
  private calculateIssuesByBrand(tickets: any[], assets: any[]) {
    const brandMap = new Map<string, number>();

    tickets.forEach(ticket => {
      if (!ticket.asset_id) return;

      const asset = assets.find(a => a.id === ticket.asset_id);
      if (!asset) return;

      const brand = asset.brand || 'Unknown';
      brandMap.set(brand, (brandMap.get(brand) || 0) + 1);
    });

    const sorted = Array.from(brandMap.entries())
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
    this.issuesByBrand = sorted;
    this.brandBarChartData = {
      ...this.brandBarChartData,
      labels: sorted.map(b => b.brand),
      datasets: [{ ...this.brandBarChartData.datasets[0], data: sorted.map(b => b.count) }]
    };
  }

  // Calculate Asset Ages (Pie Chart logic)
  private calculateAssetAges(assets: any[]) {
    let less1 = 0, oneTo3 = 0, threeTo5 = 0, over5 = 0, unknown = 0;
    const now = new Date();

    assets.forEach(asset => {
      if (!asset.purchase_date) {
        unknown++;
        return;
      }
      const purchaseDate = new Date(asset.purchase_date);
      const diffTime = Math.abs(now.getTime() - purchaseDate.getTime());
      const diffYears = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365));

      if (diffYears < 1) less1++;
      else if (diffYears >= 1 && diffYears <= 3) oneTo3++;
      else if (diffYears > 3 && diffYears <= 5) threeTo5++;
      else over5++;
    });

    this.assetAgeChartData.datasets[0].data = [less1, oneTo3, threeTo5, over5, unknown];
  }

  // Calculate Issues by Category (Horizontal Bar logic)
  private calculateIssuesByCategory(tickets: any[]) {
    const categoryMap = new Map<string, number>();

    tickets.forEach(ticket => {
      const category = ticket.issue_category || 'Lain-lain';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    const sorted = Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    this.issuesByCategory = sorted;
    this.categoryBarChartData = {
      ...this.categoryBarChartData,
      labels: sorted.map(c => c.category),
      datasets: [{ ...this.categoryBarChartData.datasets[0], data: sorted.map(c => c.count) }]
    };
  }

  // Calculate Top Vendors (Completion Count)
  private calculateTopVendors(spks: Spk[]) {
    const vendorMap = new Map<string, number>();

    spks.forEach(spk => {
      if (!spk.vendor || spk.status !== 'completed') return;
      const vendorName = spk.vendor.name || 'Vendor Tidak Dikenal';
      vendorMap.set(vendorName, (vendorMap.get(vendorName) || 0) + 1);
    });

    this.topVendors = Array.from(vendorMap.entries())
      .map(([vendor_name, count]) => ({ vendor_name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  // Calculate Top Replaced Spare Parts
  private calculateTopSpareParts(spks: Spk[]) {
    const partsMap = new Map<string, number>();

    spks.forEach(spk => {
      if (!spk.items || spk.items.length === 0) return;
      spk.items.forEach(item => {
        const itemName = item.item_name || 'Part Tidak Dikenal';
        partsMap.set(itemName, (partsMap.get(itemName) || 0) + (Number(item.qty) || 1));
      });
    });

    this.topSpareParts = Array.from(partsMap.entries())
      .map(([item_name, qty]) => ({ item_name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }
}

