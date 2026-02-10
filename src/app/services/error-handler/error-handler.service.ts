import { Injectable } from '@angular/core';
import { ToastService } from './toast/toast';

export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  constructor(private toastService: ToastService) {}

  handleError(error: any, customMessage?: string): ApiError {
    console.error('Error occurred:', error);

    let apiError: ApiError;

    if (error.status) {
      // HTTP error
      switch (error.status) {
        case 400:
          apiError = {
            status: 400,
            message: customMessage || 'Permintaan tidak valid. Silakan periksa kembali data yang dimasukkan.'
          };
          break;
        case 401:
          apiError = {
            status: 401,
            message: customMessage || 'Sesi telah habis. Silakan login kembali.'
          };
          break;
        case 403:
          apiError = {
            status: 403,
            message: customMessage || 'Akses ditolak. Anda tidak memiliki izin untuk melakukan tindakan ini.'
          };
          break;
        case 404:
          apiError = {
            status: 404,
            message: customMessage || 'Data tidak ditemukan.'
          };
          break;
        case 500:
          apiError = {
            status: 500,
            message: customMessage || 'Terjadi kesalahan pada server. Silakan coba lagi nanti.'
          };
          break;
        default:
          apiError = {
            status: error.status,
            message: customMessage || `Terjadi kesalahan (${error.status}). Silakan coba lagi.`
          };
      }
    } else if (error.error?.message) {
      // Supabase or API error
      apiError = {
        status: 0,
        message: error.error.message
      };
    } else {
      // Network or other error
      apiError = {
        status: 0,
        message: customMessage || 'Terjadi kesalahan jaringan. Pastikan koneksi internet Anda stabil.'
      };
    }

    // Show toast notification
    this.toastService.show(apiError.message, 'error');

    return apiError;
  }

  handleValidationErrors(errors: { [key: string]: string[] }): string[] {
    const errorMessages: string[] = [];
    
    Object.keys(errors).forEach(key => {
      errorMessages.push(...errors[key]);
    });

    return errorMessages;
  }

  showSuccess(message: string): void {
    this.toastService.show(message, 'success');
  }

  showInfo(message: string): void {
    this.toastService.show(message, 'info');
  }

  showWarning(message: string): void {
    this.toastService.show(message, 'warning');
  }
}