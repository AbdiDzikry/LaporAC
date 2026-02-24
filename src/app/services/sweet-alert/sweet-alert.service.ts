import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
    providedIn: 'root'
})
export class SweetAlertService {

    constructor() { }

    /**
     * Show a simple success notification
     */
    success(title: string, text: string = '') {
        return Swal.fire({
            icon: 'success',
            title: title,
            text: text,
            confirmButtonColor: '#10B981', // green-500
            timer: 2000,
            timerProgressBar: true
        });
    }

    /**
     * Show an error notification
     */
    error(title: string, text: string = '') {
        return Swal.fire({
            icon: 'error',
            title: title,
            text: text,
            confirmButtonColor: '#EF4444' // red-500
        });
    }

    /**
     * Show a confirmation dialog.
     * Returns true if confirmed, false otherwise.
     */
    async confirm(title: string, text: string, confirmButtonText: string = 'Ya, Lanjutkan', cancelButtonText: string = 'Batal'): Promise<boolean> {
        const result = await Swal.fire({
            title: title,
            text: text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3B82F6', // blue-500
            cancelButtonColor: '#9CA3AF', // gray-400
            confirmButtonText: confirmButtonText,
            cancelButtonText: cancelButtonText,
            reverseButtons: true
        });

        return result.isConfirmed;
    }

    /**
     * Show a warning notification
     */
    warning(title: string, text: string = '') {
        return Swal.fire({
            icon: 'warning',
            title: title,
            text: text,
            confirmButtonColor: '#F59E0B' // amber-500
        });
    }

    /**
     * Show info notification
     */
    info(title: string, text: string = '') {
        return Swal.fire({
            icon: 'info',
            title: title,
            text: text,
            confirmButtonColor: '#3B82F6' // blue-500
        });
    }
}
