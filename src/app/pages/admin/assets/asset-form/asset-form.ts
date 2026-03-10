import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AssetService } from '../../../../services/asset/asset';
import { TicketService } from '../../../../services/ticket/ticket';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-asset-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule
  ],
  templateUrl: './asset-form.html',
  styleUrl: './asset-form.css'
})
export class AssetFormComponent implements OnInit {
  assetForm: FormGroup;
  isEditMode = false;
  assetId: number | null = null;
  loading = false;
  maintenanceDays: number[] = Array.from({ length: 31 }, (_, i) => i + 1); // 1-31

  ticketHistory: any[] = [];
  isLoadingHistory = false;

  constructor(
    private fb: FormBuilder,
    private assetService: AssetService,
    private ticketService: TicketService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.assetForm = this.fb.group({
      sku: ['', Validators.required],
      brand: ['-'], // Merk AC
      category: ['', Validators.required], // Jenis AC (SPLITE, CASSET, etc)
      location: ['', Validators.required],
      pk: ['', Validators.required],
      status: ['good', Validators.required],
      purchase_date: [''], // NEW FIELD

      // Lifecycle Fields
      vendor_name: ['']
    });
  }

  ngOnInit() {
    this.assetId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.assetId) {
      this.isEditMode = true;
      this.loadAsset(this.assetId);
    }
  }

  async loadAsset(id: number) {
    this.loading = true;
    const { data, error } = await this.assetService.getAssetById(id);
    if (data) {
      // Format purchase_date for HTML date input (YYYY-MM-DD)
      let formattedDate = '';
      if (data.purchase_date) {
        const d = new Date(data.purchase_date);
        formattedDate = d.toISOString().split('T')[0];
      }

      this.assetForm.patchValue({
        ...data,
        purchase_date: formattedDate
      });
    }
    this.loading = false;

    // Fetch History
    this.loadHistory(id);
  }

  async loadHistory(id: number) {
    this.isLoadingHistory = true;
    const { data } = await this.ticketService.getTickets({ asset_id: id });
    if (data) {
      this.ticketHistory = data;
    }
    this.isLoadingHistory = false;
  }

  async onSubmit() {
    if (this.assetForm.invalid) return;

    this.loading = true;
    try {
      const formVal = { ...this.assetForm.value };
      if (!formVal.brand) formVal.brand = '-';

      // Auto-generate absolute name: "AC [Jenis] [PK] [Brand] [Location] - [SKU]"
      formVal.name = `AC ${formVal.category || ''} ${formVal.pk || ''} ${formVal.brand === '-' ? '' : formVal.brand} ${formVal.location || ''} - ${formVal.sku || ''}`.replace(/\s+/g, ' ').trim();

      if (this.isEditMode && this.assetId) {
        await this.assetService.updateAsset(this.assetId, formVal);
      } else {
        await this.assetService.createAsset(formVal);
      }
      this.router.navigate(['/admin/assets']);
    } catch (error) {
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  getAssetAge(): string {
    const purchaseDateVal = this.assetForm.get('purchase_date')?.value;
    if (!purchaseDateVal) return '-';

    const purchaseDate = new Date(purchaseDateVal);
    const now = new Date();

    if (purchaseDate > now) return 'Baru';

    let years = now.getFullYear() - purchaseDate.getFullYear();
    let months = now.getMonth() - purchaseDate.getMonth();

    if (months < 0 || (months === 0 && now.getDate() < purchaseDate.getDate())) {
      years--;
      months += 12;
    }

    if (years > 0) {
      return `${years} Tahun${months > 0 ? ` ${months} Bulan` : ''}`;
    } else if (months > 0) {
      return `${months} Bulan`;
    } else {
      return 'Baru (< 1 Bulan)';
    }
  }
}
