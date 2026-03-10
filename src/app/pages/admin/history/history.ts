import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TicketService, Ticket } from '../../../services/ticket/ticket';
import { MaintenanceService, MaintenanceSchedule } from '../../../services/maintenance/maintenance';
import { SweetAlertService } from '../../../services/sweet-alert/sweet-alert.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
  templateUrl: './history.html',
  styles: ``
})
export class HistoryComponent implements OnInit {
  activeTab: 'tickets' | 'maintenance' = 'tickets';

  tickets: Ticket[] = [];
  maintenance: MaintenanceSchedule[] = [];

  loadingTickets = false;
  loadingMaintenance = false;

  constructor(
    private ticketService: TicketService,
    private maintenanceService: MaintenanceService,
    private http: HttpClient,
    private swal: SweetAlertService
  ) { }

  ngOnInit() {
    this.loadTickets();
    this.loadMaintenance();
  }

  async loadTickets() {
    this.loadingTickets = true;
    // Get all tickets, filter to closed or resolved
    const { data } = await this.ticketService.getTickets();
    if (data) {
      this.tickets = data.filter((t: Ticket) => t.status === 'closed' || t.status === 'resolved');
    }
    this.loadingTickets = false;
  }

  async loadMaintenance() {
    this.loadingMaintenance = true;
    const { data } = await this.maintenanceService.getSchedules('history');
    if (data) {
      this.maintenance = data;
    }
    this.loadingMaintenance = false;
  }

  setTab(tab: 'tickets' | 'maintenance') {
    this.activeTab = tab;
  }

  async exportGlobalReport() {
    try {
      this.swal.info('Menyiapkan Laporan', 'Sedang meng-generate PDF, mohon tunggu...');
      const response = await firstValueFrom(
        this.http.get(`${this.ticketService['apiUrl'].replace('/tickets', '/reports/history')}`, { responseType: 'blob' })
      );

      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = url;
      tempLink.setAttribute('download', `Rekap_History_Global_${new Date().getTime()}.pdf`);
      document.body.appendChild(tempLink);
      tempLink.click();

      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      this.swal.error('Gagal Ekspor', 'Tidak dapat membuat dokumen rekap laporan.');
    }
  }
}
