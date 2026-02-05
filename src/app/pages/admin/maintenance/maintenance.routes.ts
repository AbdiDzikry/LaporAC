import { Routes } from '@angular/router';
import { MaintenanceListComponent } from './maintenance-list/maintenance-list';
import { MaintenanceCalendarComponent } from './maintenance-calendar/maintenance-calendar';

export const MAINTENANCE_ROUTES: Routes = [
    { path: '', redirectTo: 'list', pathMatch: 'full' },
    { path: 'list', component: MaintenanceListComponent },
    { path: 'calendar', component: MaintenanceCalendarComponent }
];
