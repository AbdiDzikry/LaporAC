import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketService } from '../../../../services/ticket/ticket';
import { UserService, UserProfile } from '../../../../services/user/user';
import { ToastService } from '../../../../services/toast/toast'; // Import

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.css'
})
export class TicketDetailComponent implements OnInit {
  ticket: any;
  ticketForm: FormGroup;
  loading = false;
  saving = false;

  technicians: UserProfile[] = [];

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private userService: UserService,
    private fb: FormBuilder,
    private location: Location,
    private toast: ToastService // Inject
  ) {
    this.ticketForm = this.fb.group({
      status: ['', Validators.required],
      resolution_notes: [''],
      repair_cost: [0],
    });
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadTicket(id);
    }
    this.loadTechnicians();
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
      this.ticketForm.patchValue({
        status: data.status,
        resolution_notes: data.resolution_notes,
        repair_cost: data.repair_cost
      });
    }
    this.loading = false;
  }

  // --- Workflow Methods ---

  async assignTicket(technicianId: string) {
    if (!confirm('Tugaskan teknisi ini?')) return;
    this.saving = true;
    try {
      await this.ticketService.assignTicket(this.ticket.id, technicianId);
      await this.loadTicket(this.ticket.id); // Reload to update UI
      this.toast.show('Teknisi berhasil ditugaskan.', 'success');
    } catch (e) {
      console.error(e);
      this.toast.show('Gagal menugaskan teknisi.', 'error');
    } finally {
      this.saving = false;
    }
  }

  async startWork() {
    if (!confirm('Mulai pengerjaan tiket ini? Waktu akan dicatat.')) return;
    this.saving = true;
    try {
      await this.ticketService.startWork(this.ticket.id);
      await this.loadTicket(this.ticket.id);
    } catch (e) {
      this.toast.show('Gagal memulai pengerjaan.', 'error');
    } finally {
      this.saving = false;
    }
  }

  async submitVerification() {
    if (this.ticketForm.invalid) {
      this.toast.show('Mohon isi catatan dan biaya.', 'warning');
      return;
    }

    // Check-in check (ensure started_at exists) - optional validation

    this.saving = true;
    try {
      const { resolution_notes, repair_cost } = this.ticketForm.value;
      await this.ticketService.submitForVerification(this.ticket.id, resolution_notes, repair_cost);
      await this.loadTicket(this.ticket.id);
      this.toast.show('Laporan dikirim untuk verifikasi admin.', 'success');
    } catch (e) {
      this.toast.show('Gagal mengirim laporan.', 'error');
    } finally {
      this.saving = false;
    }
  }

  async verifyTicket() {
    if (!confirm('Verifikasi dan tutup tiket ini? Pastikan pekerjaan sudah sesuai.')) return;

    this.saving = true;
    try {
      // TODO: Get real Current User ID from Session Service
      const verifierId = 'mock-admin-id-placeholder';
      const notes = 'Diverifikasi oleh Admin';

      await this.ticketService.verifyTicket(this.ticket.id, verifierId, notes);
      await this.loadTicket(this.ticket.id);
      this.toast.show('Tiket berhasil diverifikasi dan ditutup.', 'success');
    } catch (e) {
      this.toast.show('Gagal verifikasi tiket.', 'error');
    } finally {
      this.saving = false;
    }
  }

  // Legacy method for fallback (kept safe)
  async onSubmit() {
    // ... legacy logic if needed, or remove
  }

  goBack() {
    this.location.back();
  }
}
