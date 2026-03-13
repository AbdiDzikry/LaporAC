import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaintenanceService, MaintenanceSchedule } from '../../../../services/maintenance/maintenance';
import { AssetService } from '../../../../services/asset/asset';
import { ToastService } from '../../../../services/toast/toast';
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
    @Input() isVendor: boolean = false;

    // Maintenance rules
    readonly MAX_UNITS_PER_DAY = 8;
    readonly MAINTENANCE_DAYS = [2, 3, 6]; // Selasa=2, Rabu=3, Sabtu=6
    readonly DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    readonly DAY_LABELS_FULL = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

    schedules: MaintenanceSchedule[] = [];
    loading = false;
    activeTab: 'upcoming' | 'history' | 'all' = 'upcoming';
    viewMode: 'list' | 'calendar' = 'list';
    // mainTab merged into unified view
    generating = false;
    batchCompleting = false;
    checklistMode = false;
    checkedScheduleIds: Set<number> = new Set();

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
    showFilters: boolean = false; // collapsed by default


    constructor(
        private maintenanceService: MaintenanceService,
        private assetService: AssetService,
        private toast: ToastService
    ) {
        // Initialize currentMonth in constructor to ensure it's always set
        this.currentMonth = new Date();
    }

    ngOnInit() {
        if (this.periodId) {
            this.activeTab = 'all';
            this.viewMode = 'calendar';
            this.activeTab = 'all';
            this.viewMode = 'calendar';
            this.showFilters = false;
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

        // Get first day of month and its day of week (Monday=0 based)
        const firstDay = new Date(year, month, 1);
        const jsDay = firstDay.getDay(); // JS: 0=Sun
        const mondayBasedDay = jsDay === 0 ? 6 : jsDay - 1; // Mon=0..Sun=6

        // Get last day of month
        const lastDay = new Date(year, month + 1, 0).getDate();

        // Add previous month padding (start from Monday)
        for (let i = 0; i < mondayBasedDay; i++) {
            const prevDate = new Date(year, month, -mondayBasedDay + i + 1);
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

            // UI LOGIC: Mark past due scheduled items as 'missed'
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            this.schedules.forEach(s => {
                if (s.status === 'scheduled' && s.scheduled_date) {
                    const sDate = new Date(s.scheduled_date);
                    sDate.setHours(0, 0, 0, 0);
                    if (sDate < today) {
                        s.status = 'missed';
                    }
                }
            });

            this.selectedAssetIds.clear();
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
        const notes = prompt('Catatan Pekerjaan (Opsional):');
        if (notes === null) return;

        try {
            const { error } = await this.maintenanceService.completeMaintenance(id, notes || '');
            if (error) throw error;

            this.toast.show('Maintenance berhasil ditandai selesai', 'success');
            this.loadSchedules();
        } catch (err) {
            this.toast.show('Gagal menyelesaikan maintenance', 'error');
        }
    }

    handleScheduleClick(schedule: MaintenanceSchedule) {
        if (this.checklistMode && schedule.status !== 'completed') {
            this.toggleScheduleCheck(schedule.id!);
            return;
        }

        // For Vendors: Clicking an incomplete schedule allows them to complete it directly
        if (this.isVendor && schedule.status !== 'completed' && schedule.id) {
            this.markComplete(schedule.id);
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

    formatStatus(status: string): string {
        const statusMap: { [key: string]: string } = {
            'scheduled': 'Terjadwal',
            'in_progress': 'Dalam Pengerjaan',
            'completed': 'Selesai',
            'missed': 'Terlewat',
            'pending_approval': 'Menunggu Persetujuan',
            'assigned': 'Ditugaskan',
            'cancelled': 'Dibatalkan'
        };
        return statusMap[status] || status.replace(/_/g, ' ').toUpperCase();
    }

    // ========== CALENDAR UX HELPERS ==========

    /** Check if a date falls on a maintenance day (Selasa=2, Rabu=3, Sabtu=6) */
    isMaintenanceDay(date: Date): boolean {
        const jsDay = date.getDay(); // 0=Sun
        return this.MAINTENANCE_DAYS.includes(jsDay);
    }

    /** Get maintenance day label */
    getMaintenanceDayLabel(date: Date): string {
        const jsDay = date.getDay();
        if (jsDay === 6) return 'Office';
        if (jsDay === 3) return 'Area Lain';
        if (jsDay === 2) return 'Overflow';
        return '';
    }

    /** Get capacity info for a date */
    getDayCapacityInfo(date: Date): { count: number; max: number; isFull: boolean; isOver: boolean } {
        const count = this.getSchedulesForDate(date).length;
        return {
            count,
            max: this.MAX_UNITS_PER_DAY,
            isFull: count >= this.MAX_UNITS_PER_DAY,
            isOver: count > this.MAX_UNITS_PER_DAY
        };
    }

    /** Get density class for calendar cell background */
    getDayDensityClass(date: Date): string {
        if (!this.isCurrentMonth(date)) return '';
        const count = this.getSchedulesForDate(date).length;
        if (count === 0) return '';
        if (count <= 3) return 'bg-blue-50/60';
        if (count <= 6) return 'bg-blue-100/60';
        if (count <= 8) return 'bg-blue-200/50';
        return 'bg-red-100/50'; // over capacity
    }

    /** Group schedules for a date by location */
    getSchedulesGroupedByLocation(date: Date | null): { location: string; schedules: MaintenanceSchedule[] }[] {
        if (!date) return [];
        const daySchedules = this.getSchedulesForDate(date);
        const groups = new Map<string, MaintenanceSchedule[]>();

        for (const s of daySchedules) {
            const loc = s.assets?.location || 'Tidak Diketahui';
            if (!groups.has(loc)) groups.set(loc, []);
            groups.get(loc)!.push(s);
        }

        return Array.from(groups.entries())
            .map(([location, schedules]) => ({ location, schedules }))
            .sort((a, b) => a.location.localeCompare(b.location));
    }

    /** Get summary stats for a date */
    getDaySummary(date: Date | null): { total: number; completed: number; pending: number } {
        if (!date) return { total: 0, completed: 0, pending: 0 };
        const daySchedules = this.getSchedulesForDate(date);
        const completed = daySchedules.filter(s => s.status === 'completed').length;
        return {
            total: daySchedules.length,
            completed,
            pending: daySchedules.length - completed
        };
    }

    /** Get unique location summaries for a calendar cell */
    getCellLocationSummary(date: Date): string[] {
        const daySchedules = this.getSchedulesForDate(date);
        const locations = new Set<string>();
        for (const s of daySchedules) {
            if (s.assets?.location) locations.add(s.assets.location);
        }
        return Array.from(locations).slice(0, 2);
    }

    /** Batch complete all schedules for a location on a date */
    async batchCompleteByLocation(date: Date, location: string) {
        const daySchedules = this.getSchedulesForDate(date)
            .filter(s => s.assets?.location === location && s.status !== 'completed');

        if (daySchedules.length === 0) {
            this.toast.show('Semua unit di lokasi ini sudah selesai', 'info');
            return;
        }

        if (!confirm(`Tandai ${daySchedules.length} unit di ${location} sebagai selesai?`)) return;

        this.batchCompleting = true;
        try {
            for (const schedule of daySchedules) {
                if (schedule.id) {
                    await this.maintenanceService.completeMaintenance(schedule.id, 'Batch completion');
                }
            }
            this.toast.show(`${daySchedules.length} unit di ${location} selesai`, 'success');
            await this.loadSchedules();
        } catch (err) {
            this.toast.show('Gagal menyelesaikan batch', 'error');
            console.error(err);
        } finally {
            this.batchCompleting = false;
        }
    }

    /** Get completion count for a location group */
    getLocationCompletedCount(schedules: MaintenanceSchedule[]): number {
        return schedules.filter(s => s.status === 'completed').length;
    }

    // ========== CHECKLIST MODE ==========

    toggleChecklistMode() {
        this.checklistMode = !this.checklistMode;
        if (!this.checklistMode) {
            this.checkedScheduleIds.clear();
        }
    }

    toggleScheduleCheck(id: number) {
        if (this.checkedScheduleIds.has(id)) {
            this.checkedScheduleIds.delete(id);
        } else {
            this.checkedScheduleIds.add(id);
        }
    }

    selectAllForDate() {
        if (!this.selectedDate) return;
        const pending = this.getSchedulesForDate(this.selectedDate)
            .filter(s => s.status !== 'completed' && s.id);

        // If all pending are already checked, uncheck all
        const allChecked = pending.every(s => this.checkedScheduleIds.has(s.id!));
        if (allChecked) {
            pending.forEach(s => this.checkedScheduleIds.delete(s.id!));
        } else {
            pending.forEach(s => this.checkedScheduleIds.add(s.id!));
        }
    }

    async saveChecklist() {
        if (this.checkedScheduleIds.size === 0) return;

        this.batchCompleting = true;
        try {
            const ids = Array.from(this.checkedScheduleIds);
            for (const id of ids) {
                const res = await this.maintenanceService.completeMaintenance(id, 'Completed via checklist');
                if (res.error) throw res.error;
            }
            this.toast.show(`${ids.length} unit berhasil ditandai selesai`, 'success');
            this.checkedScheduleIds.clear();
            this.checklistMode = false;
            await this.loadSchedules();
        } catch (err) {
            this.toast.show('Gagal menyimpan', 'error');
            console.error(err);
        } finally {
            this.batchCompleting = false;
        }
    }


    async openCreateModal(date: Date) {
        this.selectedDateForCreate = date;
        this.selectedAssetIds.clear();
        this.searchQuery = '';
        this.selectedLocationFilter = '';
        this.selectedBrandFilter = '';
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
            const { data, error } = await this.assetService.getAssets();

            if (error) throw error;
            this.allAssets = data || [];

            // Re-sort correctly by name
            this.allAssets.sort((a, b) => a.name.localeCompare(b.name));

        } catch (err) {
            console.error('Failed to load assets:', err);
            this.toast.show('Failed to load AC units', 'error');
        }
    }

    async loadExistingSchedules() {
        try {
            // First get all schedules
            const result = this.periodId
                ? await this.maintenanceService.getSchedules('period', this.periodId)
                : await this.maintenanceService.getSchedules('all');

            if (result.error) throw result.error;

            this.assetSchedules.clear();
            if (result.data) {
                // Filter for 'scheduled' status
                const scheduledSchedules = result.data.filter(schedule => schedule.status === 'scheduled');

                scheduledSchedules.forEach((schedule: any) => {
                    this.assetSchedules.set(schedule.asset_id, schedule.scheduled_date);
                });
            }
        } catch (err) {
            console.error('Failed to load existing schedules:', err);
        }
    }

    toggleFilterByStatus(status: string) {
        if (this.filterStatus === status) {
            this.filterStatus = 'all';
        } else {
            this.filterStatus = status;
        }
        this.loadSchedules();
    }

    filterAssets() {
        const query = this.searchQuery.toLowerCase().trim();

        if (!query && !this.selectedLocationFilter && !this.selectedBrandFilter) {
            this.filteredAssets = [...this.allAssets];
        } else {
            this.filteredAssets = this.allAssets.filter(asset => {
                const matchQuery = !query ||
                    asset.name.toLowerCase().includes(query) ||
                    asset.location.toLowerCase().includes(query) ||
                    asset.sku.toLowerCase().includes(query);

                const matchLocation = !this.selectedLocationFilter || asset.location === this.selectedLocationFilter;
                const matchBrand = !this.selectedBrandFilter || asset.brand === this.selectedBrandFilter;

                return matchQuery && matchLocation && matchBrand;
            });
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
        this.selectedLocationFilter = '';
        this.selectedBrandFilter = '';
        this.filterAssets();
    }

    // Modal Filters
    selectedLocationFilter: string = '';
    selectedBrandFilter: string = '';

    get uniqueAssetLocations(): string[] {
        const locations = new Set<string>();
        this.allAssets.forEach(a => {
            if (a.location) locations.add(a.location);
        });
        return Array.from(locations).sort();
    }

    get uniqueAssetBrands(): string[] {
        const brands = new Set<string>();
        this.allAssets.forEach(a => {
            if (a.brand) brands.add(a.brand);
        });
        return Array.from(brands).sort();
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

    get areAllFilteredSelected(): boolean {
        if (this.filteredAssets.length === 0) return false;
        return this.filteredAssets.every(a => this.selectedAssetIds.has(a.id));
    }

    toggleSelectAllFiltered() {
        if (this.areAllFilteredSelected) {
            // Deselect all visible
            this.filteredAssets.forEach(a => this.selectedAssetIds.delete(a.id));
        } else {
            // Select all visible
            this.filteredAssets.forEach(a => this.selectedAssetIds.add(a.id));
        }
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
            title: 'Pindahkan Jadwal Maintenance',
            message: 'Unit AC ini sudah dijadwalkan untuk maintenance pada tanggal yang berbeda.',
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
