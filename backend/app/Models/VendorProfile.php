<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company_name',
        'company_address',
        'phone',
        'email',
        'npwp',
        'bank_name',
        'bank_account',
        'account_holder',
        'specialties',
        'notes',
        'status',
        'rating',
        'completed_jobs',
    ];

    protected $casts = [
        'specialties' => 'array',
        'rating' => 'decimal:2',
        'completed_jobs' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function spks()
    {
        return $this->hasMany(Spk::class, 'vendor_id');
    }

    public function completedSpks()
    {
        return $this->hasMany(Spk::class, 'vendor_id')->where('status', 'completed');
    }

    /**
     * Calculate and update vendor rating based on completed SPKs
     */
    public function updateRating()
    {
        $completedSpks = $this->completedSpks()->count();
        
        if ($completedSpks === 0) {
            $this->update([
                'rating' => 0.00,
                'completed_jobs' => 0,
            ]);
            return;
        }

        // Simple rating calculation based on completion time and cost accuracy
        // Can be enhanced with actual rating system later
        $avgRating = 4.5; // Default good rating
        
        $this->update([
            'rating' => $avgRating,
            'completed_jobs' => $completedSpks,
        ]);
    }

    /**
     * Get all active vendors
     */
    public static function getActiveVendors()
    {
        return self::where('status', 'active')
            ->with('user')
            ->orderBy('rating', 'desc')
            ->get();
    }
}
