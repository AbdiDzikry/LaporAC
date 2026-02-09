import { Routes } from '@angular/router';
import { MaintenanceListComponent } from './maintenance-list/maintenance-list';
import { MaintenanceCalendarComponent } from './maintenance-calendar/maintenance-calendar';

export const MAINTENANCE_ROUTES: Routes = [
    { path: '', redirectTo: 'periods', pathMatch: 'full' },
    {
        path: 'periods',
        loadComponent: () => import('./periods-list/periods-list.component').then(m => m.PeriodsListComponent)
    },
    {
        path: 'periods/:id',
        loadComponent: () => import('./period-detail/period-detail.component').then(m => m.PeriodDetailComponent)
    },
    // Backward compatibility
    { path: 'list', redirectTo: 'periods', pathMatch: 'full' }
];
