import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaintenanceService, MaintenanceSchedule } from '../../../../services/maintenance/maintenance';
import { ToastService } from '../../../../services/toast/toast';

@Component({
  selector: 'app-maintenance-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './maintenance-calendar.html',
  styleUrls: ['./maintenance-calendar.css']
})
export class MaintenanceCalendarComponent implements OnInit {
  currentDate = new Date();
  calendarDays: any[] = [];
  schedules: MaintenanceSchedule[] = [];
  loading = false;

  constructor(
    private maintenanceService: MaintenanceService,
    private toast: ToastService
  ) { }

  ngOnInit() {
    this.generateCalendar();
    this.loadSchedules();
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

    this.calendarDays = [];

    // Empty slots for days before start of month
    for (let i = 0; i < startDayOfWeek; i++) {
      this.calendarDays.push({ empty: true });
    }

    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
      this.calendarDays.push({ day: i, date: new Date(year, month, i), events: [] });
    }
  }

  async loadSchedules() {
    this.loading = true;
    try {
      const { data, error } = await this.maintenanceService.getSchedules('all');
      if (error) throw error;
      this.schedules = data || [];
      this.mapSchedulesToCalendar();
    } catch (err) {
      console.error(err);
      this.toast.show('Failed to load calendar data', 'error');
    } finally {
      this.loading = false;
    }
  }

  mapSchedulesToCalendar() {
    // Clear events first
    this.calendarDays.forEach(d => { if (!d.empty) d.events = [] });

    this.schedules.forEach(schedule => {
      const schedDate = new Date(schedule.scheduled_date);
      // Check if same month & year
      if (schedDate.getMonth() === this.currentDate.getMonth() &&
        schedDate.getFullYear() === this.currentDate.getFullYear()) {

        const day = schedDate.getDate();
        // Find the day in calendar (account for empty slots)
        const calendarDay = this.calendarDays.find(d => !d.empty && d.day === day);
        if (calendarDay) {
          calendarDay.events.push(schedule);
        }
      }
    });
  }

  prevMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
    this.mapSchedulesToCalendar(); // Re-map existing loaded data (assuming we fetched all/enough)
    // Ideally we should re-fetch for the new range if dataset is large, 
    // but getSchedules('all') is fine for MVP size.
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
    this.mapSchedulesToCalendar();
  }

  getEventClass(status: string) {
    if (status === 'completed') return 'bg-green-100 text-green-700';
    if (status === 'missed') return 'bg-red-100 text-red-700';
    if (status === 'in_progress') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  }
}
