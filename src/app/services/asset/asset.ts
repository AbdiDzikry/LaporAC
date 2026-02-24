import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuditService } from '../audit/audit';
import { ErrorHandlerService } from '../error-handler/error-handler.service';

export interface Asset {
  id?: number;
  created_at?: string;
  sku: string;
  name: string;
  brand: string;
  category?: string;
  location: string;
  pk: string;
  purchase_date?: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string; // Next scheduled maintenance date (YYYY-MM-DD)
  status: 'good' | 'broken' | 'maintenance' | 'active' | string;

  // Lifecycle Financials
  purchase_price?: number;
  warranty_expiry_date?: string;
  vendor_name?: string;
  useful_life_years?: number; // Default 5
  residual_value?: number; // Scrap value
  is_active?: boolean; // False if disposed

  maintenance_interval_days?: number;
}

export interface AssetDisposal {
  id?: number;
  asset_id: number;
  disposal_date: string;
  disposal_type: 'sold' | 'scrapped' | 'lost' | 'donated';
  sale_price: number;
  notes?: string;
  authorized_by?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  private apiUrl = `${environment.apiUrl}/assets`;

  constructor(
    private http: HttpClient,
    private audit: AuditService,
    private errorHandler: ErrorHandlerService
  ) { }

  async getAssets() {
    try {
      const data = await firstValueFrom(this.http.get<Asset[]>(this.apiUrl));
      return { data, error: null };
    } catch (error: any) {
      this.errorHandler.handleError(error, 'Gagal mengambil daftar aset');
      return { data: null, error };
    }
  }

  async getAssetById(id: number) {
    try {
      const data = await firstValueFrom(this.http.get<Asset>(`${this.apiUrl}/${id}`));
      return { data, error: null };
    } catch (error: any) {
      this.errorHandler.handleError(error, 'Gagal mengambil detail aset');
      return { data: null, error };
    }
  }

  async createAsset(asset: Asset) {
    try {
      const data = await firstValueFrom(this.http.post<Asset>(this.apiUrl, asset));

      if (data && data.id) {
        try {
          await this.audit.logAction('ASSET_CREATED', 'assets', data.id, { sku: asset.sku, name: asset.name });
        } catch (e) { }
      }

      return { data, error: null };
    } catch (error: any) {
      this.errorHandler.handleError(error, 'Gagal membuat aset baru');
      return { data: null, error };
    }
  }

  async updateAsset(id: number, asset: Partial<Asset>) {
    try {
      const data = await firstValueFrom(this.http.put<Asset>(`${this.apiUrl}/${id}`, asset));

      if (data) {
        try {
          await this.audit.logAction('ASSET_UPDATED', 'assets', id, { changes: asset });
        } catch (e) { }
      }

      return { data, error: null };
    } catch (error: any) {
      this.errorHandler.handleError(error, 'Gagal memperbarui aset');
      return { data: null, error };
    }
  }

  async deleteAsset(id: number) {
    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));

      try {
        await this.audit.logAction('ASSET_DELETED', 'assets', id, { hard_delete: true });
      } catch (e) { }

      return { data: true, error: null };
    } catch (error: any) {
      this.errorHandler.handleError(error, 'Gagal menghapus aset');
      return { data: null, error };
    }
  }

  // --- Lifecycle Methods ---

  calculateBookValue(asset: Asset): number {
    if (!asset.purchase_price || !asset.purchase_date) return 0;

    const purchaseDate = new Date(asset.purchase_date);
    const now = new Date();

    const diffTime = Math.abs(now.getTime() - purchaseDate.getTime());
    const yearsUsed = diffTime / (1000 * 60 * 60 * 24 * 365.25);

    const cost = asset.purchase_price;
    const residual = asset.residual_value || 0;
    const usefulLife = asset.useful_life_years || 5;

    if (yearsUsed >= usefulLife) return residual;

    const depreciableAmount = cost - residual;
    const annualDepreciation = depreciableAmount / usefulLife;
    const accumulatedDepreciation = annualDepreciation * yearsUsed;

    return Math.max(cost - accumulatedDepreciation, residual);
  }

  async disposeAsset(disposal: AssetDisposal) {
    try {
      // For now, since we don't have a dedicated disposal API yet, we just update the asset status
      const response = await this.updateAsset(disposal.asset_id, {
        is_active: false,
        status: 'broken' // marked as not active
      });

      if (!response.error) {
        try {
          await this.audit.logAction('ASSET_DISPOSED', 'assets', disposal.asset_id, { type: disposal.disposal_type, price: disposal.sale_price });
        } catch (e) { }
      }

      return response;
    } catch (error: any) {
      this.errorHandler.handleError(error, 'Gagal membuang aset');
      return { data: null, error };
    }
  }
}
