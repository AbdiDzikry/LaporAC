import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  public supabase: SupabaseClient;

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
    if (!user.data.user || !user.data.user.id) return null;

    const userId = user.data.user.id.trim();
    console.log('Fetching profile for ID:', userId); // Debug log

    return await this.client
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
  }

  get session() {
    return this.client.auth.getSession();
  }

  get client() {
    return this.supabase;
  }
}
