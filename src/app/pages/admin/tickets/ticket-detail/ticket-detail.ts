import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketService } from '../../../../services/ticket/ticket';

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

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private fb: FormBuilder,
    private location: Location
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

  async onSubmit() {
    if (this.ticketForm.invalid) return;

    this.saving = true;
    try {
      const updates = {
        ...this.ticketForm.value,
        // If status is closed or resolved, we might set completed_at.
        completed_at: (['resolved', 'closed'].includes(this.ticketForm.value.status) && !this.ticket.completed_at) ? new Date() : this.ticket.completed_at
      };

      await this.ticketService.updateTicket(this.ticket.id, updates);
      alert('Tiket berhasil diupdate!');
      this.location.back();
    } catch (error) {
      console.error(error);
      alert('Gagal update tiket.');
    } finally {
      this.saving = false;
    }
  }

  goBack() {
    this.location.back();
  }
}
