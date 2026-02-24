import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PeriodService, MaintenancePeriod, PeriodStats } from '../../../../services/period/period.service';
import { ToastService } from '../../../../services/toast/toast';

@Component({
    selector: 'app-periods-list',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './periods-list.component.html',
})
export class PeriodsListComponent implements OnInit {
    periods: MaintenancePeriod[] = [];
    loading = false;

    // Filters
    selectedYear: number = new Date().getFullYear();
    selectedStatus: string = 'all';
    availableYears: number[] = [];

    // Stats
    yearStats: PeriodStats | null = null;

    // Create Modal
    showCreateModal = false;
    creating = false;
    newPeriod = {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        templatePeriodId: null as number | null
    };

    monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    constructor(
        private periodService: PeriodService,
        private toast: ToastService
    ) { }

    async ngOnInit() {
        await this.loadAvailableYears();
        await this.periodService.syncPeriodStatuses(); // Auto-sync statuses
        await this.loadPeriods();
        await this.loadYearStats();
    }

    async loadAvailableYears() {
        const years = await this.periodService.getAvailableYears();
        this.availableYears = years.length > 0 ? years : [new Date().getFullYear()];
    }

    async loadPeriods() {
        this.loading = true;
        try {
            const { data, error } = await this.periodService.getPeriods(
                this.selectedYear,
                this.selectedStatus
            );

            if (error) throw error;
            this.periods = data || [];

            // Identify overdue periods
            const today = new Date();
            const currentMonth = today.getMonth() + 1;
            const currentYear = today.getFullYear();

            this.periods.forEach(p => {
                if (p.status === 'active' || p.status === 'draft') {
                    if (p.year < currentYear || (p.year === currentYear && p.month < currentMonth)) {
                        const total = p.total_schedules || 0;
                        const completed = p.completed_schedules || 0;
                        if (completed < total || total === 0) {
                            p.status = 'overdue';
                        }
                    }
                }
            });

        } catch (err) {
            console.error(err);
            this.toast.show('Gagal memuat periode', 'error');
        } finally {
            this.loading = false;
        }
    }

    async loadYearStats() {
        this.yearStats = await this.periodService.getYearStats(this.selectedYear);
    }

    onFilterChange() {
        this.loadPeriods();
        this.loadYearStats();
    }

    openCreateModal() {
        this.showCreateModal = true;
        this.newPeriod = {
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            templatePeriodId: null
        };
    }

    closeCreateModal() {
        this.showCreateModal = false;
    }

    async createPeriod() {
        this.creating = true;
        try {
            const { data, error } = await this.periodService.createPeriod(
                this.newPeriod.month,
                this.newPeriod.year,
                this.newPeriod.templatePeriodId || undefined
            );

            if (error) {
                if (error.code === '23505') {
                    throw new Error('Periode untuk bulan dan tahun ini sudah ada');
                }
                throw error;
            }

            this.toast.show('Periode berhasil dibuat', 'success');
            this.closeCreateModal();
            await this.loadPeriods();
            await this.loadYearStats();
        } catch (err: any) {
            console.error(err);
            this.toast.show(err.message || 'Gagal membuat periode', 'error');
        } finally {
            this.creating = false;
        }
    }

    async migrateData() {
        this.loading = true;
        try {
            // this.periodService.migrateJan2026(); 
            this.toast.show('Migrasi data dinonaktifkan di backend lokal', 'warning');
            await this.loadPeriods();
        } catch (err) {
            console.error(err);
            this.toast.show('Gagal migrasi data', 'error');
        } finally {
            this.loading = false;
        }
    }

    async deletePeriod(period: MaintenancePeriod) {
        if (!period.id) return;

        if (!confirm(`Hapus periode ${period.name}?`)) return;

        try {
            const { error } = await this.periodService.deletePeriod(period.id);

            if (error) throw error;

            this.toast.show('Periode berhasil dihapus', 'success');
            await this.loadPeriods();
            await this.loadYearStats();
        } catch (err: any) {
            console.error(err);
            this.toast.show(err.message || 'Gagal menghapus periode', 'error');
        }
    }

    getStatusColor(status: string): string {
        const colors: { [key: string]: string } = {
            'draft': 'bg-gray-100 text-gray-700 border-gray-300',
            'active': 'bg-blue-100 text-blue-700 border-blue-300',
            'completed': 'bg-green-100 text-green-700 border-green-300',
            'archived': 'bg-purple-100 text-purple-700 border-purple-300',
            'overdue': 'bg-red-100 text-red-700 border-red-300'
        };
        return colors[status] || colors['draft'];
    }

    getStatusLabel(status: string): string {
        const labels: { [key: string]: string } = {
            'draft': 'Draft',
            'active': 'Aktif',
            'completed': 'Selesai',
            'archived': 'Arsip',
            'overdue': 'Terlewat'
        };
        return labels[status] || status;
    }

    getCompletionPercentage(period: MaintenancePeriod): number {
        if (!period.total_schedules || period.total_schedules === 0) return 0;
        return Math.round(((period.completed_schedules || 0) / period.total_schedules) * 100);
    }

    getProgressBarColor(percentage: number): string {
        if (percentage >= 90) return 'bg-green-500';
        if (percentage >= 70) return 'bg-blue-500';
        if (percentage >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    }
}
