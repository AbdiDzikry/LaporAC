import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private apiUrl = `${environment.apiUrl}/app-configs`;

  constructor(private http: HttpClient) { }

  async getConfigs(): Promise<{ data: Record<string, any> | null; error: any }> {
    try {
      const data = await firstValueFrom(this.http.get<Record<string, any>>(this.apiUrl));
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Gagal mengambil konfigurasi' };
    }
  }

  async updateConfigs(configs: Record<string, any>): Promise<{ success: boolean; error: any }> {
    try {
      await firstValueFrom(this.http.post(`${this.apiUrl}/bulk-update`, { configs }));
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message || 'Gagal menyimpan konfigurasi' };
    }
  }

  async testEmail(to: string): Promise<{ success: boolean; message: string }> {
    try {
      const res: any = await firstValueFrom(
        this.http.post(`${this.apiUrl}/test-email`, { to })
      );
      return { success: true, message: res.message || 'Email berhasil dikirim' };
    } catch (error: any) {
      const msg = error?.error?.message || error.message || 'Gagal mengirim email';
      return { success: false, message: msg };
    }
  }
}

