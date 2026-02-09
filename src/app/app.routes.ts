import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { ReportFormComponent } from './pages/public/report-form/report-form';
import { roleGuard } from './guards/role/role-guard';
import { AdminLayout } from './components/admin-layout/admin-layout';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'report', component: ReportFormComponent },

    // Print route (no layout, no sidebar) - Lazy loaded
    {
        path: 'admin/assets/print/:id',
        loadComponent: () => import('./pages/admin/assets/print-qr/print-qr').then(m => m.PrintQrComponent),
        canActivate: [roleGuard]
    },

    // Protected Admin Routes with Layout
    {
        path: '',
        component: AdminLayout,
        canActivate: [roleGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent },
            {
                path: 'admin/analytics',
                loadComponent: () => import('./pages/admin/analytics/analytics').then(m => m.AnalyticsComponent)
            },
            {
                path: 'admin/maintenance',
                loadChildren: () => import('./pages/admin/maintenance/maintenance.routes').then(m => m.MAINTENANCE_ROUTES)
            },
            {
                path: 'admin/users',
                loadComponent: () => import('./pages/admin/users/user-list/user-list').then(m => m.UserListComponent)
            },
            {
                path: 'admin/logs',
                loadComponent: () => import('./pages/admin/logs/logs').then(m => m.LogsComponent)
            },
            {
                path: 'admin/assets',
                loadComponent: () => import('./pages/admin/assets/asset-list/asset-list').then(m => m.AssetListComponent)
            },
            {
                path: 'admin/assets/new',
                loadComponent: () => import('./pages/admin/assets/asset-form/asset-form').then(m => m.AssetFormComponent)
            },
            {
                path: 'admin/assets/edit/:id',
                loadComponent: () => import('./pages/admin/assets/asset-form/asset-form').then(m => m.AssetFormComponent)
            },
            {
                path: 'admin/tickets',
                loadComponent: () => import('./pages/admin/tickets/ticket-list/ticket-list').then(m => m.TicketListComponent)
            },
            {
                path: 'admin/tickets/:id',
                loadComponent: () => import('./pages/admin/tickets/ticket-detail/ticket-detail').then(m => m.TicketDetailComponent)
            },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },

    { path: '**', redirectTo: 'login' }
];
