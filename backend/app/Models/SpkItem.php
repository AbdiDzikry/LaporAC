<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpkItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'spk_id',
        'pricelist_item_id',
        'item_name',
        'qty',
        'price_per_item',
        'total_price',
    ];

    protected $casts = [
        'qty' => 'integer',
        'price_per_item' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    public function spk()
    {
        return $this->belongsTo(Spk::class);
    }

    public function pricelistItem()
    {
        return $this->belongsTo(PricelistItem::class);
    }

    /**
     * Calculate total price
     */
    public function calculateTotal(): float
    {
        return $this->qty * $this->price_per_item;
    }
}
