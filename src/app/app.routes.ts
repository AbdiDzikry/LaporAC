import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { ReportFormComponent } from './pages/public/report-form/report-form';
import { roleGuard } from './guards/role/role-guard';
import { AdminLayout } from './components/admin-layout/admin-layout';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'report', component: ReportFormComponent },
    { path: 'report/new', component: ReportFormComponent },

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
                path: 'admin/settings',
                loadComponent: () => import('./pages/admin/settings/settings').then(m => m.SettingsComponent)
            },
            {
                path: 'admin/users',
                redirectTo: 'admin/settings',
                pathMatch: 'full'
            },
            {
                path: 'admin/users/roles',
                loadComponent: () => import('./pages/admin/users/role-list/role-list').then(m => m.RoleListComponent)
            },
            {
                path: 'admin/users/create',
                loadComponent: () => import('./pages/admin/users/user-form/user-form').then(m => m.UserFormComponent)
            },
            {
                path: 'admin/users/edit/:id',
                loadComponent: () => import('./pages/admin/users/user-form/user-form').then(m => m.UserFormComponent),
                title: 'Edit User'
            },
            {
                path: 'admin/maintenance/generate',
                loadComponent: () => import('./pages/admin/maintenance/maintenance-wizard/maintenance-wizard').then(m => m.MaintenanceWizardComponent),
                title: 'Generate Jadwal Rutin'
            },
            {
                path: 'admin/history',
                loadComponent: () => import('./pages/admin/history/history').then(m => m.HistoryComponent)
            },
            {
                path: 'admin/logs',
                redirectTo: 'admin/settings',
                pathMatch: 'full'
            },
            {
                path: 'admin/configs',
                redirectTo: 'admin/settings',
                pathMatch: 'full'
            },
            {
                path: 'admin/pricelist',
                loadComponent: () => import('./pages/admin/pricelist/pricelist').then(m => m.PricelistComponent)
            },
            {
                path: 'admin/spk',
                loadComponent: () => import('./pages/admin/spk/spk-list/spk-list').then(m => m.SpkListComponent)
            },
            {
                path: 'admin/spk/:id',
                loadComponent: () => import('./pages/admin/spk/spk-detail/spk-detail').then(m => m.SpkDetailComponent)
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
                path: 'admin/assets/:id/history',
                loadComponent: () => import('./pages/admin/assets/asset-history/asset-history').then(m => m.AssetHistoryComponent),
                title: 'Asset History'
            },
            {
                path: 'admin/tickets',
                loadComponent: () => import('./pages/admin/tickets/ticket-list/ticket-list').then(m => m.TicketListComponent)
            },
            {
                path: 'admin/tickets/:id',
                loadComponent: () => import('./pages/admin/tickets/ticket-detail/ticket-detail').then(m => m.TicketDetailComponent)
            },
            {
                path: 'vendor/tickets',
                loadComponent: () => import('./pages/admin/tickets/ticket-list/ticket-list').then(m => m.TicketListComponent)
            },
            {
                path: 'vendor/tickets/:id',
                loadComponent: () => import('./pages/admin/tickets/ticket-detail/ticket-detail').then(m => m.TicketDetailComponent)
            },
            {
                path: 'admin/vendors',
                loadChildren: () => import('./pages/admin/vendors/vendors.routes').then(m => m.VENDOR_ROUTES)
            },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },

    { path: '**', redirectTo: 'login' }
];
