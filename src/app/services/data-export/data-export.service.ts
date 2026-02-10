import { Injectable } from '@angular/core';
import { AssetService } from '../asset/asset';
import { TicketService } from '../ticket/ticket';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';

export interface ReportOptions {
  startDate?: Date;
  endDate?: Date;
  status?: string[];
  location?: string[];
  assetType?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DataExportService {

  constructor(
    private assetService: AssetService,
    private ticketService: TicketService
  ) { }

  async exportAssetsToCSV(filename: string = 'assets.csv'): Promise<void> {
    try {
      const { data: assets, error } = await this.assetService.getAssets();
      
      if (error) {
        throw error;
      }

      if (!assets || assets.length === 0) {
        throw new Error('Tidak ada data aset untuk diekspor');
      }

      // Create CSV content
      const headers = ['ID', 'SKU', 'Nama', 'Merek', 'Lokasi', 'PK', 'Status', 'Tanggal Pembelian', 'Tanggal Pemeliharaan Terakhir', 'Tanggal Pemeliharaan Berikutnya', 'Harga Beli', 'Umur Manfaat (Tahun)', 'Nilai Sisa', 'Aktif'];
      const csvContent = [
        headers.join(','),
        ...assets.map((asset: any) => [
          asset.id,
          `"${asset.sku}"`,
          `"${asset.name}"`,
          `"${asset.brand}"`,
          `"${asset.location}"`,
          `"${asset.pk}"`,
          asset.status,
          asset.purchase_date || '',
          asset.last_maintenance_date || '',
          asset.next_maintenance_date || '',
          asset.purchase_price || 0,
          asset.useful_life_years || 0,
          asset.residual_value || 0,
          asset.is_active ? 'Ya' : 'Tidak'
        ].join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, filename);
    } catch (error) {
      console.error('Error exporting assets to CSV:', error);
      throw error;
    }
  }

  async exportTicketsToCSV(filename: string = 'tickets.csv'): Promise<void> {
    try {
      const { data: tickets, error } = await this.ticketService.getTickets();
      
      if (error) {
        throw error;
      }

      if (!tickets || tickets.length === 0) {
        throw new Error('Tidak ada data tiket untuk diekspor');
      }

      // Create CSV content
      const headers = ['ID', 'Tanggal Dibuat', 'ID Aset', 'NIK Pelapor', 'Nama Pelapor', 'Kategori Masalah', 'Deskripsi', 'Status', 'Foto URL', 'ID Teknisi', 'Tanggal Mulai', 'Tanggal Selesai', 'Diverifikasi Oleh', 'Tanggal Verifikasi', 'Catatan Verifikasi'];
      const csvContent = [
        headers.join(','),
        ...tickets.map((ticket: any) => [
          ticket.id,
          ticket.created_at || '',
          ticket.asset_id,
          `"${ticket.reporter_nik || ''}"`,
          `"${ticket.reporter_name || ''}"`,
          `"${ticket.issue_category}"`,
          `"${ticket.description || ''}"`,
          ticket.status,
          ticket.photo_url || '',
          ticket.technician_id || '',
          ticket.started_at || '',
          ticket.completed_at || '',
          ticket.verified_by || '',
          ticket.verified_at || '',
          `"${ticket.verification_notes || ''}"`
        ].join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, filename);
    } catch (error) {
      console.error('Error exporting tickets to CSV:', error);
      throw error;
    }
  }

  async exportAssetsToPDF(filename: string = 'assets_report.pdf'): Promise<void> {
    try {
      const { data: assets, error } = await this.assetService.getAssets();
      
      if (error) {
        throw error;
      }

      if (!assets || assets.length === 0) {
        throw new Error('Tidak ada data aset untuk diekspor');
      }

      const doc = new jsPDF();

      // Title
      doc.setFontSize(18);
      doc.text('Laporan Aset AC', 14, 20);

      // Subtitle with date
      doc.setFontSize(12);
      doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);

      // Table
      const tableColumn = ['SKU', 'Nama', 'Lokasi', 'Merek', 'PK', 'Status'];
      const tableRows = assets.map((asset: any) => [
        asset.sku,
        asset.name,
        asset.location,
        asset.brand,
        asset.pk,
        asset.status
      ]);

      (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        styles: {
          fontSize: 10
        },
        headStyles: {
          fillColor: [52, 58, 64]
        }
      });

      // Save the PDF
      doc.save(filename);
    } catch (error) {
      console.error('Error exporting assets to PDF:', error);
      throw error;
    }
  }

  async exportTicketsToPDF(filename: string = 'tickets_report.pdf'): Promise<void> {
    try {
      const { data: tickets, error } = await this.ticketService.getTickets();
      
      if (error) {
        throw error;
      }

      if (!tickets || tickets.length === 0) {
        throw new Error('Tidak ada data tiket untuk diekspor');
      }

      const doc = new jsPDF();

      // Title
      doc.setFontSize(18);
      doc.text('Laporan Tiket Perbaikan AC', 14, 20);

      // Subtitle with date
      doc.setFontSize(12);
      doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);

      // Table
      const tableColumn = ['ID', 'Aset', 'Pelapor', 'Kategori', 'Status', 'Tanggal Dibuat'];
      const tableRows = tickets.map((ticket: any) => [
        ticket.id,
        ticket.assets?.name || ticket.asset_id,
        `${ticket.reporter_name} (${ticket.reporter_nik})`,
        ticket.issue_category,
        ticket.status,
        new Date(ticket.created_at).toLocaleDateString('id-ID')
      ]);

      (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        styles: {
          fontSize: 10
        },
        headStyles: {
          fillColor: [52, 58, 64]
        }
      });

      // Save the PDF
      doc.save(filename);
    } catch (error) {
      console.error('Error exporting tickets to PDF:', error);
      throw error;
    }
  }

  async generateMaintenanceReport(options?: ReportOptions): Promise<any[]> {
    try {
      const { data: assets, error } = await this.assetService.getAssets();
      
      if (error) {
        throw error;
      }

      if (!assets) {
        return [];
      }

      // Filter assets based on options
      let filteredAssets = [...assets];
      
      if (options?.status) {
        filteredAssets = filteredAssets.filter(asset => options.status?.includes(asset.status));
      }
      
      if (options?.location) {
        filteredAssets = filteredAssets.filter(asset => options.location?.includes(asset.location));
      }

      // Generate maintenance report data
      const reportData = filteredAssets.map(asset => ({
        id: asset.id,
        sku: asset.sku,
        name: asset.name,
        location: asset.location,
        status: asset.status,
        lastMaintenance: asset.last_maintenance_date,
        nextMaintenance: asset.next_maintenance_date,
        daysUntilMaintenance: this.calculateDaysUntil(asset.next_maintenance_date),
        maintenanceInterval: asset.maintenance_interval_days || 90
      }));

      return reportData;
    } catch (error) {
      console.error('Error generating maintenance report:', error);
      throw error;
    }
  }

  private calculateDaysUntil(dateString: string | undefined): number {
    if (!dateString) return Infinity;
    
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    const timeDiff = date.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  async exportMaintenanceReportToPDF(filename: string = 'maintenance_report.pdf', options?: ReportOptions): Promise<void> {
    try {
      const reportData = await this.generateMaintenanceReport(options);

      const doc = new jsPDF();

      // Title
      doc.setFontSize(18);
      doc.text('Laporan Jadwal Pemeliharaan', 14, 20);

      // Subtitle with date
      doc.setFontSize(12);
      doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);

      // Table
      const tableColumn = ['SKU', 'Nama', 'Lokasi', 'Status', 'Terakhir Servis', 'Berikutnya', 'Hari Lagi'];
      const tableRows = reportData.map(item => [
        item.sku,
        item.name,
        item.location,
        item.status,
        item.lastMaintenance ? new Date(item.lastMaintenance).toLocaleDateString('id-ID') : '-',
        item.nextMaintenance ? new Date(item.nextMaintenance).toLocaleDateString('id-ID') : '-',
        item.daysUntilMaintenance === Infinity ? '-' : item.daysUntilMaintenance.toString()
      ]);

      (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        styles: {
          fontSize: 10
        },
        headStyles: {
          fillColor: [52, 58, 64]
        }
      });

      // Save the PDF
      doc.save(filename);
    } catch (error) {
      console.error('Error exporting maintenance report to PDF:', error);
      throw error;
    }
  }
}