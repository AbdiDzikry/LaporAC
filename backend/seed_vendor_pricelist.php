<?php

use App\Models\PricelistItem;
use App\Models\PricelistLog;
use App\Models\VendorProfile;

// Cari vendor PT. SYNERGI TEKHNIK MANDIRI, kalau tidak ada kita buat baru sebagai contoh
$vendor = VendorProfile::firstOrCreate(
    ['company_name' => 'PT. SYNERGI TEKHNIK MANDIRI'],
    [
        'name' => 'PT. SYNERGI TEKHNIK MANDIRI',
        'address' => 'Komplek Perum Mega Regancy Blok E54 No.03 RT./RW.001/013 Ds.Sukaragam, Kec. Serang Baru, Kab. Bekasi - Jawa Barat 17330',
        'phone' => '0813 8015 2488',
        'status' => 'active'
    ]
);

$items = [
    // 1 Jasa Service Cleaning
    ['name' => 'Jasa Service Cleaning AC splite 0,5 PK S/d 2,5 PK', 'type' => 'jasa', 'price' => 45000],
    ['name' => 'Jasa Service Cleaning AC Cassete 2,0 PK S/d 6,0 PK', 'type' => 'jasa', 'price' => 90000],
    ['name' => 'Jasa Service Cleaning Chiller 2,0 PK s/d 10 PK', 'type' => 'jasa', 'price' => 900000],

    // 2 Jasa Pasang/ install
    ['name' => 'Jasa Pasang/ install AC splite 0.5 PK s/d 1.0 PK', 'type' => 'jasa', 'price' => 650000],
    ['name' => 'Jasa Pasang/ install AC splite 1.5 PK s/d 2.5 PK', 'type' => 'jasa', 'price' => 750000],
    ['name' => 'Jasa Pasang/ install AC Cassete 2,5 PK s/d 6 PK', 'type' => 'jasa', 'price' => 4500000],

    // 3 Jasa Relolasi/ bongkar+pasang
    ['name' => 'Jasa Relolasi/ bongkar+pasang AC splite 0.5 PK s/d 1.0 PK', 'type' => 'jasa', 'price' => 750000],
    ['name' => 'Jasa Relolasi/ bongkar+pasang AC splite 1.5 PK s/d 2.5 PK', 'type' => 'jasa', 'price' => 850000],
    ['name' => 'Jasa Relolasi/ bongkar+pasang AC Cassete 2,5 PK s/d 6 PK', 'type' => 'jasa', 'price' => 4500000],

    // 4 Jasa bongkar + passang indoor + vacum
    ['name' => 'Jasa bongkar + passang indoor + vacum AC splite 0.5 PK s/d 1.0 PK', 'type' => 'jasa', 'price' => 385000],
    ['name' => 'Jasa bongkar + passang indoor + vacum AC splite 1.5 PK s/d 2.5 PK', 'type' => 'jasa', 'price' => 420000],
    ['name' => 'Jasa bongkar + passang indoor + vacum AC Cassete 2,5 PK s/d 6 PK', 'type' => 'jasa', 'price' => 3250000],

    // 4 Jasa bongkar + passang outdoor + vacum
    ['name' => 'Jasa bongkar + passang outdoor + vacum AC splite 0.5 PK s/d 1.0 PK', 'type' => 'jasa', 'price' => 385000],
    ['name' => 'Jasa bongkar + passang outdoor + vacum AC splite 1.5 PK s/d 2.5 PK', 'type' => 'jasa', 'price' => 425000],
    ['name' => 'Jasa bongkar + passang outdoor + vacum AC Cassete 2,5 PK s/d 6 PK', 'type' => 'jasa', 'price' => 1250000],

    // 5 Jasa bongkar AC + Tambal bobokan / perapihan
    ['name' => 'Jasa bongkar AC + Tambal bobokan / perapihan AC splite indoor & outdoor', 'type' => 'jasa', 'price' => 200000],
    ['name' => 'Jasa bongkar AC + Tambal bobokan / perapihan AC cassete indoor & outdoor', 'type' => 'jasa', 'price' => 1000000],

    // 6 Isi gas Freon R22/R32 isi 100%
    ['name' => 'Isi gas Freon R22/R32 isi 100% 0,5 PK s/d 1 PK', 'type' => 'sparepart', 'price' => 288750],
    ['name' => 'Isi gas Freon R22/R32 isi 100% 1,5PK s/d 2,5PK', 'type' => 'sparepart', 'price' => 393750],
    ['name' => 'Isi gas Freon R22/R32 isi 100% 3 PK keatas', 'type' => 'sparepart', 'price' => 131250],

    // 7 Isi gas Freon R22/R32 isi 50%
    ['name' => 'Isi gas Freon R22/R32 isi 50% 0,5 PK s/d 1 PK', 'type' => 'sparepart', 'price' => 115500],
    ['name' => 'Isi gas Freon R22/R32 isi 50% 1,5PK s/d 2,5PK', 'type' => 'sparepart', 'price' => 131250],
    ['name' => 'Isi gas Freon R22/R32 isi 50% 3 PK keatas', 'type' => 'sparepart', 'price' => 95000],

    // 8 Pipa refrigrant+ Isolasi+pasang
    ['name' => 'Pipa refrigrant+ Isolasi+pasang AC 0,5 PK & 1 PK + kabel Control', 'type' => 'sparepart', 'price' => 115000],
    ['name' => 'Pipa refrigrant+ Isolasi+pasang AC 1,5 PK & 2 PK + kabel Kontrol', 'type' => 'sparepart', 'price' => 125000],
    ['name' => 'Pipa refrigrant+ Isolasi+pasang AC 2,5 PK & 3 PK + kabel Kontrol', 'type' => 'sparepart', 'price' => 135000],
    ['name' => 'Pipa refrigrant+ Isolasi+pasang AC 3 PK s/d 6 PK + Kabel kontrol', 'type' => 'sparepart', 'price' => 150000],

    // 9 Kabel Power & MCB + Pasang
    ['name' => 'Kabel Power & MCB + Pasang Ukuran 3X1,5mm eterna', 'type' => 'sparepart', 'price' => 25000],
    ['name' => 'Kabel Power & MCB + Pasang ukuran3X2,5mm Eterna', 'type' => 'sparepart', 'price' => 28000],
    ['name' => 'Kabel Power & MCB + Pasang MCB 1 Phase 4 Amp s/d 16 Amp', 'type' => 'sparepart', 'price' => 250000],
    ['name' => 'Kabel Power & MCB + Pasang MCB 3 Phase 6 Amp s/d 16 Amp', 'type' => 'sparepart', 'price' => 375000],

    // 10 Pipa drainase +aksesories+ Isolasi + Pasang
    ['name' => 'Pipa drainase +aksesories+ Isolasi + Pasang PVC 1 Inchi + Isolsi', 'type' => 'sparepart', 'price' => 75000],
    ['name' => 'Pipa drainase +aksesories+ Isolasi + Pasang PVC 3/4 Inchi + Isolsi', 'type' => 'sparepart', 'price' => 65000],
    ['name' => 'Pipa drainase +aksesories+ Isolasi + Pasang PVC 0,5 Inchi + Isolsi', 'type' => 'sparepart', 'price' => 60000],
    ['name' => 'Pipa drainase +aksesories+ Isolasi + Pasang PVC 0,5 Inchi tanpa isolasi', 'type' => 'sparepart', 'price' => 25000],

    // 11 Kapasitor & bearing + Pasang
    ['name' => 'Kapasitor & bearing + Pasang Kapasitor fan 2MF s/d 5MF Indoor', 'type' => 'sparepart', 'price' => 157500],
    ['name' => 'Kapasitor & bearing + Pasang Kapasitor fan 2MF s/d 5MF outdoor', 'type' => 'sparepart', 'price' => 157500],
    ['name' => 'Kapasitor & bearing + Pasang Kap. kompresor 20MF s/d 30MF', 'type' => 'sparepart', 'price' => 236250],
    ['name' => 'Kapasitor & bearing + Pasang Kap. kompresor 20MF s/d 30MF + Kap. Fan 2MF', 'type' => 'sparepart', 'price' => 260000],
    ['name' => 'Kapasitor & bearing + Pasang Kap. kompresor 35MF s/d 55MF', 'type' => 'sparepart', 'price' => 262500],
    ['name' => 'Kapasitor & bearing + Pasang Kap. kompresor 35MF s/d 55MF + Kap. Fan 2MF', 'type' => 'sparepart', 'price' => 300000],
    ['name' => 'Kapasitor & bearing + Pasang Bearing motor fan AC splite', 'type' => 'sparepart', 'price' => 157500],
    ['name' => 'Kapasitor & bearing + Pasang Bearing motor fan AC cassete', 'type' => 'sparepart', 'price' => 262500],
];

foreach ($items as $item) {
    // Tambahkan vendor_id ke masing-masing item
    $itemData = array_merge($item, ['vendor_id' => $vendor->id]);

    $existing = PricelistItem::where('name', $item['name'])
        ->where('vendor_id', $vendor->id)
        ->first();

    if (!$existing) {
        $created = PricelistItem::create($itemData);
        PricelistLog::create([
            'pricelist_item_id' => $created->id,
            'user_id' => 1, // Default Admin
            'action' => 'created',
            'new_price' => $created->price,
        ]);
        echo "Created: {$item['name']} (Rp " . number_format($item['price'], 0, ',', '.') . ")\n";
    } else {
        echo "Skipped (Exists): {$item['name']}\n";
    }
}
