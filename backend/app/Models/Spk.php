<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Spk extends Model
{
    use HasFactory;

    protected $fillable = [
        'spk_number',
        'ticket_id',
        'vendor_id',
        'status',
        'is_warranty_claim',
        'total_cost',
        'completion_notes',
        'photos',
        'approved_by_id',
        'approved_at',
        'vendor_signed_by_id',
        'vendor_signed_at',
        'vendor_notes',
        'work_start_date',
        'work_end_date',
        'spk_type',
        'proposed_visit_date',
        'vendor_response_notes',
        'vendor_responded_at',
        'admin_schedule_notes',
        'admin_verification_notes',
        'verified_by_id',
        'verified_at',
    ];

    protected $casts = [
        'photos' => 'array',
        'is_warranty_claim' => 'boolean',
        'approved_at' => 'datetime',
        'vendor_signed_at' => 'datetime',
        'vendor_responded_at' => 'datetime',
        'verified_at' => 'datetime',
        'work_start_date' => 'date',
        'work_end_date' => 'date',
        'proposed_visit_date' => 'date',
        'total_cost' => 'decimal:2',
    ];

    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    public function vendor()
    {
        return $this->belongsTo(User::class, 'vendor_id');
    }

    public function items()
    {
        return $this->hasMany(SpkItem::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by_id');
    }

    public function vendorSignedBy()
    {
        return $this->belongsTo(User::class, 'vendor_signed_by_id');
    }

    public function newsReport()
    {
        return $this->hasOne(NewsReport::class);
    }

    /**
     * Scope for warranty claims
     */
    public function scopeWarrantyClaims($query)
    {
        return $query->where('is_warranty_claim', true);
    }

    /**
     * Scope for non-warranty claims
     */
    public function scopeNonWarrantyClaims($query)
    {
        return $query->where('is_warranty_claim', false);
    }

    /**
     * Calculate total cost from items
     */
    public function calculateTotalCost(): float
    {
        return $this->items->sum(function ($item) {
            return $item->qty * $item->price_per_item;
        });
    }

    /**
     * Check if SPK is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if SPK is in warranty period
     */
    public function isInWarrantyPeriod(): bool
    {
        if (!$this->is_warranty_claim) {
            return false;
        }

        if (!$this->work_end_date) {
            return false;
        }

        $warrantyMonths = AppConfig::where('identifier', 'warranty_duration_months')->value('value') ?? 3;
        $warrantyEnd = $this->work_end_date->addMonths((int) $warrantyMonths);

        return now()->lessThanOrEqualTo($warrantyEnd);
    }
}
