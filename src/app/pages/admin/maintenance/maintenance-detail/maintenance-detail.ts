import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; // RouterLink imported
import { MaintenanceService, MaintenanceSchedule } from '../../../../services/maintenance/maintenance';
import { ToastService } from '../../../../services/toast/toast';

@Component({
    selector: 'app-maintenance-detail',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink], // Added RouterLink to imports
    templateUrl: './maintenance-detail.html',
})
export class MaintenanceDetailComponent implements OnInit {
    workOrder: MaintenanceSchedule | null = null;
    metaForm: FormGroup;
    loading = true;
    saving = false;

    constructor(
        private maintenanceService: MaintenanceService,
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
        private toast: ToastService
    ) {
        this.metaForm = this.fb.group({
            technician_notes: ['']
        });
    }

    ngOnInit() {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (id) {
            this.loadData(id);
        }
    }

    async loadData(id: number) {
        this.loading = true;
        try {
            // For MVP, since we don't have getScheduleById, we filter from list.
            //Ideally we should add getScheduleById to service.
            const { data, error } = await this.maintenanceService.getSchedules('all');

            if (error) throw error;

            if (data) {
                this.workOrder = data.find(s => s.id === id) || null;
            }

            // Initialize Forms
            if (this.workOrder) {
                this.metaForm.patchValue({
                    technician_notes: this.workOrder.technician_notes
                });
            } else {
                this.toast.show('Jadwal tidak ditemukan', 'error');
                this.router.navigate(['/admin/maintenance']);
            }
        } catch (e) {
            console.error(e);
            this.toast.show('Gagal memuat detail maintenance', 'error');
        } finally {
            this.loading = false;
        }
    }

    async saveChanges(complete: boolean = false) {
        if (!this.workOrder || !this.workOrder.id) return;
        this.saving = true;

        try {
            if (complete) {
                if (!confirm('Tandai pekerjaan ini selesai?')) {
                    this.saving = false;
                    return;
                }
            }

            const notes = this.metaForm.value.technician_notes;

            if (complete) {
                await this.maintenanceService.completeMaintenance(this.workOrder.id, notes);
                this.toast.show('Pekerjaan selesai!', 'success');
                this.router.navigate(['/admin/maintenance']);
            } else {
                // For MVP, we only support "Complete" action properly.
                // Just log or show toast for now.
                this.toast.show('Simpan draft belum tersedia. Silakan klik Complete jika selesai.', 'info');
            }

        } catch (e) {
            console.error(e);
            this.toast.show('Gagal menyimpan.', 'error');
        } finally {
            this.saving = false;
        }
    }
}
