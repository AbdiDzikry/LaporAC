import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaintenanceService, MaintenanceSchedule } from '../../../../services/maintenance/maintenance';
import { ToastService } from '../../../../services/toast/toast';
import { SupabaseService } from '../../../../services/supabase/supabase';
import { RouterLink } from '@angular/router';
import { CustomDropdownComponent } from '../../../../components/custom-dropdown/custom-dropdown.component';

@Component({
    selector: 'app-maintenance-list',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, CustomDropdownComponent],
    templateUrl: './maintenance-list.html',
})
export class MaintenanceListComponent implements OnInit, OnChanges {
    @Input() periodId: number | null = null;
    @Input() initialMonth: number | null = null; // 1-12
    @Input() initialYear: number | null = null;

    schedules: MaintenanceSchedule[] = [];
    loading = false;
    activeTab: 'upcoming' | 'history' | 'all' = 'upcoming';
    viewMode: 'list' | 'calendar' = 'list';
    mainTab: 'planning' | 'execution' = 'planning';
    generating = false;

    // Calendar Data
    currentMonth: Date;
    calendarDays: Date[] = [];
    selectedDate: Date | null = null;

    // Schedule Creation Modal
    showCreateModal = false;
    selectedDateForCreate: Date | null = null;
    allAssets: any[] = [];
    filteredAssets: any[] = [];
    selectedAssetIds: Set<number> = new Set();
    creating = false;
    searchQuery = '';
    assetSchedules: Map<number, string> = new Map();

    // Confirmation Dialog
    showConfirmDialog = false;
    confirmDialogData: {
        title: string;
        message: string;
        acName: string;
        oldDate: string;
        newDate: string;
        onConfirm: () => void;
    } | null = null;

    // Filters
    filterStatus: string = 'all';
    filterLocation: string = '';
    filterBrand: string = '';
    filterDateFrom: string = '';
    filterDateTo: string = '';
    showFilters: boolean = true;


    constructor(
        private maintenanceService: MaintenanceService,
        private toast: ToastService,
        private supabase: SupabaseService
    ) {
        // Initialize currentMonth in constructor to ensure it's always set
        this.currentMonth = new Date();
    }

