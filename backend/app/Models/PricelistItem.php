<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PricelistItem extends Model
{
    protected $fillable = [
        'vendor_id',
        'category',
        'name',
        'unit',
        'type',
        'price',
        'old_price',
        'image_path',
    ];

    public function vendor()
    {
        return $this->belongsTo(VendorProfile::class, 'vendor_id');
    }

    public function logs()
    {
        return $this->hasMany(PricelistLog::class);
    }
}
