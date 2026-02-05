import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private toastsSubject = new BehaviorSubject<Toast[]>([]);
    public toasts$ = this.toastsSubject.asObservable();
    private counter = 0;

    constructor() { }

    show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
        const id = this.counter++;
        const newToast: Toast = { id, message, type };

        // Add to stack
        const currentToast = this.toastsSubject.value;
        this.toastsSubject.next([...currentToast, newToast]);

        // Auto dismiss
        setTimeout(() => {
            this.remove(id);
        }, 3000);
    }

    remove(id: number) {
        const currentToast = this.toastsSubject.value;
        this.toastsSubject.next(currentToast.filter(t => t.id !== id));
    }
}
