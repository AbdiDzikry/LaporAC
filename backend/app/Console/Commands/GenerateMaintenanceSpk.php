<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\MaintenanceSchedule;
use App\Models\Spk;
use App\Models\AppConfig;
use App\Models\User;

class GenerateMaintenanceSpk extends Command
{
    protected $signature = 'maintenance:generate-spk';
    protected $description = 'Auto-generate SPK for upcoming maintenance schedules (H-7 by default)';

    public function handle()
    {
        $daysBefore = (int) (AppConfig::where('identifier', 'maintenance_spk_days_before')->value('value') ?? 7);

        $targetDate = now()->addDays($daysBefore)->toDateString();

        $this->info("Checking maintenance schedules for date: {$targetDate} (H-{$daysBefore})");

        // Find scheduled maintenances that are exactly H-$daysBefore away and don't have SPK yet
        $schedules = MaintenanceSchedule::with('asset')
            ->where('scheduled_date', $targetDate)
            ->where('status', 'scheduled')
            ->get();

        if ($schedules->isEmpty()) {
            $this->info('No maintenance schedules found for the target date.');
            return 0;
        }

        // Get default vendor (first active vendor) - admin should assign manually if needed
        $defaultVendor = User::where('role', 'vendor')->first();

        if (!$defaultVendor) {
            $this->warn('No vendor found in system. Cannot generate SPK automatically.');
            return 1;
        }

        $generated = 0;

        foreach ($schedules as $schedule) {
            // Check if SPK already exists
            if ($schedule->ticket_id) {
                $existing = Spk::where('ticket_id', $schedule->ticket_id)
                    ->where('spk_type', 'maintenance')
                    ->exists();

                if ($existing) {
                    $this->line("  Skipping schedule #{$schedule->id} - SPK already exists");
                    continue;
                }
            }

            $spk = Spk::create([
                'spk_number' => 'SPK-MT-' . date('Ymd') . '-' . rand(1000, 9999),
                'ticket_id' => $schedule->ticket_id,
                'vendor_id' => $defaultVendor->id,
                'status' => 'pending_vendor_response',
                'is_warranty_claim' => false,
                'spk_type' => 'maintenance',
                'work_start_date' => $schedule->scheduled_date,
            ]);

            $generated++;
            $assetName = $schedule->asset->name ?? 'N/A';
            $this->info("  Generated SPK {$spk->spk_number} for schedule #{$schedule->id} (Asset: {$assetName})");
        }

        $this->info("Done. Generated {$generated} SPK(s).");
        return 0;
    }
}
