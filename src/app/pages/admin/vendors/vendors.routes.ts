import { Routes } from '@angular/router';
import { VendorListComponent } from './vendor-list/vendor-list';
import { VendorFormComponent } from './vendor-form/vendor-form';

export const VENDOR_ROUTES: Routes = [
    { path: '', component: VendorListComponent },
    { path: 'new', component: VendorFormComponent },
    { path: 'edit/:id', component: VendorFormComponent }
];
