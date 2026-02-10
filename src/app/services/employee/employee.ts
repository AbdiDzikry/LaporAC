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

  async getEmployeeByNik(nik: string): Promise<Employee | null> {
    try {
      const headers = new HttpHeaders({
        'x-api-key': this.apiKey
      });

      const response: any = await this.http.get(this.apiUrl, { headers }).toPromise();
      const employees = response.data || response; // Adjust based on actual API response structure
      
      if (Array.isArray(employees)) {
        const employee = employees.find((emp: any) => emp.nik === nik || emp.id === nik);
        return employee ? { nik: employee.nik || employee.id, name: employee.name, department: employee.department || '' } : null;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching employee by NIK:', error);
      throw error;
    }
  }
}
