import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VendorService, VendorProfile } from '../../../../services/vendor/vendor.service';
import { SweetAlertService } from '../../../../services/sweet-alert/sweet-alert.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-vendor-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './vendor-form.html',
  styleUrl: './vendor-form.css'
})
export class VendorFormComponent implements OnInit {
  vendorForm: FormGroup;
  isEditMode = false;
  loading = false;
  vendorId: number | null = null;
  specialties: string[] = [];
  newSpecialty = '';
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private vendorService: VendorService,
    private sweetAlert: SweetAlertService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.vendorForm = this.createForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.vendorId = parseInt(id, 10);

      // Remove required validator for password in edit mode
      this.vendorForm.get('password')?.clearValidators();
      this.vendorForm.get('password')?.setValidators([Validators.minLength(8)]);
      this.vendorForm.get('password')?.updateValueAndValidity();

      this.loadVendor(this.vendorId);
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      nik: [''],
      company_name: [''],
      company_address: [''],
      npwp: [''],
      status: ['active'],
      phone: [''],
      vendor_email: [''],
      bank_name: [''],
      bank_account: [''],
      account_holder: [''],
      notes: ['']
    });
  }

  async loadVendor(id: number) {
    this.loading = true;
    const { data, error } = await this.vendorService.getVendorById(id);
    this.loading = false;

    if (error) {
      this.sweetAlert.error('Gagal', 'Gagal memuat data vendor: ' + error);
      return;
    }

    if (data) {
      this.vendorForm.patchValue({
        name: data.user?.name || '',
        email: data.user?.email || '',
        nik: data.user?.nik || '',
        company_name: data.company_name || '',
        company_address: data.company_address || '',
        npwp: data.npwp || '',
        status: data.status || 'active',
        phone: data.phone || '',
        vendor_email: data.email || '',
        bank_name: data.bank_name || '',
        bank_account: data.bank_account || '',
        account_holder: data.account_holder || '',
        notes: data.notes || ''
      });

      this.specialties = data.specialties || [];
    }
  }

  addSpecialty() {
    if (this.newSpecialty.trim()) {
      this.specialties.push(this.newSpecialty.trim());
      this.newSpecialty = '';
    }
  }

  removeSpecialty(specialty: string) {
    this.specialties = this.specialties.filter(s => s !== specialty);
  }

  async onSubmit() {
    if (this.vendorForm.invalid) {
      this.vendorForm.markAllAsTouched();
      this.sweetAlert.warning('Perhatian', 'Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    const confirmed = await this.sweetAlert.confirm(
      'Konfirmasi',
      `Apakah Anda yakin ingin ${this.isEditMode ? 'mengupdate' : 'menambah'} vendor ini?`
    );

    if (!confirmed) return;

    this.loading = true;

    try {
      const formValue = this.vendorForm.value;
      const vendorData: Partial<VendorProfile> & { name: string; email: string; password?: string } = {
        name: formValue.name,
        email: formValue.email,
        company_name: formValue.company_name,
        company_address: formValue.company_address,
        phone: formValue.phone,
        npwp: formValue.npwp,
        bank_name: formValue.bank_name,
        bank_account: formValue.bank_account,
        account_holder: formValue.account_holder,
        specialties: this.specialties,
        notes: formValue.notes,
        status: formValue.status
      };

      // Add vendor email if different from login email (for both create and update)
      if (formValue.vendor_email) {
        (vendorData as any).vendor_email = formValue.vendor_email;
      }

      // Add password conditionally
      if (formValue.password) {
        vendorData.password = formValue.password;
      }

      let result;
      if (this.isEditMode && this.vendorId) {
        result = await this.vendorService.updateVendor(this.vendorId, vendorData);
      } else {
        result = await this.vendorService.createVendor(vendorData as any);
      }

      if (result.error) {
        throw new Error(result.error);
      }

      this.sweetAlert.success(
        'Berhasil',
        `Vendor berhasil ${this.isEditMode ? 'diupdate' : 'ditambahkan'}`
      );
      this.goBack();
    } catch (error: any) {
      this.sweetAlert.error('Gagal', error.message || 'Terjadi kesalahan');
    } finally {
      this.loading = false;
    }
  }

  goBack() {
    this.location.back();
  }
}
