<?php

use App\Models\PricelistItem;
use App\Models\PricelistLog;

$items = [
    ['name' => 'Bongkar AC + Tambah', 'type' => 'jasa', 'price' => 650000],
    ['name' => 'Jasa Perapihan', 'type' => 'jasa', 'price' => 380000],
    ['name' => 'Jasa Pasang / Instalasi AC', 'type' => 'jasa', 'price' => 3000000],
    ['name' => 'Pipa Refrigerant + Isi Freon', 'type' => 'sparepart', 'price' => 45000],
    ['name' => 'Jasa & Bearing + Pasang', 'type' => 'jasa', 'price' => 225000],
    ['name' => 'Motor Fan AC Cassete / Pcs', 'type' => 'sparepart', 'price' => 350000],
    ['name' => 'Isi Gas Freon Normal', 'type' => 'sparepart', 'price' => 75000],
    ['name' => 'Panel Control', 'type' => 'sparepart', 'price' => 65000],
    ['name' => 'Freon R22/R32 Isi 100% full', 'type' => 'sparepart', 'price' => 288700],
];

foreach ($items as $item) {
    $existing = PricelistItem::where('name', $item['name'])->first();
    if (!$existing) {
        $created = PricelistItem::create($item);
        PricelistLog::create([
            'pricelist_item_id' => $created->id,
            'user_id' => 1, // Default Admin ID
            'action' => 'created',
            'new_price' => $created->price,
        ]);
        echo "Created: {$item['name']}\n";
    } else {
        echo "Skipped (Exists): {$item['name']}\n";
    }
}
