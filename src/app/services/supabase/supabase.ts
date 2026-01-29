import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'lapor-ac-auth-v5' // Updated key
      }
    });
  }

  async getProfile() {
    const user = await this.client.auth.getUser();
    if (!user.data.user) return null;

    return await this.client
      .from('profiles')
      .select('role')
      .eq('id', user.data.user.id)
      .single();
  }

  get session() {
    return this.client.auth.getSession();
  }

  get client() {
    return this.supabase;
  }
}
