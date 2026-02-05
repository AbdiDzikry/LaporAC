import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Employee {
  nik: string;
  name: string;
  department: string;
  // Add other fields as needed based on API response
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = '/api/data/company?company=dpm';
  // Note: 'x-api-key ' has a trailing space in the requirement. We'll use it as is, or fallback to standard if needed.
  private apiKey = 'eyJjb21wYW55IjoiQUJDIiwidGltZSI6MT';

  constructor(private http: HttpClient) { }

  getEmployees(): Observable<any> {
    const headers = new HttpHeaders({
      'x-api-key': this.apiKey
    });

    return this.http.get(this.apiUrl, { headers });
  }
}
