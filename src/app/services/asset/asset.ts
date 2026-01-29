import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase/supabase';

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
  status: 'good' | 'broken' | 'maintenance';
}

@Injectable({
  providedIn: 'root'
})
export class AssetService {

  constructor(private supabase: SupabaseService) { }

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
    return await this.supabase.client
      .from('assets')
      .insert(asset);
  }

  async updateAsset(id: number, asset: Partial<Asset>) {
    return await this.supabase.client
      .from('assets')
      .update(asset)
      .eq('id', id);
  }

  async deleteAsset(id: number) {
    return await this.supabase.client
      .from('assets')
      .delete()
      .eq('id', id);
  }
}
