import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetService } from '../../../../services/asset/asset';
import { TicketService } from '../../../../services/ticket/ticket';
import { SpkService } from '../../../../services/spk/spk';
import { SweetAlertService } from '../../../../services/sweet-alert/sweet-alert.service';
import { Location } from '@angular/common';

interface TimelineItem {
  id: number;
  type: 'ticket' | 'spk' | 'maintenance';
  typeLabel: string;
  date: string;
  title: string;
  description: string;
  status: string;
  reporter?: string;
  cost?: number;
  warranty?: boolean;
  resolution?: string;
  ticketId?: number;
  spkId?: number;
}

interface WarrantyInfo {
  isUnderWarranty: boolean;
  hasWarranty: boolean;
  expiryDate?: string;
  daysRemaining?: number;
  progressPercentage?: number;
}

@Component({
  selector: 'app-asset-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asset-history.html',
  styleUrl: './asset-history.css'
})
export class AssetHistoryComponent implements OnInit {
  asset: any = null;
  timeline: TimelineItem[] = [];
  loading = false;
  selectedItem: TimelineItem | null = null;

  warrantyInfo: WarrantyInfo | null = null;
  totalRepairs = 0;
  totalCost = 0;
  lastRepairDate: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assetService: AssetService,
    private ticketService: TicketService,
    private spkService: SpkService,
    private sweetAlert: SweetAlertService,
    private location: Location
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAssetHistory(parseInt(id, 10));
    }
  }

  async loadAssetHistory(assetId: number) {
    this.loading = true;

    try {
      // Load asset detail
      const { data: assetData } = await this.assetService.getAssetById(assetId);
      if (assetData) {
        this.asset = assetData;
        this.calculateWarrantyInfo();
        this.calculateStatistics();
      }

      // Load tickets for this asset
      const { data: tickets } = await this.ticketService.getTickets({ asset_id: assetId });
      if (tickets) {
        const ticketItems: TimelineItem[] = tickets.map((t: any) => ({
          id: t.id,
          type: 'ticket' as const,
          typeLabel: 'Ticket Laporan',
          date: t.created_at,
          title: t.title || t.issue_category || 'Ticket',
          description: t.description || '-',
          status: t.status,
          reporter: t.reporter_name,
          cost: t.cost,
          warranty: t.is_warranty_work,
          resolution: t.completion_notes || t.resolution_notes,
          ticketId: t.id
        }));
        this.timeline.push(...ticketItems);
      }

      // Load SPKs for this asset (through tickets)
      const { data: spks } = await this.spkService.getSpks();
      if (spks && this.asset) {
        const assetSpks = spks.filter((s: any) => 
          s.ticket?.asset_id === assetId || s.ticket_id === this.asset.ticket_id
        );
        
        const spkItems: TimelineItem[] = assetSpks.map((s: any) => ({
          id: s.id,
          type: 'spk' as const,
          typeLabel: 'SPK (Surat Perintah Kerja)',
          date: s.created_at,
          title: s.spk_number,
          description: s.completion_notes || s.vendor_notes || '-',
          status: s.status,
          cost: s.total_cost,
          warranty: s.is_warranty_claim,
          resolution: s.completion_notes,
          spkId: s.id
        }));
        this.timeline.push(...spkItems);
      }

      // Sort by date descending
      this.timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    } catch (error: any) {
      this.sweetAlert.error('Gagal', 'Gagal memuat riwayat asset: ' + (error?.message || 'Unknown error'));
    } finally {
      this.loading = false;
    }
  }

  calculateWarrantyInfo() {
    if (!this.asset?.warranty_expiry) {
      this.warrantyInfo = {
        isUnderWarranty: false,
        hasWarranty: false
      };
      return;
    }

    const expiryDate = new Date(this.asset.warranty_expiry);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calculate progress (assume 3 months warranty from last repair)
    const warrantyMonths = this.asset.warranty_months || 3;
    const totalDays = warrantyMonths * 30;
    const elapsedDays = totalDays - diffDays;
    const progressPercentage = Math.max(0, Math.min(100, (elapsedDays / totalDays) * 100));

    this.warrantyInfo = {
      isUnderWarranty: diffDays > 0,
      hasWarranty: true,
      expiryDate: this.asset.warranty_expiry,
      daysRemaining: Math.max(0, diffDays),
      progressPercentage
    };
  }

  calculateStatistics() {
    const repairs = this.timeline.filter(item => item.type === 'spk' || item.cost);
    this.totalRepairs = repairs.length;
    this.totalCost = repairs.reduce((sum, item) => sum + (item.cost || 0), 0);
    
    if (repairs.length > 0) {
      this.lastRepairDate = repairs[0].date;
    }
  }

  getAssetInitials(): string {
    if (!this.asset?.name) return '?';
    const parts = this.asset.name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return this.asset.name.substring(0, 2).toUpperCase();
  }

  getStatusLabel(status: string | undefined): string {
    if (!status) return '-';
    const labels: { [key: string]: string } = {
      'good': 'Baik',
      'needs_repair': 'Perlu Perbaikan',
      'retired': 'Retired',
      'active': 'Aktif'
    };
    return labels[status] || status;
  }

  getItemColor(type: string): string {
    const colors: { [key: string]: string } = {
      'ticket': 'bg-blue-500',
      'spk': 'bg-purple-500',
      'maintenance': 'bg-green-500'
    };
    return colors[type] || 'bg-gray-500';
  }

  getItemBadgeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'ticket': 'bg-blue-100 text-blue-700',
      'spk': 'bg-purple-100 text-purple-700',
      'maintenance': 'bg-green-100 text-green-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  }

  getStatusBadgeColor(status: string): string {
    const colors: { [key: string]: string } = {
      'open': 'bg-blue-100 text-blue-700',
      'assigned': 'bg-blue-100 text-blue-700',
      'in_progress': 'bg-yellow-100 text-yellow-700',
      'completed': 'bg-green-100 text-green-700',
      'resolved': 'bg-green-100 text-green-700',
      'closed': 'bg-green-100 text-green-700',
      'rejected': 'bg-red-100 text-red-700',
      'false_alarm': 'bg-gray-100 text-gray-700',
      'draft': 'bg-gray-100 text-gray-700',
      'sent': 'bg-blue-100 text-blue-700',
      'accepted': 'bg-green-100 text-green-700',
      'repairing': 'bg-yellow-100 text-yellow-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  }

  viewDetail(item: TimelineItem) {
    this.selectedItem = item;
  }

  closeDetail() {
    this.selectedItem = null;
  }

  viewTicket(ticketId: number) {
    this.closeDetail();
    this.router.navigate(['/admin/tickets', ticketId]);
  }

  goBack() {
    this.location.back();
  }

  async downloadReport() {
    this.sweetAlert.info('Coming Soon', 'Fitur download report PDF akan segera hadir');
  }
}
