import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface NewsReport {
    id?: number;
    document_number?: string;
    spk_id: number;
    asset_id: number;
    ticket_id: number;
    title: string;
    description?: string;
    report_date: string;
    completion_date: string;
    total_cost: number;
    is_warranty_claim: boolean;
    work_description?: string;
    parts_replaced?: any[];
    recommendations?: string;
    generated_by: number;
    approved_by?: number;
    vendor_signed_by?: number;
    vendor_signed_at?: string;
    approved_at?: string;
    pdf_path?: string;
    status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
    created_at?: string;
    updated_at?: string;
    spk?: any;
    asset?: any;
    ticket?: any;
    generatedBy?: any;
    approvedBy?: any;
    vendorSignedBy?: any;
}

@Injectable({
    providedIn: 'root'
})
export class NewsReportService {
    private apiUrl = `${environment.apiUrl}/news-reports`;

    constructor(private http: HttpClient) { }

    /**
     * Get all news reports
     */
    async getNewsReports(params?: { status?: string; spk_id?: number; asset_id?: number; is_warranty_claim?: boolean }): Promise<{ data: NewsReport[] | null; error: any }> {
        try {
            let url = this.apiUrl;
            if (params) {
                const queryParams = new URLSearchParams();
                if (params.status) queryParams.append('status', params.status);
                if (params.spk_id) queryParams.append('spk_id', params.spk_id.toString());
                if (params.asset_id) queryParams.append('asset_id', params.asset_id.toString());
                if (params.is_warranty_claim !== undefined) queryParams.append('is_warranty_claim', params.is_warranty_claim.toString());
                
                const queryString = queryParams.toString();
                if (queryString) {
                    url += '?' + queryString;
                }
            }
            
            const data = await firstValueFrom(this.http.get<NewsReport[]>(url));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: error.message || 'Gagal mengambil berita acara' };
        }
    }

    /**
     * Get news report by ID
     */
    async getNewsReportById(id: number): Promise<{ data: NewsReport | null; error: any }> {
        try {
            const data = await firstValueFrom(this.http.get<NewsReport>(`${this.apiUrl}/${id}`));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: error.message || 'Gagal mengambil detail berita acara' };
        }
    }

    /**
     * Create news report from SPK
     */
    async createNewsReport(newsReport: Partial<NewsReport>): Promise<{ data: NewsReport | null; error: any }> {
        try {
            const data = await firstValueFrom(this.http.post<NewsReport>(this.apiUrl, newsReport));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: error.message || 'Gagal membuat berita acara' };
        }
    }

    /**
     * Update news report
     */
    async updateNewsReport(id: number, newsReport: Partial<NewsReport>): Promise<{ data: NewsReport | null; error: any }> {
        try {
            const data = await firstValueFrom(this.http.put<NewsReport>(`${this.apiUrl}/${id}`, newsReport));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: error.message || 'Gagal update berita acara' };
        }
    }

    /**
     * Approve news report
     */
    async approveNewsReport(id: number): Promise<{ data: NewsReport | null; error: any }> {
        try {
            const data = await firstValueFrom(this.http.post<NewsReport>(`${this.apiUrl}/${id}/approve`, {}));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: error.message || 'Gagal approve berita acara' };
        }
    }

    /**
     * Reject news report
     */
    async rejectNewsReport(id: number, reason: string): Promise<{ data: NewsReport | null; error: any }> {
        try {
            const data = await firstValueFrom(this.http.post<NewsReport>(`${this.apiUrl}/${id}/reject`, { rejection_reason: reason }));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: error.message || 'Gagal reject berita acara' };
        }
    }

    /**
     * Sign news report as vendor
     */
    async vendorSign(id: number): Promise<{ data: NewsReport | null; error: any }> {
        try {
            const data = await firstValueFrom(this.http.post<NewsReport>(`${this.apiUrl}/${id}/vendor-sign`, {}));
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: error.message || 'Gagal tanda tangan berita acara' };
        }
    }

    /**
     * Download PDF
     */
    async downloadPdf(id: number): Promise<void> {
        try {
            const response = await firstValueFrom(
                this.http.get(`${this.apiUrl}/${id}/download`, { responseType: 'blob' })
            );

            const blob = new Blob([response], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const tempLink = document.createElement('a');
            tempLink.href = url;
            tempLink.setAttribute('download', `BA_${id}.pdf`);
            document.body.appendChild(tempLink);
            tempLink.click();

            document.body.removeChild(tempLink);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error('Error downloading PDF', error);
            throw error;
        }
    }

    /**
     * Delete news report
     */
    async deleteNewsReport(id: number): Promise<{ success: boolean; error: any }> {
        try {
            await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
            return { success: true, error: null };
        } catch (error: any) {
            return { success: false, error: error.message || 'Gagal hapus berita acara' };
        }
    }
}
