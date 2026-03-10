<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Asset extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'sku',
        'location',
        'brand',
        'category',
        'model_number',
        'serial_number',
        'purchase_date',
        'warranty_expiry',
        'last_maintenance_date',
        'next_maintenance_date',
        'maintenance_interval_days',
        'status',
        'image_url',
        'pk',
        'warranty_status',
        'warranty_months',
        'last_repair_date',
        'last_repair_spk_id',
        'total_repairs',
        'total_repair_cost',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'warranty_expiry' => 'date',
        'last_maintenance_date' => 'date',
        'next_maintenance_date' => 'date',
        'maintenance_interval_days' => 'integer',
        'last_repair_date' => 'date',
        'total_repairs' => 'integer',
        'total_repair_cost' => 'decimal:2',
    ];

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    public function maintenanceSchedules()
    {
        return $this->hasMany(MaintenanceSchedule::class);
    }

    public function lastRepairSpk()
    {
        return $this->belongsTo(Spk::class, 'last_repair_spk_id');
    }

    public function newsReports()
    {
        return $this->hasMany(NewsReport::class);
    }

    /**
     * Check if asset is under warranty
     */
    public function isUnderWarranty(): bool
    {
        if (!$this->warranty_expiry) {
            return false;
        }

        return now()->lessThanOrEqualTo($this->warranty_expiry);
    }

    /**
     * Get warranty status attribute
     */
    public function getWarrantyStatusAttribute(): string
    {
        if (!$this->warranty_expiry) {
            return 'none';
        }

        return $this->isUnderWarranty() ? 'active' : 'expired';
    }

    /**
     * Get days remaining until warranty expires
     */
    public function getWarrantyDaysRemainingAttribute(): ?int
    {
        if (!$this->warranty_expiry) {
            return null;
        }

        return max(0, now()->diffInDays($this->warranty_expiry, false));
    }

    /**
     * Update warranty expiry after repair
     */
    public function extendWarranty(int $months = 3): void
    {
        $currentExpiry = $this->warranty_expiry ? \Carbon\Carbon::parse($this->warranty_expiry) : now();
        $newExpiry = now()->addMonths($months);

        // Only extend if new expiry is greater than current
        if ($newExpiry->greaterThan($currentExpiry)) {
            $this->update([
                'warranty_expiry' => $newExpiry->toDateString(),
                'warranty_status' => 'active',
            ]);
        }
    }

    /**
     * Increment repair count and cost
     */
    public function recordRepair(float $cost = 0): void
    {
        $this->increment('total_repairs');
        $this->increment('total_repair_cost', $cost);
        $this->update([
            'last_repair_date' => now(),
        ]);
    }
}
