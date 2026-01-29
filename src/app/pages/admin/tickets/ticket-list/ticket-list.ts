import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TicketService } from '../../../../services/ticket/ticket';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ticket-list.html',
  styleUrl: './ticket-list.css'
})
export class TicketListComponent implements OnInit {
  tickets: any[] = [];
  loading = false;

  constructor(private ticketService: TicketService) { }

  ngOnInit() {
    this.loadTickets();
  }

  async loadTickets() {
    this.loading = true;
    const { data, error } = await this.ticketService.getTickets();
    if (data) {
      this.tickets = data;
    }
    this.loading = false;
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
