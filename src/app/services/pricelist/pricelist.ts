import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface PricelistItem {
  id?: number;
  vendor_id?: number;
  category?: string;
  name: string;
  unit?: string;
  type: 'jasa' | 'sparepart';
  old_price?: number;
  price: number;
  image_path?: string;
  created_at?: string;
  updated_at?: string;
  vendor?: any;
}

export interface PricelistLog {
  id: number;
  pricelist_item_id: number;
  user_id: number;
  action: string;
  old_price?: number;
  new_price?: number;
  created_at: string;
  user?: any;
}

@Injectable({
  providedIn: 'root'
})
export class PricelistService {
  private apiUrl = `${environment.apiUrl}/pricelists`;

  constructor(private http: HttpClient) { }

  async getItems(): Promise<{ data: PricelistItem[] | null; error: any }> {
    try {
      const data = await firstValueFrom(this.http.get<PricelistItem[]>(this.apiUrl));
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Gagal mengambil pricelist' };
    }
  }

  async createItem(item: PricelistItem | FormData): Promise<{ data: PricelistItem | null; error: any }> {
    try {
      const data = await firstValueFrom(this.http.post<PricelistItem>(this.apiUrl, item));
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Gagal menambah item' };
    }
  }

  async updateItem(id: number, item: Partial<PricelistItem> | FormData): Promise<{ data: PricelistItem | null; error: any }> {
    try {
      if (item instanceof FormData) {
        item.append('_method', 'PUT');
        const data = await firstValueFrom(this.http.post<PricelistItem>(`${this.apiUrl}/${id}`, item));
        return { data, error: null };
      } else {
        const data = await firstValueFrom(this.http.put<PricelistItem>(`${this.apiUrl}/${id}`, item));
        return { data, error: null };
      }
    } catch (error: any) {
      return { data: null, error: error.message || 'Gagal update item' };
    }
  }

  async deleteItem(id: number): Promise<{ success: boolean; error: any }> {
    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message || 'Gagal hapus item' };
    }
  }

  async getLogs(id: number): Promise<{ data: PricelistLog[] | null; error: any }> {
    try {
      const data = await firstValueFrom(this.http.get<PricelistLog[]>(`${this.apiUrl}/${id}/logs`));
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Gagal mengambil riwayat harga' };
    }
  }
}
