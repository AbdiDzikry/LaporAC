import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetService, Asset } from '../../../services/asset/asset';
import { TicketService } from '../../../services/ticket/ticket';
import { EmployeeService } from '../../../services/employee/employee';
import { ToastService } from '../../../services/toast/toast';
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

  // WIZARD STATE
  currentStep = 1;
  totalSteps = 5;

  categories = [
    { value: 'panas', label: 'AC Tidak Dingin', icon: '❄️', desc: 'Suhu ruangan tetap panas' },
    { value: 'bocor', label: 'Bocor Air', icon: '💧', desc: 'Air menetes dari unit indoor' },
    { value: 'berisik', label: 'Suara Berisik', icon: '🔊', desc: 'Ada bunyi aneh dari unit' },
    { value: 'mati', label: 'Mati Total', icon: '🔌', desc: 'Unit tidak mau menyala' },
    { value: 'bau', label: 'Bau Tidak Sedap', icon: '👃', desc: 'Udara yang keluar berbau' },
    { value: 'lainnya', label: 'Lainnya', icon: '🔧', desc: 'Masalah lain yang tidak tercantum' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private assetService: AssetService,
    private ticketService: TicketService,
    private employeeService: EmployeeService,
    private toast: ToastService,
    private loadingService: LoadingService
  ) {
    this.reportForm = this.fb.group({
      nik: ['', [Validators.required, Validators.minLength(3)]],
      issue_category: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      this.sku = params['sku'];
      if (this.sku) {
        this.findAssetBySku(this.sku);
      }
    });

    this.reportForm.get('nik')?.valueChanges.subscribe(value => {
      if (value && value.length >= 3) {
        this.checkNik();
      } else {
        this.employeeName = null;
      }
    });
  }

  // --- WIZARD NAVIGATION ---

  nextStep() {
    if (this.currentStep === 1) {
      // Step 1 Validation: NIK only (validation lookup is now optional)
      if (this.reportForm.get('nik')?.invalid) {
        this.toast.show('Mohon isi NIK Anda.', 'warning');
        this.reportForm.get('nik')?.markAsTouched();
        return;
      }
      // If employeeName is still null after typing, fallback to a generic name
      if (!this.employeeName) {
        this.employeeName = 'Karyawan (Umum)';
      }
    } else if (this.currentStep === 2) {
      // Step 2 Validation: Asset Selected
      if (!this.asset) {
        this.toast.show('Mohon scan QR atau pilih aset terlebih dahulu.', 'warning');
        return;
      }
    } else if (this.currentStep === 3) {
      // Step 3 Validation: Category Selected
      if (this.reportForm.get('issue_category')?.invalid) {
        this.toast.show('Mohon pilih kategori masalah.', 'warning');
        return;
      }
    }

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      window.scrollTo(0, 0);
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo(0, 0);
    }
  }

  selectCategory(value: string) {
    this.reportForm.patchValue({ issue_category: value });
    this.nextStep(); // Auto advance after selection
  }

  get selectedCategoryLabel() {
    const val = this.reportForm.get('issue_category')?.value;
    return this.categories.find(c => c.value === val)?.label || 'Tidak ada kategori';
  }

  // --- EXISTING LOGIC ---

  async findAssetBySku(sku: string) {
    this.loadingService.show();
    try {
      const { data } = await this.assetService.getAssets();
      if (data) {
        const found = (data as Asset[]).find(a => a.sku === sku);
        if (found) {
          this.asset = found;
          // If we are in Step 2 (Asset Selection), valid finding auto-advances
          if (this.currentStep === 2) {
            // Optional: Auto advance? Maybe wait for user confirmation
          }
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
      const response = await this.employeeService.getEmployeeByNik(nik);
      if (response && response.name) {
        this.employeeName = response.name;
      } else {
        // Fallback for temporary unvalidated usage
        this.employeeName = 'Karyawan (Umum)';
      }
    } catch (error) {
      console.error('Error checking NIK:', error);
      this.employeeName = 'Karyawan (Umum)';
    } finally {
      this.checkingNik = false;
    }
  }

  async onSubmit() {
    if (this.reportForm.invalid || !this.asset) {
      this.toast.show('Mohon lengkapi data laporan.', 'error');
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

      // Success State - Maybe go to a "Conclusion" step or just reset
      this.toast.show('Laporan berhasil dikirim!', 'success');

      // Reset logic
      this.currentStep = 1;
      this.reportForm.reset();
      this.employeeName = null;
      this.asset = null;
      this.sku = null;
      this.router.navigate(['/report']); // Clear query params if any

    } catch (error) {
      console.error('Error submitting ticket:', error);
      this.toast.show('Gagal mengirim laporan. Silakan coba lagi.', 'error');
    } finally {
      this.loadingService.hide();
    }
  }
}

