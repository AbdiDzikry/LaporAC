import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaintenanceService, MaintenanceSchedule } from '../../../../services/maintenance/maintenance';
import { ToastService } from '../../../../services/toast/toast';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-maintenance-list',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './maintenance-list.html',
})
export class MaintenanceListComponent implements OnInit {
    schedules: MaintenanceSchedule[] = [];
    loading = false;
    activeTab: 'upcoming' | 'history' | 'all' = 'upcoming';
    viewMode: 'list' | 'timeline' = 'list';
    generating = false;

    // Timeline Data
    timelineMonth: Date = new Date(); // Current focused month
    timelineDays: Date[] = [];

    constructor(
        private maintenanceService: MaintenanceService,
        private toast: ToastService
    ) {
        this.generateTimelineDates();
    }

    ngOnInit() {
        this.loadSchedules();
    }

    setTab(tab: 'upcoming' | 'history' | 'all') {
        this.activeTab = tab;
        this.loadSchedules();
    }

    setViewMode(mode: 'list' | 'timeline') {
        this.viewMode = mode;
        if (mode === 'timeline') {
            // Force 'all' to ensure we see everything in the calendar
            this.setTab('all');
            this.generateTimelineDates();
        }
    }

    changeMonth(delta: number) {
        // Update month
        this.timelineMonth = new Date(this.timelineMonth.setMonth(this.timelineMonth.getMonth() + delta));
        this.generateTimelineDates();
    }

    generateTimelineDates() {
        this.timelineDays = [];

        // Start from 1st day of timelineMonth
        const start = new Date(this.timelineMonth.getFullYear(), this.timelineMonth.getMonth(), 1);
        const end = new Date(this.timelineMonth.getFullYear(), this.timelineMonth.getMonth() + 1, 0); // Last day of month

        // Generate all days in month
        for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
            this.timelineDays.push(new Date(d));
        }
    }

    get uniqueAssets() {
        // Get unique assets based on the CURRENT view schedules
        const assetsMap = new Map();
        this.schedules.forEach(s => {
            // We ensure we pass the ID because it might not be in the joined s.assets object if not selected
            if (s.assets && !assetsMap.has(s.asset_id)) {
                assetsMap.set(s.asset_id, { ...s.assets, id: s.asset_id });
            }
        });
        return Array.from(assetsMap.values());
    }



    getScheduleForDay(assetId: number, date: Date): MaintenanceSchedule | undefined {
        // Use toDateString() for robust local-time date comparison
        return this.schedules.find(s => {
            if (s.asset_id != assetId) return false;
            if (!s.scheduled_date) return false;

            const sDate = new Date(s.scheduled_date);
            return sDate.toDateString() === date.toDateString();
        });
    }

    async loadSchedules() {
        this.loading = true;
        try {
            // Check if we are in timeline view, maybe we want ALL data regardless of tab to ensure navigation works?
            // But Filter Tab is explicit. Let's respect it.
            // If user wants to see Jan History, they should click "History" or "All".
            // However, Jan seed data is 'scheduled', so it belongs to 'upcoming' (logically, pending work), even if in past.
            const { data, error } = await this.maintenanceService.getSchedules(this.activeTab);
            if (error) throw error;
            this.schedules = data || [];

            // Auto-jump to the month where we have data (if any)
            if (this.schedules.length > 0 && this.viewMode === 'timeline') {
                const firstDate = new Date(this.schedules[0].scheduled_date);
                if (!isNaN(firstDate.getTime())) {
                    this.timelineMonth = firstDate;
                    this.generateTimelineDates();
                }
            }
        } catch (err) {
            this.toast.show('Failed to load maintenance schedules', 'error');
            console.error(err);
        } finally {
            this.loading = false;
        }
    }

    // --- Actions ---

    async generateTickets() {
        const confirm = window.confirm('Generate Maintenance Tickets for assets due in next 7 days?');
        if (!confirm) return;

        this.generating = true;
        try {
            // 1. Get Assets Due
            const { data: assets, error } = await this.maintenanceService.getAssetsDue(7);
            if (error) throw error;

            if (!assets || assets.length === 0) {
                this.toast.show('No assets due for maintenance.', 'info');
                return;
            }

            // 2. Generate for each
            let count = 0;
            for (const asset of assets) {
                await this.maintenanceService.generatePMTicket(asset);
                count++;
            }

            this.toast.show(`Generated ${count} maintenance tickets!`, 'success');
            this.loadSchedules(); // Refresh

        } catch (err) {
            this.toast.show('Error generating tickets', 'error');
            console.error(err);
        } finally {
            this.generating = false;
        }
    }

    async markComplete(id: number) {
        const notes = prompt('Technician Notes (Optional):');
        if (notes === null) return; // Cancelled

        try {
            const { error } = await this.maintenanceService.completeMaintenance(id, notes || '');
            if (error) throw error;

            this.toast.show('Maintenance marked as completed', 'success');
            this.loadSchedules();
        } catch (err) {
            this.toast.show('Failed to complete maintenance', 'error');
        }
    }

    getStatusColor(status: string) {
        switch (status) {
            case 'scheduled': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'in_progress': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
            case 'completed': return 'bg-green-50 text-green-700 border-green-100';
            case 'missed': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    }
}
