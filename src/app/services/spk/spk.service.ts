import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SpkService {
    private apiUrl = `${environment.apiUrl}/spks`;

    constructor(private http: HttpClient) { }

    async getSpks() {
        try {
            const response = await firstValueFrom(this.http.get<any[]>(this.apiUrl));
            return { data: response, error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    }

    async getSpkById(id: number) {
        try {
            const response = await firstValueFrom(this.http.get<any>(`${this.apiUrl}/${id}`));
            return { data: response, error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    }

    async createSpk(data: any) {
        try {
            const response = await firstValueFrom(this.http.post<any>(this.apiUrl, data));
            return { data: response, error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    }

    async updateSpk(id: number, data: any) {
        try {
            const response = await firstValueFrom(this.http.put<any>(`${this.apiUrl}/${id}`, data));
            return { data: response, error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    }

    // Returns raw blob or link
    getSpkDownloadUrl(id: number): string {
        return `${this.apiUrl}/${id}/download`;
    }
}
