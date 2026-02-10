import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetService, Asset } from '../../../services/asset/asset';
import { TicketService } from '../../../services/ticket/ticket';
import { EmployeeService } from '../../../services/employee/employee';
import { ToastService } from '../../../services/toast/toast'; // Import
import { LoadingService } from '../../../services/loading/loading.service';

@Component({
  selector: 'app-report-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './report-form.html',
  styleUrl: './report-form.css'
})
export class ReportFormComponent implements OnInit {
  reportForm: FormGroup;
  asset: Asset | null = null;
  sku: string | null = null;
  employeeName: string | null = null;
  checkingNik = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private assetService: AssetService,
    private ticketService: TicketService,
    private employeeService: EmployeeService,
    private toast: ToastService, // Inject
    private loadingService: LoadingService
  ) {
    this.reportForm = this.fb.group({
      nik: ['', [Validators.required, Validators.minLength(3)]],
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

    // Subscribe to NIK changes to automatically check employee info
    this.reportForm.get('nik')?.valueChanges.subscribe(value => {
      if (value && value.length >= 3) {
        this.checkNik();
      } else {
        this.employeeName = null;
      }
    });
  }

  async findAssetBySku(sku: string) {
    this.loadingService.show();
    try {
      const { data } = await this.assetService.getAssets();
      // Supabase filtering would be better but getAssets gets all for now.
      // Let's refine getAssets in service later to filter.
      // For MVP, client side filter or add method.
      // Adding method in AssetService is cleaner but let's do client side for speed if list is small.
      if (data) {
        const found = (data as Asset[]).find(a => a.sku === sku);
        if (found) {
          this.asset = found;
        } else {
          this.toast.show('Asset tidak ditemukan dengan SKU tersebut.', 'error');
        }
      }
    } catch (error) {
      console.error('Error finding asset:', error);
      this.toast.show('Gagal mencari asset.', 'error');
    } finally {
      this.loadingService.hide();
    }
  }

  async checkNik() {
    const nik = this.reportForm.get('nik')?.value;
    if (!nik || nik.length < 3 || this.checkingNik) return;

    this.checkingNik = true;
    try {
      // Call Employee API
      const response = await this.employeeService.getEmployeeByNik(nik);
      if (response && response.name) {
        this.employeeName = response.name;
        this.toast.show(`Nama karyawan ditemukan: ${this.employeeName}`, 'success');
      } else {
        this.employeeName = null;
        this.toast.show('NIK tidak ditemukan dalam sistem.', 'warning');
      }
    } catch (error) {
      console.error('Error checking NIK:', error);
      this.employeeName = null;
      this.toast.show('Gagal memverifikasi NIK.', 'error');
    } finally {
      this.checkingNik = false;
    }
  }

  async onSubmit() {
    if (this.reportForm.invalid || !this.asset) {
      if (!this.asset) {
        this.toast.show('Asset belum ditemukan.', 'error');
      }
      return;
    }

    this.loadingService.show();
    try {
      await this.ticketService.createTicket({
        asset_id: this.asset.id!,
        reporter_nik: this.reportForm.value.nik,
        reporter_name: this.employeeName || 'Pelapor Tidak Dikenal',
        issue_category: this.reportForm.value.issue_category,
        description: this.reportForm.value.description,
        status: 'pending_validation'
      });
      this.toast.show('Laporan berhasil dikirim dan menunggu validasi!', 'success');
      this.reportForm.reset();
      this.employeeName = null;
      this.asset = null; // Reset asset so user needs to scan again
    } catch (error) {
      console.error('Error submitting ticket:', error);
      this.toast.show('Gagal mengirim laporan. Silakan coba lagi.', 'error');
    } finally {
      this.loadingService.hide();
    }
  }
}
