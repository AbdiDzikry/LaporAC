import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TicketService, Ticket } from '../../../../services/ticket/ticket';
import { UserService, UserProfile } from '../../../../services/user/user';
import { ToastService } from '../../../../services/toast/toast';
import { SweetAlertService } from '../../../../services/sweet-alert/sweet-alert.service';
import { RoleService } from '../../../../services/role/role';
import { AuthService } from '../../../../services/auth/auth.service';

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
  currentStage = 1;

  validationForm: FormGroup;
  inspectionForm: FormGroup;
  actionForm: FormGroup;
  completionForm: FormGroup;
  verifyForm: FormGroup;

  technicians: UserProfile[] = [];

  currentUserRole: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private userService: UserService,
    private fb: FormBuilder,
    private location: Location,
    private toast: ToastService,
    private sweetAlert: SweetAlertService,
    private authService: AuthService
  ) {
    // Stage 1: Validation (Pak Wija)
    this.validationForm = this.fb.group({
      decision: ['', Validators.required], // 'valid' | 'invalid'
      notes: ['']
    });

    // Stage 2: Inspection (Pak Budi)
    this.inspectionForm = this.fb.group({
      is_damage_confirmed: [true, Validators.required], // Rusak / Perlu Perbaikan?
      inspection_notes: ['']
    });

    // Stage 3: Action Decision (Siapa Kerja?)
    this.actionForm = this.fb.group({
      action_type: ['', Validators.required], // 'internal' | 'vendor'
      technician_id: [''], // For Internal
      vendor_name: ['PT Sinergi'], // For Vendor (Default)
    });

    // Stage 4: Completion
    this.completionForm = this.fb.group({
      resolution_notes: ['', Validators.required],
      repair_cost: [0]
    });

    // Stage 5: Admin Verification
    this.verifyForm = this.fb.group({
      validation_notes: ['']
    });
  }

  ngOnInit() {
    this.loadCurrentUser(); // Load User Role First
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadTicket(id);
    }
    this.loadTechnicians();
  }

  async loadCurrentUser() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.currentUserRole = user.role;
      console.log('Current User Role:', this.currentUserRole);
    }
  }

  get isAdmin(): boolean {
    return this.currentUserRole === 'admin' || this.currentUserRole === 'super_admin';
  }

  get isTechnician(): boolean {
    return this.currentUserRole === 'technician';
  }

  async loadTechnicians() {
    const { data } = await this.userService.getTechnicians();
    if (data) {
      this.technicians = data;
    }
  }

  async loadTicket(id: number) {
    this.loading = true;
    const { data, error } = await this.ticketService.getTicketById(id);
    if (data) {
      this.ticket = data;
      this.determineStage();
    }
    this.loading = false;
  }

  determineStage() {
    const status = this.ticket.status;
    const isDamaged = !!this.ticket.is_damage_confirmed;

    if (status === 'pending_validation') {
      this.currentStage = 1;
    } else if (status === 'open' || status === 'assigned') {
      if (isDamaged) {
        this.currentStage = 3; // Damage confirmed, waiting for Action Decision OR Action just assigned
        if (this.ticket.action_type) {
          this.actionForm.patchValue({
            action_type: this.ticket.action_type,
            technician_id: this.ticket.technician_id,
            vendor_name: this.ticket.vendor_name
          });
        }
      } else {
        this.currentStage = 2; // Needs Physical Check
      }
    } else if (status === 'in_progress' || status === 'vendor_prep') {
      this.currentStage = 3; // Working

      // Pre-fill Action Form if already decided
      if (this.ticket.action_type) {
        this.actionForm.patchValue({
          action_type: this.ticket.action_type,
          technician_id: this.ticket.technician_id,
          vendor_name: this.ticket.vendor_name
        });
      }
    } else if (status === 'pending_verification' || status === 'resolved' || status === 'closed' || status === 'false_alarm' || status === 'rejected') {
      this.currentStage = 4; // Done
    }
  }

  // --- STAGE 1: VALIDATION (Pak Wija) ---
  async submitValidation() {
    if (this.validationForm.invalid) return;

    const confirmed = await this.sweetAlert.confirm(
      'Konfirmasi Validasi',
      'Apakah Anda yakin ingin memvalidasi tiket ini?'
    );
    if (!confirmed) return;

    this.saving = true;
    try {
      const { decision, notes } = this.validationForm.value;
      await this.ticketService.validateTicket(this.ticket.id, decision, notes);
      await this.loadTicket(this.ticket.id);
      this.sweetAlert.success('Berhasil', 'Validasi berhasil disimpan.');
    } catch (e) {
      this.sweetAlert.error('Gagal', 'Gagal menyimpan validasi.');
    } finally {
      this.saving = false;
    }
  }

  // --- STAGE 2: INSPECTION (Pak Budi) ---
  async submitInspection() {
    // Logic: If "Not Damaged" -> Close Ticket. If "Damaged" -> Move to Action Selection.
    const confirmed = await this.sweetAlert.confirm(
      'Simpan Hasil Inspeksi',
      'Apakah data pengecekan fisik sudah benar?'
    );
    if (!confirmed) return;

    this.saving = true;
    try {
      const isDamaged = this.inspectionForm.get('is_damage_confirmed')?.value;

      if (!isDamaged) {
        // Mark as Rejected/No Issue
        await this.ticketService.updateTicket(this.ticket.id, {
          status: 'rejected',
          description: this.ticket.description + '\n[Cek Fisik]: Tidak ditemukan kerusakan / Tidak perlu perbaikan.',
          completed_at: new Date().toISOString()
        });
        this.sweetAlert.success('Tiket Ditutup', 'Tidak ada kerusakan ditemukan.');
      } else {
        await this.ticketService.updateTicket(this.ticket.id, {
          is_damage_confirmed: true
        });
        this.currentStage = 3;
        // We don't reload to avoid resetting stage logic if it depends solely on status
        this.sweetAlert.success('Lanjut ke Tindakan', 'Kerusakan terkonfirmasi. Silakan pilih tindakan selanjutnya.');
      }
      await this.loadTicket(this.ticket.id);
    } catch (e) {
      console.error(e);
      this.sweetAlert.error('Gagal', 'Gagal menyimpan inspeksi.');
    } finally {
      this.saving = false;
    }
  }

  // --- STAGE 3: ACTION SELECTION (Internal vs Vendor) ---
  async submitActionPlan() {
    if (this.actionForm.invalid) {
      this.sweetAlert.warning('Perhatian', 'Mohon pilih jenis tindakan dan pelaksana tugas.');
      return;
    }

    const confirmed = await this.sweetAlert.confirm(
      'Simpan Rencana Tindakan',
      'Pastikan pilihan pelaksana sudah benar.'
    );
    if (!confirmed) return;

    this.saving = true;
    try {
      const { action_type, technician_id, vendor_name } = this.actionForm.value;

      const updates: any = {
        action_type,
        status: action_type === 'internal' ? 'assigned' : 'vendor_prep'
      };

      if (action_type === 'internal') {
        updates.technician_id = technician_id;
      } else {
        updates.vendor_name = vendor_name;
        // Logic for "Buat SPK Mendadak" would go here (e.g. generate DOCX)
      }

      await this.ticketService.updateTicket(this.ticket.id, updates);
      await this.loadTicket(this.ticket.id);
      this.sweetAlert.success('Berhasil', 'Rencana tindakan telah disimpan.');

    } catch (e) {
      this.sweetAlert.error('Gagal', 'Gagal menyimpan tindakan.');
    } finally {
      this.saving = false;
    }
  }

  // --- STAGE 3.5: DO WORK (For Internal) ---
  async startInternalWork() {
    // Technician Click "Check In"
    try {
      await this.ticketService.startWork(this.ticket.id);
      await this.loadTicket(this.ticket.id);
      this.sweetAlert.success('Mulai Pengerjaan', 'Selamat bekerja! Waktu mulai telah dicatat.');
    } catch (e) {
      this.sweetAlert.error('Gagal', 'Gagal memulai pengerjaan.');
    }
  }

  // --- STAGE 4: COMPLETION ---
  async submitCompletion() {
    // Tech finishes work OR Vendor finishes work
    if (this.completionForm.invalid) return;

    const confirmed = await this.sweetAlert.confirm(
      'Selesaikan Pekerjaan',
      'Apakah semua perbaikan sudah selesai dan sesuai standar?'
    );
    if (!confirmed) return;

    this.saving = true;
    try {
      const { resolution_notes, repair_cost } = this.completionForm.value;
      await this.ticketService.submitForVerification(this.ticket.id, resolution_notes, repair_cost);
      await this.loadTicket(this.ticket.id);
      this.sweetAlert.success('Terkirim', 'Laporan penyelesaian berhasil dikirim untuk verifikasi.');
    } catch (e) {
      this.sweetAlert.error('Gagal', 'Gagal mengirim laporan selesai.');
    } finally {
      this.saving = false;
    }
  }

  // --- STAGE 5: ADMIN VERIFICATION ---
  async submitVerification() {
    if (this.verifyForm.invalid) return;

    const confirmed = await this.sweetAlert.confirm(
      'Selesaikan Tiket',
      'Apakah Anda yakin perbaikan telah tuntas dan sesuai standar?'
    );
    if (!confirmed) return;

    this.saving = true;
    try {
      const user = await this.authService.getCurrentUser();
      const verifierId = user?.id ? (user?.id).toString() : '';
      const notes = this.verifyForm.get('validation_notes')?.value;

      await this.ticketService.verifyTicket(this.ticket.id, verifierId, notes);
      await this.loadTicket(this.ticket.id);
      this.sweetAlert.success('Tuntas!', 'Tiket telah diverifikasi dan resmi ditutup.');
    } catch (e) {
      this.sweetAlert.error('Gagal', 'Verifikasi gagal disimpan.');
    } finally {
      this.saving = false;
    }
  }

  goBack() {
    this.location.back();
  }
}
