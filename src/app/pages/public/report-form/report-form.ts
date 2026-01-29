import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetService, Asset } from '../../../services/asset/asset';
import { TicketService } from '../../../services/ticket/ticket';
import { EmployeeService } from '../../../services/employee/employee';

@Component({
  selector: 'app-report-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './report-form.html',
  styleUrl: './report-form.css'
})
export class ReportFormComponent implements OnInit {
  reportForm: FormGroup;
  loading = false;
  asset: Asset | null = null;
  sku: string | null = null;
  employeeName: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private assetService: AssetService,
    private ticketService: TicketService,
    private employeeService: EmployeeService
  ) {
    this.reportForm = this.fb.group({
      nik: ['', Validators.required],
      issue_category: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit() {
    // Get SKU from Query Params (e.g. ?sku=SKU123)
    // Or we might iterate to find asset by SKU if we don't have ID directly.
    // For simplicity, let's assume we pass ID in route for now or query param.
    // Based on previous step, we put ID in the QR code deep link? 
    // Wait, the QR code step used "SKU:..." string. 
    // Let's assume the QR code scans to a URL like /report?sku=XYZ

    this.route.queryParams.subscribe(async params => {
      this.sku = params['sku'];
      if (this.sku) {
        this.findAssetBySku(this.sku);
      }
    });
  }

  async findAssetBySku(sku: string) {
    this.loading = true;
    const { data } = await this.assetService.getAssets();
    // Supabase filtering would be better but getAssets gets all for now.
    // Let's refine getAssets in service later to filter.
    // For MVP, client side filter or add method.
    // Adding method in AssetService is cleaner but let's do client side for speed if list is small.
    if (data) {
      const found = (data as Asset[]).find(a => a.sku === sku);
      if (found) this.asset = found;
    }
    this.loading = false;
  }

  async checkNik() {
    const nik = this.reportForm.get('nik')?.value;
    if (!nik) return;

    // Call Employee API
    this.employeeService.getEmployees().subscribe({
      next: (response: any) => {
        // Assuming response is array of employees
        // This is inefficient (fetching all), but depends on API filter cap.
        // The API url was /api/data/company?company=dpm.
        // Let's assume we filter client side for now.
        const employees = response.data || response; // Adjust based on actual API shape
        const found = employees.find((e: any) => e.nik === nik || e.id === nik); // guessed fields
        if (found) {
          this.employeeName = found.name;
        } else {
          this.employeeName = null;
        }
      },
      error: (err: any) => console.error(err)
    });
  }

  async onSubmit() {
    if (this.reportForm.invalid || !this.asset) return;

    this.loading = true;
    try {
      await this.ticketService.createTicket({
        asset_id: this.asset.id!,
        reporter_nik: this.reportForm.value.nik,
        reporter_name: this.employeeName || 'Unknown',
        issue_category: this.reportForm.value.issue_category,
        description: this.reportForm.value.description,
        status: 'open'
      });
      alert('Laporan berhasil dikirim!');
      this.reportForm.reset();
      this.employeeName = null;
    } catch (error) {
      console.error(error);
      alert('Gagal mengirim laporan.');
    } finally {
      this.loading = false;
    }
  }
}
