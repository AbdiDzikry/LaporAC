import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TicketService } from '../../../../services/ticket/ticket';
import { UserService, UserProfile } from '../../../../services/user/user';
import { ToastService } from '../../../../services/toast/toast';
import { SweetAlertService } from '../../../../services/sweet-alert/sweet-alert.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { SpkService } from '../../../../services/spk/spk';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.css'
})
export class TicketDetailComponent implements OnInit {
  ticket: any;
  loading = false;
  saving = false;

  // Forms for new workflow
  assignmentForm: FormGroup;  // Admin assigns to technician
  technicianActionForm: FormGroup;  // Technician does inspection + action
  vendorSelectionForm: FormGroup;  // Technician selects vendor for SPK
  completionForm: FormGroup;  // Vendor/Admin completes work
  verifyForm: FormGroup;  // Admin verifies completion

  technicians: UserProfile[] = [];
  vendors: UserProfile[] = [];
  currentUserRole: string | null = null;
  selectedPhotos: string[] = []; // For photo preview
  lightboxPhoto: string | null = null; // For lightbox overlay

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private userService: UserService,
    private spkService: SpkService,
    private fb: FormBuilder,
    private location: Location,
    private toast: ToastService,
    private sweetAlert: SweetAlertService,
    private authService: AuthService
  ) {
    // Form 1: Admin assigns ticket to technician
    this.assignmentForm = this.fb.group({
      assigned_technician_id: ['', Validators.required],
      assigned_technician_name: [''],
      priority: ['normal'],
      target_date: ['']
    });

    // Form 2: Technician inspection & action
    this.technicianActionForm = this.fb.group({
      is_damage_confirmed: [false, Validators.required],
      initial_diagnosis: [''],
      action_type: ['', Validators.required],
      resolution_notes: ['']
    });

    // Form 3: Technician selects vendor for SPK
    this.vendorSelectionForm = this.fb.group({
      vendor_id: ['', Validators.required],
      issue_description: [''],
      urgency: ['normal']
    });

    // Form 4: Completion (Technician or Vendor)
    this.completionForm = this.fb.group({
      completion_notes: ['', Validators.required],
      photos: [[]]
    });

    // Form 5: Admin verification
    this.verifyForm = this.fb.group({
      validation_notes: [''],
      is_satisfied: [true, Validators.required]
    });
  }

  ngOnInit() {
    this.loadCurrentUser();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadTicket(id);
    }
    this.loadTechnicians();
    this.loadVendors();
  }

  async loadCurrentUser() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.currentUserRole = user.role;
    }
  }

  get isAdmin(): boolean {
    return this.currentUserRole === 'admin' || this.currentUserRole === 'super_admin';
  }

  get isTechnician(): boolean {
    return this.currentUserRole === 'technician';
  }

  get isVendor(): boolean {
    return this.currentUserRole === 'vendor';
  }

  async loadTechnicians() {
    const { data } = await this.userService.getTechnicians();
    if (data) {
      this.technicians = data;
    }
  }

  async loadVendors() {
    const { data } = await this.userService.getVendors();
    if (data) {
      this.vendors = data;
    }
  }

  async loadTicket(id: number) {
    this.loading = true;
    const { data, error } = await this.ticketService.getTicketById(id);
    this.loading = false;

    if (error) {
      this.sweetAlert.error('Gagal', 'Gagal memuat detail tiket');
      return;
    }

    if (data) {
      this.ticket = data;

      // Pre-fill forms if data exists
      if (data.assigned_technician_id) {
        this.assignmentForm.patchValue({
          assigned_technician_id: data.assigned_technician_id
        });
      }
    }
  }

  // --- STEP 1: ADMIN ASSIGN TO TECHNICIAN ---
  async assignToTechnician() {
    if (this.assignmentForm.invalid) return;

    const confirmed = await this.sweetAlert.confirm(
      'Assign ke Teknisi',
      'Apakah Anda yakin ingin menugaskan tiket ini ke teknisi tersebut?'
    );

    if (!confirmed) return;

    this.saving = true;
    try {
      const formValue = this.assignmentForm.value;
      const technician = this.technicians.find(t => t.id === formValue.assigned_technician_id);

      await this.ticketService.updateTicket(this.ticket.id, {
        assigned_technician_id: formValue.assigned_technician_id,
        assigned_technician_name: technician?.name,
        priority: formValue.priority,
        target_date: formValue.target_date,
        status: 'assigned'
      });

      this.sweetAlert.success('Berhasil', 'Tiket berhasil diassign ke teknisi');
      await this.loadTicket(this.ticket.id);
    } catch (error: any) {
      this.sweetAlert.error('Gagal', error.message || 'Gagal assign tiket');
    } finally {
      this.saving = false;
    }
  }

  // --- STEP 2: TECHNICIAN INSPECTION ---
  async submitInspection() {
    if (this.technicianActionForm.invalid) return;

    const confirmed = await this.sweetAlert.confirm(
      'Submit Hasil Inspeksi',
      'Apakah Anda yakin dengan hasil inspeksi ini?'
    );

    if (!confirmed) return;

    this.saving = true;
    try {
      const formValue = this.technicianActionForm.value;

      if (!formValue.is_damage_confirmed) {
        await this.ticketService.updateTicket(this.ticket.id, {
          is_damage_confirmed: false,
          initial_diagnosis: formValue.initial_diagnosis,
          status: 'rejected',
          completion_notes: 'Tidak ditemukan kerusakan / False alarm'
        });
        this.sweetAlert.success('Tiket Ditutup', 'Tidak ada kerusakan ditemukan pada AC');
      } else {
        await this.ticketService.updateTicket(this.ticket.id, {
          is_damage_confirmed: true,
          initial_diagnosis: formValue.initial_diagnosis,
          action_type: formValue.action_type,
          status: 'in_progress'
        });

        if (formValue.action_type === 'internal_repair') {
          this.sweetAlert.success('Berhasil', 'Silakan lakukan perbaikan internal');
        } else {
          this.sweetAlert.success('Berhasil', 'Silakan pilih vendor untuk membuat SPK');
        }
      }

      await this.loadTicket(this.ticket.id);
    } catch (error: any) {
      this.sweetAlert.error('Gagal', error.message || 'Gagal submit inspeksi');
    } finally {
      this.saving = false;
    }
  }

  // --- STEP 3a: COMPLETE INTERNAL REPAIR ---
  async completeInternalRepair() {
    if (this.completionForm.invalid) return;

    const confirmed = await this.sweetAlert.confirm(
      'Selesaikan Perbaikan',
      'Apakah perbaikan sudah selesai dan siap diverifikasi?'
    );

    if (!confirmed) return;

    this.saving = true;
    try {
      const formValue = this.completionForm.value;

      await this.ticketService.updateTicket(this.ticket.id, {
        completion_notes: formValue.completion_notes,
        status: 'completed'
      });

      this.sweetAlert.success('Berhasil', 'Perbaikan selesai. Menunggu verifikasi admin');
      await this.loadTicket(this.ticket.id);
    } catch (error: any) {
      this.sweetAlert.error('Gagal', error.message || 'Gagal menyelesaikan perbaikan');
    } finally {
      this.saving = false;
    }
  }

  // --- STEP 3b: CREATE SPK FOR VENDOR ---
  async createSPK() {
    if (this.vendorSelectionForm.invalid) return;

    const confirmed = await this.sweetAlert.confirm(
      'Buat SPK',
      'Apakah Anda yakin ingin membuat SPK untuk vendor ini?'
    );

    if (!confirmed) return;

    this.saving = true;
    try {
      const formValue = this.vendorSelectionForm.value;

      const { data: spkData, error: spkError } = await this.spkService.createSpk({
        ticket_id: this.ticket.id,
        vendor_id: parseInt(formValue.vendor_id, 10),
        status: 'sent'
      });

      if (spkError) {
        throw new Error(spkError);
      }

      const vendor = this.vendors.find(v => v.id === formValue.vendor_id);
      await this.ticketService.updateTicket(this.ticket.id, {
        assigned_vendor_id: formValue.vendor_id,
        assigned_vendor_name: vendor?.name,
        action_type: 'vendor',
        issue_description: formValue.issue_description,
        urgency: formValue.urgency,
        status: 'waiting_for_spk_approval'
      });

      this.sweetAlert.success('Berhasil', 'SPK dibuat dan menunggu persetujuan Section Head');
      await this.loadTicket(this.ticket.id);
    } catch (error: any) {
      this.sweetAlert.error('Gagal', error.message || 'Gagal membuat SPK');
    } finally {
      this.saving = false;
    }
  }

  // --- STEP 4: VENDOR SUBMITS COMPLETION ---
  async submitVendorCompletion() {
    if (this.completionForm.invalid) return;

    const confirmed = await this.sweetAlert.confirm(
      'Submit Laporan',
      'Apakah laporan perbaikan sudah lengkap dan benar?'
    );

    if (!confirmed) return;

    this.saving = true;
    try {
      const formValue = this.completionForm.value;

      await this.ticketService.updateTicket(this.ticket.id, {
        completion_notes: formValue.completion_notes,
        status: 'completed'
      });

      this.sweetAlert.success('Berhasil', 'Laporan berhasil dikirim. Menunggu verifikasi admin');
      await this.loadTicket(this.ticket.id);
    } catch (error: any) {
      this.sweetAlert.error('Gagal', error.message || 'Gagal submit laporan');
    } finally {
      this.saving = false;
    }
  }

  // --- STEP 5: ADMIN VERIFIES COMPLETION ---
  async verifyCompletion() {
    if (this.verifyForm.invalid) return;

    const confirmed = await this.sweetAlert.confirm(
      'Verifikasi & Tutup Tiket',
      'Apakah Anda puas dengan hasil perbaikan? Tiket akan ditutup dan masa garansi dimulai.'
    );

    if (!confirmed) return;

    this.saving = true;
    try {
      const formValue = this.verifyForm.value;
      const user = await this.authService.getCurrentUser();

      await this.ticketService.updateTicket(this.ticket.id, {
        validation_notes: formValue.validation_notes,
        verified_by_id: user?.id,
        status: 'resolved',
        date_resolved: new Date().toISOString()
      });

      this.sweetAlert.success('Berhasil', 'Tiket ditutup. Masa garansi 3 bulan dimulai');
      await this.loadTicket(this.ticket.id);
    } catch (error: any) {
      this.sweetAlert.error('Gagal', error.message || 'Gagal verifikasi');
    } finally {
      this.saving = false;
    }
  }

  // Helper methods
  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'open': 'bg-blue-100 text-blue-700',
      'assigned': 'bg-green-100 text-green-700',
      'in_progress': 'bg-yellow-100 text-yellow-700',
      'waiting_for_spk_approval': 'bg-amber-100 text-amber-700',
      'vendor_assigned': 'bg-purple-100 text-purple-700',
      'completed': 'bg-orange-100 text-orange-700',
      'resolved': 'bg-blue-100 text-blue-700',
      'closed': 'bg-gray-100 text-gray-700',
      'rejected': 'bg-red-100 text-red-700'
    };
    return classes[status] || 'bg-gray-100 text-gray-700';
  }

  getWarrantyLabel(asset: any): string {
    if (!asset?.warranty_expiry_date) return 'Tidak Ada Garansi';

    const expiry = new Date(asset.warranty_expiry_date);
    const now = new Date();
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Kedaluwarsa (${Math.abs(diffDays)} hari lalu)`;
    if (diffDays <= 30) return `${diffDays} hari lagi`;
    return `${Math.floor(diffDays / 30)} bulan lagi`;
  }

  getWarrantyClass(asset: any): string {
    if (!asset?.warranty_expiry_date) return 'text-gray-600';

    const expiry = new Date(asset.warranty_expiry_date);
    const now = new Date();
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-gray-600 font-medium';
    if (diffDays <= 30) return 'text-yellow-600 font-bold';
    return 'text-green-600 font-bold';
  }

  goBack() {
    this.location.back();
  }

  // Photo upload handlers
  onPhotosSelected(event: any) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Limit to 5 photos
    const maxPhotos = 5;
    const count = Math.min(files.length, maxPhotos);

    for (let i = 0; i < count; i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.sweetAlert.warning('File tidak valid', 'Hanya file gambar (JPG, PNG) yang diperbolehkan');
        continue;
      }

      // Read file as data URL for preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (this.selectedPhotos.length < maxPhotos) {
          this.selectedPhotos.push(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }

    if (files.length > maxPhotos) {
      this.sweetAlert.info('Foto dibatasi', `Hanya ${maxPhotos} foto pertama yang akan diupload`);
    }
  }

  removePhoto(index: number) {
    this.selectedPhotos.splice(index, 1);
  }

  async uploadPhotos(): Promise<string[]> {
    // In production, this would upload to server and return URLs
    // For now, return placeholder
    return this.selectedPhotos;
  }
}
