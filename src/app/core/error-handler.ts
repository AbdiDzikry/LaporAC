import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { ToastService } from '../services/toast/toast';
// import { AuditService } from '../services/audit/audit'; // Optional: Use Injector to avoid circular dependency

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

    constructor(private injector: Injector) { }

    handleError(error: any) {
        const toastService = this.injector.get(ToastService);
        // const auditService = this.injector.get(AuditService);

        const message = error.message ? error.message : error.toString();
        const cleanMessage = message.replace('Uncaught (in promise):', '').trim();

        console.error('Global Error:', error);

        // Filter out negligible errors if needed
        toastService.show(`Terjadi Kesalahan: ${cleanMessage.substring(0, 100)}...`, 'error');

        // Future: Log to DB
        // auditService.logAction('SYSTEM_ERROR', 'system', '0', { error: cleanMessage });
    }
}
