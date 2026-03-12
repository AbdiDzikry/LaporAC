import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaintenanceListComponent } from '../../admin/maintenance/maintenance-list/maintenance-list';

@Component({
    selector: 'app-vendor-maintenance',
    standalone: true,
    imports: [CommonModule, MaintenanceListComponent],
    templateUrl: './vendor-maintenance.html',
})
export class VendorMaintenanceComponent {
}
