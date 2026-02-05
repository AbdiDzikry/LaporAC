import { Injectable } from '@angular/core';
import { SupabaseService } from '../supabase/supabase';

export interface AuditLog {
    id?: number;
    user_id?: string;
    action: string;
    target_table: string;
    target_id: string;
    details: any;
    ip_address?: string;
    created_at?: string;

    // Joined
    profiles?: {
        full_name: string;
        email: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class AuditService {

    constructor(private supabase: SupabaseService) { }

    /**
     * Centralized method to log any system action.
     * @param action The action name (e.g. 'LOGIN', 'CREATE_ASSET')
     * @param targetTable The table affected (e.g. 'assets')
     * @param targetId The ID of the affected record
     * @param details Object containing relevant metadata or changes
     */
    async logAction(action: string, targetTable: string, targetId: string | number, details: any = {}) {
        try {
            // We don't need to pass user_id, RLS defaults it to auth.uid()
            // IP address would ideally be captured by an Edge Function, 
            // but we can capture basic client info here if needed.

            const logEntry = {
                action,
                target_table: targetTable,
                target_id: String(targetId),
                details: details,
                user_agent: navigator.userAgent
            };

            const { error } = await this.supabase.client
                .from('audit_logs')
                .insert(logEntry);

            if (error) {
                console.error('Failed to write audit log:', error);
            }
        } catch (e) {
            // Audit logging should essentially be "fire and forget" and not block the main app flow
            console.error('Audit log exception:', e);
        }
    }

    /**
     * Fetch logs for Admin UI
     */
    async getLogs(limit: number = 50) {
        return await this.supabase.client
            .from('audit_logs')
            .select(`
        *,
        profiles (full_name, email)
      `)
            .order('created_at', { ascending: false })
            .limit(limit);
    }
}
