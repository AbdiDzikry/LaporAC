import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase/supabase';
import { AuditService } from '../audit/audit'; // Import

export interface Asset {
  id?: number;
  created_at?: string;
  sku: string;
  name: string;
  brand: string;
  location: string;
  pk: string;
  purchase_date?: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string; // Next scheduled maintenance date (YYYY-MM-DD)
  status: 'good' | 'broken' | 'maintenance';

  // Lifecycle Financials
  purchase_price?: number;
  warranty_expiry_date?: string;
  vendor_name?: string;
  useful_life_years?: number; // Default 5
  residual_value?: number; // Scrap value
  is_active?: boolean; // False if disposed
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

  constructor(
    private supabase: SupabaseService,
    private audit: AuditService // Inject
  ) { }

  async getAssets() {
    return await this.supabase.client
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });
  }

  async getAssetById(id: number) {
    return await this.supabase.client
      .from('assets')
      .select('*')
      .eq('id', id)
      .single();
  }

  async createAsset(asset: Asset) {
    const response = await this.supabase.client
      .from('assets')
      .insert(asset)
      .select()
      .single();

    if (!response.error && response.data) {
      await this.audit.logAction('ASSET_CREATED', 'assets', response.data.id, { sku: asset.sku, name: asset.name });
    }
    return response;
  }

  async updateAsset(id: number, asset: Partial<Asset>) {
    const response = await this.supabase.client
      .from('assets')
      .update(asset)
      .eq('id', id);

    if (!response.error) {
      await this.audit.logAction('ASSET_UPDATED', 'assets', id, { changes: asset });
    }
    return response;
  }

  async deleteAsset(id: number) {
    // Soft delete preferred for lifecycle, but if hard delete requested:
    const response = await this.supabase.client
      .from('assets')
      .delete()
      .eq('id', id);

    if (!response.error) {
      await this.audit.logAction('ASSET_DELETED', 'assets', id, { hard_delete: true });
    }
    return response;
  }

  // --- Lifecycle Methods ---

  /**
   * Calculate Book Value using Straight-Line Depreciation
   * Formula: Cost - ((Cost - Residual) / UsefulLife * YearsUsed)
   */
  calculateBookValue(asset: Asset): number {
    if (!asset.purchase_price || !asset.purchase_date) return 0;

    const purchaseDate = new Date(asset.purchase_date);
    const now = new Date();

    // Calculate years passed (fractional)
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
    // 1. Create disposal record
    const { error: disposalError } = await this.supabase.client
      .from('asset_disposals')
      .insert(disposal);

    if (disposalError) throw disposalError;

    // 2. Mark asset as inactive
    const response = await this.updateAsset(disposal.asset_id, {
      is_active: false,
      status: 'broken' // or a new status 'disposed' if enum allowed
    });

    if (!response.error) {
      await this.audit.logAction('ASSET_DISPOSED', 'assets', disposal.asset_id, { type: disposal.disposal_type, price: disposal.sale_price });
    }

    return response;
  }
}
