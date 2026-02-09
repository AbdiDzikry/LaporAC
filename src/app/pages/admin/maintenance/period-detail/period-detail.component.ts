import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PeriodService, MaintenancePeriod } from '../../../../services/period/period.service';
import { MaintenanceService } from '../../../../services/maintenance/maintenance';
import { MaintenanceListComponent } from '../maintenance-list/maintenance-list';
import { ToastService } from '../../../../services/toast/toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
    selector: 'app-period-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, MaintenanceListComponent],
    templateUrl: './period-detail.component.html',
})
export class PeriodDetailComponent implements OnInit {
    periodId: number | null = null;
    period: MaintenancePeriod | null = null;
    loading = false;
    exporting = false;

    constructor(
        private route: ActivatedRoute,
        private periodService: PeriodService,
        private maintenanceService: MaintenanceService,
        private toast: ToastService
    ) { }

    async ngOnInit() {
        this.route.params.subscribe(async params => {
            if (params['id']) {
                this.periodId = +params['id'];
                await this.loadPeriod();
            }
        });
    }

    async loadPeriod() {
        if (!this.periodId) return;

        this.loading = true;
        try {
            const { data, error } = await this.periodService.getPeriodById(this.periodId);
            if (error) throw error;
            this.period = data;
        } catch (err) {
            console.error(err);
            this.toast.show('Gagal memuat detail periode', 'error');
        } finally {
            this.loading = false;
        }
    }

    async exportPDF() {
        if (!this.period || !this.periodId) return;

        this.exporting = true;
        this.toast.show('Sedang membuat PDF...', 'info');

        try {
            // 1. Fetch all schedules for this period
            const { data: schedules, error } = await this.maintenanceService.getSchedules('period', this.periodId);

            if (error) throw error;
            if (!schedules || schedules.length === 0) {
                this.toast.show('Tidak ada data untuk diexport', 'warning');
                return;
            }

            // 2. Initialize PDF
            const doc = new jsPDF();

            // 3. Add Header
            const title = `Laporan Pemeliharaan AC - ${this.period.name}`;
            doc.setFontSize(18);
            doc.text(title, 14, 22);

            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text(`Status: ${this.getStatusLabel(this.period.status)} | Total Unit: ${this.period.total_schedules || 0} | Selesai: ${this.period.completed_schedules || 0}`, 14, 30);
            const dateStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            doc.text(`Dicetak pada: ${dateStr}`, 14, 36);

            // 4. Prepare Table Data
            const tableData = schedules.map((item: any, index: number) => [
                index + 1,
                item.assets?.name || '-',
                item.assets?.location || '-',
                item.assets?.brand || '-',
                new Date(item.scheduled_date).toLocaleDateString('id-ID'),
                item.status === 'completed' ? 'Selesai' : (item.status === 'scheduled' ? 'Terjadwal' : item.status),
                item.completed_date ? new Date(item.completed_date).toLocaleDateString('id-ID') : '-'
            ]);

            // 5. Generate Table
            autoTable(doc, {
                head: [['No', 'Nama Unit', 'Lokasi', 'Merk', 'Jadwal', 'Status', 'Tgl Selesai']],
                body: tableData,
                startY: 44,
                theme: 'grid',
                styles: { fontSize: 8 },
                headStyles: { fillColor: [22, 163, 74] } // Green-600 to match theme
            });

            // 6. Save
            doc.save(`Laporan_Maintenance_${this.period.name.replace(/\s+/g, '_')}.pdf`);
            this.toast.show('PDF berhasil didownload', 'success');

        } catch (err) {
            console.error('Export failed:', err);
            this.toast.show('Gagal export PDF', 'error');
        } finally {
            this.exporting = false;
        }
    }

    getStatusColor(status: string): string {
        const colors: { [key: string]: string } = {
            'draft': 'bg-gray-100 text-gray-700 border-gray-300',
            'active': 'bg-blue-100 text-blue-700 border-blue-300',
            'completed': 'bg-green-100 text-green-700 border-green-300',
            'archived': 'bg-purple-100 text-purple-700 border-purple-300'
        };
        return colors[status] || colors['draft'];
    }

    getStatusLabel(status: string): string {
        const labels: { [key: string]: string } = {
            'draft': 'Draft',
            'active': 'Aktif',
            'completed': 'Selesai',
            'archived': 'Arsip'
        };
        return labels[status] || status;
    }

    protected readonly Math = Math;
}
