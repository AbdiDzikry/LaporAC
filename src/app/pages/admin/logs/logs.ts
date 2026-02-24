import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService, AuditLog } from '../../../services/audit/audit';

@Component({
    selector: 'app-logs',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './logs.html',
})
export class LogsComponent implements OnInit {
    allLogs: AuditLog[] = [];
    loading = true;

    // Filters
    searchQuery = '';
    selectedAction = 'Semua';
    actionTypes: string[] = ['Semua'];

    // Pagination
    currentPage = 1;
    pageSize = 20;

    constructor(private auditService: AuditService) { }

    ngOnInit() {
        this.loadLogs();
    }

    async loadLogs() {
        this.loading = true;
        try {
            const { data, error } = await this.auditService.getLogs(500);
            if (data) {
                this.allLogs = data;
                // Extract unique action types
                const actions = new Set(data.map((l: any) => l.action));
                this.actionTypes = ['Semua', ...Array.from(actions).sort()];
            }
        } catch (e) {
            console.error(e);
        } finally {
            this.loading = false;
        }
    }

    get filteredLogs(): AuditLog[] {
        let result = this.allLogs;

        if (this.selectedAction !== 'Semua') {
            result = result.filter((l: any) => l.action === this.selectedAction);
        }

        if (this.searchQuery.trim()) {
            const q = this.searchQuery.toLowerCase();
            result = result.filter((l: any) =>
                l.action?.toLowerCase().includes(q) ||
                l.target_table?.toLowerCase().includes(q) ||
                l.profiles?.full_name?.toLowerCase().includes(q) ||
                l.profiles?.email?.toLowerCase().includes(q) ||
                JSON.stringify(l.details || {}).toLowerCase().includes(q)
            );
        }

        return result;
    }

    get totalPages(): number {
        return Math.ceil(this.filteredLogs.length / this.pageSize) || 1;
    }

    get paginatedLogs(): AuditLog[] {
        const start = (this.currentPage - 1) * this.pageSize;
        return this.filteredLogs.slice(start, start + this.pageSize);
    }

    get pageNumbers(): number[] {
        const pages: number[] = [];
        const total = this.totalPages;
        const current = this.currentPage;
        const start = Math.max(1, current - 2);
        const end = Math.min(total, current + 2);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    }

    goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
        }
    }

    onFilterChange() {
        this.currentPage = 1;
    }

    getActionColor(action: string) {
        if (action.includes('LOGIN')) return 'text-blue-600';
        if (action.includes('CREATE')) return 'text-green-600';
        if (action.includes('DELETE') || action.includes('DISPOSE')) return 'text-red-600';
        if (action.includes('VERIFY')) return 'text-purple-600';
        return 'text-gray-600';
    }
}