    ngOnInit() {
        if (this.periodId) {
            this.activeTab = 'all';
            this.viewMode = 'calendar';
            // Only set currentMonth if explicitly provided
            if (this.initialMonth && this.initialYear) {
                this.currentMonth = new Date(this.initialYear, this.initialMonth - 1, 1);
            }
        }

        // Ensure currentMonth is set to current date if not set
        if (!this.currentMonth) {
            this.currentMonth = new Date();
        }
        this.loadSchedules();
        this.generateCalendar();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['periodId'] && !changes['periodId'].firstChange) {
            this.loadSchedules();
        }
        if (changes['initialMonth'] || changes['initialYear']) {
            if (this.initialMonth && this.initialYear) {
                this.currentMonth = new Date(this.initialYear, this.initialMonth - 1, 1);
                this.generateCalendar();
            }
        }
    }

    setTab(tab: 'upcoming' | 'history' | 'all') {
        this.activeTab = tab;
        this.loadSchedules();
    }

    setMainTab(tab: 'planning' | 'execution') {
        this.mainTab = tab;
        this.viewMode = 'calendar';
        this.generateCalendar();
    }

    setViewMode(mode: 'list' | 'calendar') {
        this.viewMode = mode;
        if (mode === 'calendar') {
            if (this.activeTab !== 'all') {
                this.activeTab = 'all';
                this.loadSchedules();
            }
            this.generateCalendar();
        }
    }

    changeMonth(delta: number) {
        if (!this.currentMonth) {
            this.currentMonth = new Date();
        }
        this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + delta, 1);
        this.generateCalendar();
    }

    generateCalendar() {
        if (!this.currentMonth) {
            this.currentMonth = new Date();
        }

        this.calendarDays = [];
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();

        // Get first day of month and its day of week
        const firstDay = new Date(year, month, 1);
        const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday

        // Get last day of month
        const lastDay = new Date(year, month + 1, 0).getDate();

        // Add empty days for alignment (start from Monday)
        const startPadding = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
        for (let i = 0; i < startPadding; i++) {
            const prevDate = new Date(year, month, -startPadding + i + 1);
            this.calendarDays.push(prevDate);
        }

        // Add actual days of month
        for (let day = 1; day <= lastDay; day++) {
            this.calendarDays.push(new Date(year, month, day));
        }

        // Add padding to complete the grid (42 cells = 6 weeks)
        const remaining = 42 - this.calendarDays.length;
        for (let i = 1; i <= remaining; i++) {
            this.calendarDays.push(new Date(year, month + 1, i));
        }
    }

    selectDate(date: Date) {
        this.selectedDate = date;
    }

    getSchedulesForDate(date: Date | null): MaintenanceSchedule[] {
        if (!date) return [];
        const dateStr = this.formatDate(date);
        return this.schedules.filter(s => s.scheduled_date?.substring(0, 10) === dateStr);
    }

    formatDate(date: Date | null): string {
        if (!date) return '';
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    isToday(date: Date): boolean {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    isCurrentMonth(date: Date): boolean {
        if (!this.currentMonth) {
            return false;
        }
        return date.getMonth() === this.currentMonth.getMonth();
    }

    // Filter Methods
    get filteredSchedules(): MaintenanceSchedule[] {
        let filtered = [...this.schedules];

        // Status filter
        if (this.filterStatus && this.filterStatus !== 'all') {
            filtered = filtered.filter(s => s.status === this.filterStatus);
        }

        // Location filter
        if (this.filterLocation) {
            filtered = filtered.filter(s => s.assets?.location === this.filterLocation);
        }

        // Brand filter
        if (this.filterBrand) {
            filtered = filtered.filter(s => s.assets?.brand === this.filterBrand);
        }

        // Date range filter
        if (this.filterDateFrom) {
            filtered = filtered.filter(s => s.scheduled_date && s.scheduled_date >= this.filterDateFrom);
        }
        if (this.filterDateTo) {
            filtered = filtered.filter(s => s.scheduled_date && s.scheduled_date <= this.filterDateTo);
        }

        return filtered;
    }

    get uniqueLocations(): string[] {
        const locations = new Set<string>();
        this.schedules.forEach(s => {
            if (s.assets?.location) {
                locations.add(s.assets.location);
            }
        });
        return Array.from(locations).sort();
    }

    get locationOptions(): any[] {
        return [
            { label: 'Semua Lokasi', value: '' },
            ...this.uniqueLocations.map(l => ({ label: l, value: l }))
        ];
    }

    get uniqueBrands(): string[] {
        const brands = new Set<string>();
        this.schedules.forEach(s => {
            if (s.assets?.brand) {
                brands.add(s.assets.brand);
            }
        });
        return Array.from(brands).sort();
    }

    get brandOptions(): any[] {
        return [
            { label: 'Semua Tipe', value: '' },
            ...this.uniqueBrands.map(b => ({ label: b, value: b }))
        ];
    }

    statusOptions = [
        { label: 'Semua Status', value: 'all' },
        { label: 'Terjadwal', value: 'scheduled' },
        { label: 'Dalam Pengerjaan', value: 'in_progress' },
        { label: 'Selesai', value: 'completed' },
        { label: 'Terlewat', value: 'missed' }
    ];

    clearFilters() {
        this.filterStatus = 'all';
        this.filterLocation = '';
        this.filterBrand = '';
        this.filterDateFrom = '';
        this.filterDateTo = '';
    }

    async loadSchedules() {
        this.loading = true;
        try {
            let result;
            if (this.periodId) {
                result = await this.maintenanceService.getSchedules('period', this.periodId);
            } else {
                result = await this.maintenanceService.getSchedules(this.activeTab);
            }

            const { data, error } = result;

            if (error) throw error;
            this.schedules = data || [];

            // FALLBACK: Use mock data if database is empty (for demo)
            if (this.schedules.length === 0 && this.activeTab === 'all' && !this.periodId) {
                console.warn('⚠️ No data from database, using MOCK DATA for demo');
                this.schedules = this.generateMockData();
            }
        } catch (err) {
            this.toast.show('Failed to load maintenance schedules', 'error');
            console.error(err);
        } finally {
            this.loading = false;
        }
    }

    generateMockData(): MaintenanceSchedule[] {
        const mockData: MaintenanceSchedule[] = [];
        const statuses: ('scheduled' | 'completed' | 'missed' | 'in_progress')[] = ['scheduled', 'completed', 'missed', 'in_progress'];

        // Generate 30 mock schedules for January 2026
        for (let i = 1; i <= 30; i++) {
            const day = (i % 31) + 1;
            mockData.push({
                id: i,
                asset_id: i,
                scheduled_date: `2026-01-${String(day).padStart(2, '0')}`,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                assets: {
                    name: `AC Unit ${i}`,
                    location: `Room ${Math.floor(i / 5) + 1}`,
                    sku: `AC-${String(i).padStart(3, '0')}`,
                    brand: i % 3 === 0 ? 'SPLITE' : i % 3 === 1 ? 'CASSET' : 'CHILLER',
                    maintenance_interval_days: 30
                }
            });
        }

        return mockData;
    }

    async generateTickets() {
        const confirm = window.confirm('Generate Maintenance Tickets for assets due in next 7 days?');
        if (!confirm) return;

        this.generating = true;
        try {
            const { data: assets, error } = await this.maintenanceService.getAssetsDue(7);
            if (error) throw error;

            if (!assets || assets.length === 0) {
                this.toast.show('No assets due for maintenance.', 'info');
                return;
            }

            let count = 0;
            for (const asset of assets) {
                await this.maintenanceService.generatePMTicket(asset);
                count++;
            }

            this.toast.show(`Generated ${count} maintenance tickets!`, 'success');
            this.loadSchedules();
        } catch (err) {
            this.toast.show('Error generating tickets', 'error');
            console.error(err);
        } finally {
            this.generating = false;
        }
    }

    async markComplete(id: number) {
        const notes = prompt('Technician Notes (Optional):');
        if (notes === null) return;

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

    // ========== SCHEDULE CREATION METHODS ==========

    async openCreateModal(date: Date) {
        this.selectedDateForCreate = date;
        this.selectedAssetIds.clear();
        this.searchQuery = '';
        await this.loadAllAssets();
        await this.loadExistingSchedules();

        // Pre-select assets that are already scheduled for this date
        const selectedDateStr = this.formatDate(this.selectedDateForCreate);
        this.assetSchedules.forEach((scheduledDate, assetId) => {
            if (scheduledDate && scheduledDate.startsWith(selectedDateStr)) {
                this.selectedAssetIds.add(assetId);
            }
        });

        this.filterAssets();
        this.showCreateModal = true;
    }

    async loadAllAssets() {
        try {
            const { data, error } = await this.supabase.client
                .from('assets')
                .select('*')
                .order('name');

            if (error) throw error;
            this.allAssets = data || [];
        } catch (err) {
            console.error('Failed to load assets:', err);
            this.toast.show('Failed to load AC units', 'error');
        }
    }

    async loadExistingSchedules() {
        try {
            let query = this.supabase.client
                .from('maintenance_schedules')
                .select('asset_id, scheduled_date')
                .eq('status', 'scheduled');

            // If we are in a specific period, only check for schedules within that period
            if (this.periodId) {
                query = query.eq('period_id', this.periodId);
            }

            const { data, error } = await query;

            if (error) throw error;

            this.assetSchedules.clear();
            if (data) {
                data.forEach((schedule: any) => {
                    this.assetSchedules.set(schedule.asset_id, schedule.scheduled_date);
                });
            }
        } catch (err) {
            console.error('Failed to load existing schedules:', err);
        }
    }

    filterAssets() {
        const query = this.searchQuery.toLowerCase().trim();

        if (!query) {
            this.filteredAssets = [...this.allAssets];
        } else {
            this.filteredAssets = this.allAssets.filter(asset =>
                asset.name.toLowerCase().includes(query) ||
                asset.location.toLowerCase().includes(query) ||
                asset.sku.toLowerCase().includes(query)
            );
        }

        // Sort: Selected first, then by name
        this.filteredAssets.sort((a, b) => {
            const aSelected = this.selectedAssetIds.has(a.id);
            const bSelected = this.selectedAssetIds.has(b.id);

            if (aSelected && !bSelected) return -1;
            if (!aSelected && bSelected) return 1;
            return a.name.localeCompare(b.name);
        });
    }

    onSearchChange() {
        this.filterAssets();
    }

    clearSearch() {
        this.searchQuery = '';
        this.filterAssets();
    }

    isAssetScheduled(assetId: number): boolean {
        return this.assetSchedules.has(assetId);
    }

    getAssetScheduleDate(assetId: number): string | null {
        return this.assetSchedules.get(assetId) || null;
    }

    getSelectedDateString(): string {
        return this.formatDate(this.selectedDateForCreate);
    }

    isSelectedDate(date: Date): boolean {
        if (!this.selectedDate) return false;
        return this.formatDate(this.selectedDate) === this.formatDate(date);
    }

    async toggleAssetSelection(assetId: number) {
        // Check if already scheduled on different date
        const existingDate = this.assetSchedules.get(assetId);
        const selectedDateStr = this.formatDate(this.selectedDateForCreate);

        if (existingDate && existingDate !== selectedDateStr) {
            // Show custom confirmation dialog
            const asset = this.allAssets.find(a => a.id === assetId);
            this.showConfirmationDialog(
                asset?.name || 'This AC',
                existingDate,
                selectedDateStr,
                () => {
                    // On confirm: toggle selection
                    if (this.selectedAssetIds.has(assetId)) {
                        this.selectedAssetIds.delete(assetId);
                    } else {
                        this.selectedAssetIds.add(assetId);
                    }
                }
            );
            return;
        }

        // Toggle selection
        if (this.selectedAssetIds.has(assetId)) {
            this.selectedAssetIds.delete(assetId);
        } else {
            this.selectedAssetIds.add(assetId);
        }
    }

    showConfirmationDialog(acName: string, oldDate: string, newDate: string, onConfirm: () => void) {
        this.confirmDialogData = {
            title: 'Move Maintenance Schedule',
            message: 'This AC unit is already scheduled for maintenance on a different date.',
            acName: acName,
            oldDate: oldDate,
            newDate: newDate,
            onConfirm: onConfirm
        };
        this.showConfirmDialog = true;
    }

    confirmDialogAction() {
        if (this.confirmDialogData?.onConfirm) {
            this.confirmDialogData.onConfirm();
        }
        this.closeConfirmDialog();
    }

    closeConfirmDialog() {
        this.showConfirmDialog = false;
        this.confirmDialogData = null;
    }

    async saveSchedules() {
        if (this.selectedAssetIds.size === 0) return;

        this.creating = true;
        try {
            const assetIds = Array.from(this.selectedAssetIds);
            const dateStr = this.formatDate(this.selectedDateForCreate);

            // Check if we have a period ID provided via Input
            // Use undefined instead of null to match the method signature
            const periodIdToUse = this.periodId !== null ? this.periodId : undefined;

            const { error } = await this.maintenanceService.createBulkSchedules(
                assetIds,
                dateStr,
                periodIdToUse
            );

            if (error) throw error;

            this.toast.show(`${assetIds.length} jadwal berhasil dibuat`, 'success');
            this.closeCreateModal();
            this.loadSchedules();
        } catch (err) {
            this.toast.show('Gagal membuat jadwal', 'error');
            console.error(err);
        } finally {
            this.creating = false;
        }
    }

    closeCreateModal() {
        this.showCreateModal = false;
        this.selectedDateForCreate = null;
        this.selectedAssetIds.clear();
    }
}
