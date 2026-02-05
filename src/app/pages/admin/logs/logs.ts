import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // DatePipe, JsonPipe
import { AuditService, AuditLog } from '../../../services/audit/audit';

@Component({
    selector: 'app-logs',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './logs.html',
})
export class LogsComponent implements OnInit {
    logs: AuditLog[] = [];
    loading = true;

    constructor(private auditService: AuditService) { }

    ngOnInit() {
        this.loadLogs();
    }

    async loadLogs() {
        this.loading = true;
        try {
            const { data, error } = await this.auditService.getLogs(100); // Fetch last 100
            if (data) {
                this.logs = data;
            }
        } catch (e) {
            console.error(e);
        } finally {
            this.loading = false;
        }
    }

    getActionColor(action: string) {
        if (action.includes('LOGIN')) return 'text-blue-600';
        if (action.includes('CREATE')) return 'text-green-600';
        if (action.includes('DELETE') || action.includes('DISPOSE')) return 'text-red-600';
        if (action.includes('VERIFY')) return 'text-purple-600';
        return 'text-gray-600';
    }
}
