import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface SpkItem {
  id?: number;
  spk_id?: number;
  pricelist_item_id?: number | null;
  item_name: string;
  qty: number;
  price_per_item: number;
  total_price?: number;
  pricelistItem?: any;
}

export interface Spk {
  id?: number;
  spk_number?: string;
  ticket_id: number;
  vendor_id: number;
  status: string;
  is_warranty_claim: boolean;
  total_cost?: number;
  completion_notes?: string;
  photos?: string[];
  vendor?: any;
  ticket?: any;
  items?: SpkItem[];
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SpkService {
  private apiUrl = `${environment.apiUrl}/spks`;

  constructor(private http: HttpClient) { }

  async getSpks(): Promise<{ data: Spk[] | null; error: any }> {
    try {
      const data = await firstValueFrom(this.http.get<Spk[]>(this.apiUrl));
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Gagal mengambil SPK' };
    }
  }

  async createSpk(spkData: Partial<Spk>): Promise<{ data: Spk | null; error: any }> {
    try {
      const data = await firstValueFrom(this.http.post<Spk>(this.apiUrl, spkData));
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Gagal membuat SPK' };
    }
  }

  async getSpkById(id: number): Promise<{ data: Spk | null; error: any }> {
    try {
      const data = await firstValueFrom(this.http.get<Spk>(`${this.apiUrl}/${id}`));
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Gagal mengambil detail SPK' };
    }
  }

  async downloadSpkPdf(id: number): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get(`${this.apiUrl}/${id}/download`, { responseType: 'blob' })
      );

      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = url;
      tempLink.setAttribute('download', `SPK_Report_${id}.pdf`);
      document.body.appendChild(tempLink);
      tempLink.click();

      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error downloading PDF', error);
      throw error;
    }
  }

  async updateSpk(id: number, spkData: Partial<Spk>): Promise<{ data: Spk | null; error: any }> {
    try {
      const data = await firstValueFrom(this.http.put<Spk>(`${this.apiUrl}/${id}`, spkData));
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Gagal memperbarui SPK' };
    }
  }

  async deleteSpk(id: number): Promise<{ success: boolean; error: any }> {
    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message || 'Gagal menghapus SPK' };
    }
  }
}
