import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { AssetListComponent } from './pages/admin/assets/asset-list/asset-list';
import { AssetFormComponent } from './pages/admin/assets/asset-form/asset-form';
import { PrintQrComponent } from './pages/admin/assets/print-qr/print-qr';
import { ReportFormComponent } from './pages/public/report-form/report-form';
import { TicketListComponent } from './pages/admin/tickets/ticket-list/ticket-list';
import { TicketDetailComponent } from './pages/admin/tickets/ticket-detail/ticket-detail';
import { AnalyticsComponent } from './pages/admin/analytics/analytics';
import { roleGuard } from './guards/role/role-guard';
import { AdminLayout } from './components/admin-layout/admin-layout';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'report', component: ReportFormComponent },

    // Print route (no layout, no sidebar)
    { path: 'admin/assets/print/:id', component: PrintQrComponent, canActivate: [roleGuard] },

    // Protected Admin Routes with Layout
    {
        path: '',
        component: AdminLayout,
        canActivate: [roleGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'admin/analytics', component: AnalyticsComponent },
            { path: 'admin/assets', component: AssetListComponent },
            { path: 'admin/assets/new', component: AssetFormComponent },
            { path: 'admin/assets/edit/:id', component: AssetFormComponent },
            { path: 'admin/tickets', component: TicketListComponent },
            { path: 'admin/tickets/:id', component: TicketDetailComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },

    { path: '**', redirectTo: 'login' }
];
