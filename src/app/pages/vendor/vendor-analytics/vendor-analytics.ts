import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpkService } from '../../../services/spk/spk.service';
import { LoadingService } from '../../../services/loading/loading.service';

interface MonthlyPerformance {
    month: string;
    completed: number;
    total: number;
}

@Component({
    selector: 'app-vendor-analytics',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './vendor-analytics.html',
})
export class VendorAnalyticsComponent implements OnInit {
    // Performance Stats
    stats = {
        totalSpks: 0,
        completedSpks: 0,
        activeSpks: 0,
        pendingSpks: 0,
        completionRate: 0,
        avgCompletionDays: 0,
    };

    // SPK Status Breakdown
    statusBreakdown: { label: string; count: number; color: string; percentage: number }[] = [];

    // Monthly Performance (last 6 months)
    monthlyPerformance: MonthlyPerformance[] = [];

    // Recent Completed SPKs
    recentCompleted: any[] = [];

    loading = false;

    constructor(
        private spkService: SpkService,
        private loadingService: LoadingService
    ) { }

    async ngOnInit() {
        await this.loadAnalytics();
    }

    async loadAnalytics() {
        this.loading = true;
        this.loadingService.show();

        try {
            const { data: spks } = await this.spkService.getSpks();
            if (!spks) return;

            // --- Calculate Stats ---
            this.stats.totalSpks = spks.length;
            this.stats.completedSpks = spks.filter((s: any) => s.status === 'completed').length;
            this.stats.activeSpks = spks.filter((s: any) => s.status === 'assigned' || s.status === 'in_progress').length;
            this.stats.pendingSpks = spks.filter((s: any) => s.status === 'draft' || s.status === 'sent').length;
            this.stats.completionRate = this.stats.totalSpks > 0
                ? Math.round((this.stats.completedSpks / this.stats.totalSpks) * 100)
                : 0;

            // Calculate average completion time (days between created_at and updated_at for completed SPKs)
            const completedSpks = spks.filter((s: any) => s.status === 'completed');
            if (completedSpks.length > 0) {
                const totalDays = completedSpks.reduce((sum: number, spk: any) => {
                    const created = new Date(spk.created_at);
                    const updated = new Date(spk.updated_at);
                    const diff = Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
                    return sum + Math.max(diff, 1);
                }, 0);
                this.stats.avgCompletionDays = Math.round(totalDays / completedSpks.length);
            }

            // --- Status Breakdown ---
            const statusMap: { [key: string]: { label: string; color: string } } = {
                'draft': { label: 'Menunggu', color: 'bg-gray-500' },
                'sent': { label: 'Dikirim', color: 'bg-purple-500' },
                'assigned': { label: 'Diterima', color: 'bg-blue-500' },
                'in_progress': { label: 'Dikerjakan', color: 'bg-amber-500' },
                'completed': { label: 'Selesai', color: 'bg-green-500' },
            };

            this.statusBreakdown = Object.entries(statusMap)
                .map(([status, info]) => {
                    const count = spks.filter((s: any) => s.status === status).length;
                    return {
                        label: info.label,
                        count,
                        color: info.color,
                        percentage: this.stats.totalSpks > 0 ? Math.round((count / this.stats.totalSpks) * 100) : 0
                    };
                })
                .filter(item => item.count > 0);

            // --- Monthly Performance (last 6 months) ---
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
            const now = new Date();
            this.monthlyPerformance = [];

            for (let i = 5; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthStr = months[date.getMonth()];
                const yearStr = date.getFullYear().toString().slice(2);

                const monthSpks = spks.filter((s: any) => {
                    const spkDate = new Date(s.created_at);
                    return spkDate.getMonth() === date.getMonth() && spkDate.getFullYear() === date.getFullYear();
                });

                const completedInMonth = monthSpks.filter((s: any) => s.status === 'completed').length;

                this.monthlyPerformance.push({
                    month: `${monthStr} '${yearStr}`,
                    completed: completedInMonth,
                    total: monthSpks.length
                });
            }

            // --- Recent Completed ---
            this.recentCompleted = completedSpks
                .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                .slice(0, 5);

        } catch (error) {
            console.error('Error loading vendor analytics:', error);
        } finally {
            this.loading = false;
            this.loadingService.hide();
        }
    }

    getMaxMonthlyTotal(): number {
        return Math.max(...this.monthlyPerformance.map(m => m.total), 1);
    }
}
