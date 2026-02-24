import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AssetService, Asset } from '../../../../services/asset/asset';
import { MaintenanceService } from '../../../../services/maintenance/maintenance'; // Or TicketService if centralized
import { ToastService } from '../../../../services/toast/toast';

interface ScheduleItem {
    asset: Asset;
    suggestedDate: Date;
    dayName: string; // 'Sabtu' | 'Rabu' | 'Selasa'
    locationType: 'Office' | 'Lain' | 'Overflow';
}

@Component({
    selector: 'app-maintenance-wizard',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './maintenance-wizard.html',
})
export class MaintenanceWizardComponent implements OnInit {
    currentStep = 1;
    loading = false;
    periodForm: FormGroup;

    // Data
    assetsDue: Asset[] = [];
    schedule: ScheduleItem[] = [];

    constructor(
        private fb: FormBuilder,
        private assetService: AssetService,
        private maintenanceService: MaintenanceService,
        private router: Router,
        private toast: ToastService
    ) {
        this.periodForm = this.fb.group({
            month: [new Date().getMonth() + 1, Validators.required], // 1-12
            year: [new Date().getFullYear(), Validators.required]
        });
    }

    ngOnInit() { }

    // --- STEP 1: LOAD ASSETS ---
    async loadAssetsForPeriod() {
        this.loading = true;
        try {
            const { month, year } = this.periodForm.value;
            // In real app, filter by next_service_date query. 
            // For MVP, fetch all and filter client side or mock.
            const { data } = await this.assetService.getAssets();

            if (data) {
                // Mock Filter: Find assets due in selected Month/Year
                // For demo purposes, we might just take ALL active assets if date is null
                this.assetsDue = (data as Asset[]).filter(a => a.is_active !== false);

                if (this.assetsDue.length === 0) {
                    this.toast.show('Tidak ada aset yang perlu maintenance bulan ini.', 'info');
                    return;
                }
                this.nextStep();
            }
        } catch (e) {
            this.toast.show('Gagal memuat data aset.', 'error');
        } finally {
            this.loading = false;
        }
    }

    // --- STEP 2: GENERATE SCHEDULE (The Logic) ---
    generateSchedule() {
        this.loading = true;
        const { month, year } = this.periodForm.value;
        this.schedule = [];

        // Logic from PDF Page 2:
        // 1. Group by Location
        // 2. Assign Date (Sabtu = Office, Rabu = Lain)
        // 3. Overflow (Selasa)

        this.assetsDue.forEach(asset => {
            let date = new Date(year, month - 1, 1); // Start of month
            let dayName = '';
            let locationType: 'Office' | 'Lain' | 'Overflow' = 'Lain';

            // Heuristic for Location Type
            const isOffice = asset.location.toLowerCase().includes('office') || asset.location.toLowerCase().includes('lt');

            if (isOffice) {
                locationType = 'Office';
                dayName = 'Sabtu';
                // Find first Saturday of month (or distribute across Saturdays)
                date = this.findDayInMonth(year, month, 6); // 6 = Saturday
            } else {
                locationType = 'Lain';
                dayName = 'Rabu';
                // Find first Wednesday
                date = this.findDayInMonth(year, month, 3); // 3 = Wednesday
            }

            // Overflow Check (Mock limit 5 per day)
            // const countOnDay = ...
            // if (count > 5) { locationType = 'Overflow'; dayName = 'Selasa'; date = ... }

            this.schedule.push({
                asset,
                suggestedDate: date,
                dayName,
                locationType
            });
        });

        this.loading = false;
        this.nextStep();
    }

    findDayInMonth(year: number, month: number, dayOfWeek: number): Date {
        const date = new Date(year, month - 1, 1);
        while (date.getDay() !== dayOfWeek) {
            date.setDate(date.getDate() + 1);
        }
        return date;
    }

    // --- STEP 3: CONFIRM & CREATE SPK ---
    async confirmSchedule() {
        if (!confirm('Buat Jadwal & SPK Rutin?')) return;

        this.loading = true;
        try {
            // Create Bulk Maintenance Records / Tickets

            // Map internal schedule items to service payload
            const variedSchedule = this.schedule.map(item => ({
                asset_id: item.asset.id!,
                scheduled_date: item.suggestedDate.toISOString().split('T')[0]
            }));

            await this.maintenanceService.createVariedBulkSchedule(variedSchedule);

            this.toast.show('Jadwal Rutin Berhasil Dibuat!', 'success');
            this.router.navigate(['/admin/maintenance']);
        } catch (e) {
            this.toast.show('Gagal menyimpan jadwal.', 'error');
        } finally {
            this.loading = false;
        }
    }

    nextStep() {
        this.currentStep++;
    }

    prevStep() {
        this.currentStep--;
    }
}
