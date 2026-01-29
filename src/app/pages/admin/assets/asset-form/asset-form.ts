import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AssetService } from '../../../../services/asset/asset';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-asset-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './asset-form.html',
  styleUrl: './asset-form.css'
})
export class AssetFormComponent implements OnInit {
  assetForm: FormGroup;
  isEditMode = false;
  assetId: number | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private assetService: AssetService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.assetForm = this.fb.group({
      sku: ['', Validators.required],
      name: [''], // Name is optional, will auto-gen
      brand: ['', Validators.required], // Maps to JENIS
      location: ['', Validators.required],
      pk: ['', Validators.required],
      status: ['good', Validators.required]
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
      this.assetForm.patchValue(data);
    }
    this.loading = false;
  }

  async onSubmit() {
    if (this.assetForm.invalid) return;

    this.loading = true;
    try {
      const formVal = this.assetForm.value;

      // Auto-generate name if empty: "AC [Location] [SKU]"
      if (!formVal.name) {
        formVal.name = `AC ${formVal.location} ${formVal.sku}`;
      }

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
}
