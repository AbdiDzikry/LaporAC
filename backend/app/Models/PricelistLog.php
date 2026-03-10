<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PricelistLog extends Model
{
    protected $fillable = [
        'pricelist_item_id',
        'user_id',
        'action',
        'old_price',
        'new_price',
    ];

    public function item()
    {
        return $this->belongsTo(PricelistItem::class, 'pricelist_item_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
