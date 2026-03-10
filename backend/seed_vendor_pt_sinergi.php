<?php

use App\Models\PricelistItem;
use App\Models\PricelistLog;
use App\Models\VendorProfile;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

// 1. Create or Get User for the Vendor
$user = User::firstOrCreate(
  ['email' => 'sinergi@vendor.com'],
  [
    'name' => 'PT. SYNERGI TEKHNIK MANDIRI',
    'password' => Hash::make('password123'),
    'role' => 'vendor',
  ]
);

// 2. Create or Get Vendor Profile
$vendor = VendorProfile::firstOrCreate(
  ['company_name' => 'PT. SYNERGI TEKHNIK MANDIRI'],
  [
    'user_id' => $user->id,
    'name' => 'Bpk Widjanarko',
    'address' => 'Komplek Perum Mega Regancy Blok E54 No.03 RT./RW.001/013 Ds.Sukaragam, Kec. Serang Baru, Kab. Bekasi - Jawa Barat 17330',
    'phone' => '0813 8015 2488',
    'status' => 'active'
  ]
);

if (!$vendor->user_id) {
  $vendor->update(['user_id' => $user->id]);
}

// 3. Delete existing items cleanly
PricelistLog::whereIn('pricelist_item_id', PricelistItem::where('vendor_id', $vendor->id)->pluck('id'))->delete();
PricelistItem::where('vendor_id', $vendor->id)->delete();
echo "Old items deleted. Reseeding...\n";

// 4. Data sesuai JSON logerror.txt
$data = [
  [
    'no' => 1,
    'category' => 'Jasa Service Cleaning',
    'type' => 'jasa',
    'items' => [
      ['description' => 'AC splite 0,5 PK S/d 2,5 PK', 'unit' => 'Unit', 'harga_lama' => 40000, 'harga_baru' => 45000],
      ['description' => 'AC Cassete 2,0 PK S/d 6,0 PK', 'unit' => 'Unit', 'harga_lama' => 85000, 'harga_baru' => 90000],
      ['description' => 'Chiller 2,0 PK s/d 10 PK', 'unit' => 'PK', 'harga_lama' => 900000, 'harga_baru' => 900000],
    ]
  ],
  [
    'no' => 2,
    'category' => 'Jasa Pasang/ install',
    'type' => 'jasa',
    'items' => [
      ['description' => 'AC splite 0.5 PK s/d 1.0 PK', 'unit' => 'unit', 'harga_lama' => 600000, 'harga_baru' => 650000],
      ['description' => 'AC splite 1.5 PK s/d 2.5 PK', 'unit' => 'unit', 'harga_lama' => 650000, 'harga_baru' => 750000],
      ['description' => 'AC Cassete 2,5 PK s/d 6 PK', 'unit' => 'unit', 'harga_lama' => 3500000, 'harga_baru' => 4500000],
    ]
  ],
  [
    'no' => 3,
    'category' => 'Jasa Relolasi/ bongkar+pasang',
    'type' => 'jasa',
    'items' => [
      ['description' => 'AC splite 0.5 PK s/d 1.0 PK', 'unit' => 'unit', 'harga_lama' => 650000, 'harga_baru' => 750000],
      ['description' => 'AC splite 1.5 PK s/d 2.5 PK', 'unit' => 'unit', 'harga_lama' => 750000, 'harga_baru' => 850000],
      ['description' => 'AC Cassete 2,5 PK s/d 6 PK', 'unit' => 'unit', 'harga_lama' => 4000000, 'harga_baru' => 4500000],
    ]
  ],
  [
    'no' => 4,
    'category' => 'Jasa bongkar + passang indoor + vacum',
    'type' => 'jasa',
    'items' => [
      ['description' => 'AC splite 0.5 PK s/d 1.0 PK', 'unit' => 'unit', 'harga_lama' => 350000, 'harga_baru' => 385000],
      ['description' => 'AC splite 1.5 PK s/d 2.5 PK', 'unit' => 'unit', 'harga_lama' => 380000, 'harga_baru' => 420000],
      ['description' => 'AC Cassete 2,5 PK s/d 6 PK', 'unit' => 'unit', 'harga_lama' => 3000000, 'harga_baru' => 3250000],
    ]
  ],
  [
    'no' => null,
    'category' => 'Jasa bongkar + passang outdoor + vacum',
    'type' => 'jasa',
    'items' => [
      ['description' => 'AC splite 0.5 PK s/d 1.0 PK', 'unit' => 'unit', 'harga_lama' => 350000, 'harga_baru' => 385000],
      ['description' => 'AC splite 1.5 PK s/d 2.5 PK', 'unit' => 'unit', 'harga_lama' => 390000, 'harga_baru' => 425000],
      ['description' => 'AC Cassete 2,5 PK s/d 6 PK', 'unit' => 'unit', 'harga_lama' => 1000000, 'harga_baru' => 1250000],
    ]
  ],
  [
    'no' => 5,
    'category' => 'Jasa bongkar AC + Tambal bobokan / perapihan',
    'type' => 'jasa',
    'items' => [
      ['description' => 'AC splite indoor & outdoor', 'unit' => 'unit', 'harga_lama' => 150000, 'harga_baru' => 200000],
      ['description' => 'AC cassete indoor & outdoor', 'unit' => 'unit', 'harga_lama' => 1000000, 'harga_baru' => 1000000],
    ]
  ],
  [
    'no' => 6,
    'category' => 'Isi gas Freon R22/R32 isi 100%',
    'type' => 'sparepart',
    'items' => [
      ['description' => '0,5 PK s/d 1 PK', 'unit' => 'unit', 'harga_lama' => 270000, 'harga_baru' => 288750],
      ['description' => '1,5PK s/d 2,5PK', 'unit' => 'unit', 'harga_lama' => 350000, 'harga_baru' => 393750],
      ['description' => '3 PK keatas', 'unit' => 'PK', 'harga_lama' => 120000, 'harga_baru' => 131250],
    ]
  ],
  [
    'no' => 7,
    'category' => 'Isi gas Freon R22/R32 isi 50%',
    'type' => 'sparepart',
    'items' => [
      ['description' => '0,5 PK s/d 1 PK', 'unit' => 'unit', 'harga_lama' => 110000, 'harga_baru' => 115500],
      ['description' => '1,5PK s/d 2,5PK', 'unit' => 'unit', 'harga_lama' => 120000, 'harga_baru' => 131250],
      ['description' => '3 PK keatas', 'unit' => 'PK', 'harga_lama' => 89250, 'harga_baru' => 95000],
    ]
  ],
  [
    'no' => 8,
    'category' => 'Pipa refrigerant + Isolasi + pasang',
    'type' => 'sparepart',
    'items' => [
      ['description' => 'AC 0,5 PK & 1 PK + kabel Control', 'unit' => 'meter', 'harga_lama' => 110000, 'harga_baru' => 115000],
      ['description' => 'AC 1,5 PK & 2 PK + kabel kontrol', 'unit' => 'meter', 'harga_lama' => 120000, 'harga_baru' => 125000],
      ['description' => 'AC 2,5 PK & 3 PK + kabel Kontrol', 'unit' => 'meter', 'harga_lama' => 130000, 'harga_baru' => 135000],
      ['description' => 'AC 3 PK s/d 6 PK + Kabel kontrol', 'unit' => 'meter', 'harga_lama' => 145000, 'harga_baru' => 150000],
    ]
  ],
  [
    'no' => 9,
    'category' => 'Kabel Power & MCB + Pasang',
    'type' => 'sparepart',
    'items' => [
      ['description' => 'Ukuran 3X1,5mm eterna', 'unit' => 'meter', 'harga_lama' => 23000, 'harga_baru' => 25000],
      ['description' => 'Ukuran 3X2,5mm Eterna', 'unit' => 'meter', 'harga_lama' => 25000, 'harga_baru' => 28000],
      ['description' => 'MCB 1 Phase 4 Amp s/d 16 Amp', 'unit' => 'set', 'harga_lama' => 250000, 'harga_baru' => 250000],
      ['description' => 'MCB 3 Phase 6 Amp s/d 16 Amp', 'unit' => 'set', 'harga_lama' => 350000, 'harga_baru' => 375000],
    ]
  ],
  [
    'no' => 10,
    'category' => 'Pipa drainase + aksesories + Isolasi + Pasang',
    'type' => 'sparepart',
    'items' => [
      ['description' => 'PVC 1 Inchi + Isolsi', 'unit' => 'meter', 'harga_lama' => 65000, 'harga_baru' => 75000],
      ['description' => 'PVC 3/4 Inchi + Isolsi', 'unit' => 'meter', 'harga_lama' => 50000, 'harga_baru' => 65000],
      ['description' => 'PVC 0,5 Inchi + Isolsi', 'unit' => 'meter', 'harga_lama' => 45000, 'harga_baru' => 60000],
      ['description' => 'PVC 0,5 Inchi tanpa isolasi', 'unit' => 'meter', 'harga_lama' => 23000, 'harga_baru' => 25000],
    ]
  ],
  [
    'no' => 11,
    'category' => 'Kapasitor & bearing + Pasang',
    'type' => 'sparepart',
    'items' => [
      ['description' => 'Kapasitor fan 2MF s/d 5MF Indoor', 'unit' => 'pcs', 'harga_lama' => 150000, 'harga_baru' => 157500],
      ['description' => 'Kapasitor fan 2MF s/d 5MF outdoor', 'unit' => 'pcs', 'harga_lama' => 150000, 'harga_baru' => 157500],
      ['description' => 'Kap. kompresor 20MF s/d 30MF', 'unit' => 'pcs', 'harga_lama' => 225000, 'harga_baru' => 236250],
      ['description' => 'Kap. kompresor 20MF s/d 30MF + Kap. Fan 2MF', 'unit' => 'pcs', 'harga_lama' => 250000, 'harga_baru' => 260000],
      ['description' => 'Kap. kompresor 35MF s/d 55MF', 'unit' => 'pcs', 'harga_lama' => 250000, 'harga_baru' => 262500],
      ['description' => 'Kap. kompresor 35MF s/d 55MF + Kap. Fan 2MF', 'unit' => 'pcs', 'harga_lama' => 275000, 'harga_baru' => 300000],
      ['description' => 'Bearing motor fan AC splite', 'unit' => 'pcs', 'harga_lama' => 150000, 'harga_baru' => 157500],
      ['description' => 'Bearing motor fan AC cassete', 'unit' => 'pcs', 'harga_lama' => 225000, 'harga_baru' => 262500],
    ]
  ],
];

$rowNo = 1;
foreach ($data as $group) {
  foreach ($group['items'] as $item) {
    $created = PricelistItem::create([
      'vendor_id' => $vendor->id,
      'category' => $group['category'],
      'name' => $item['description'],
      'unit' => $item['unit'],
      'type' => $group['type'],
      'old_price' => $item['harga_lama'],
      'price' => $item['harga_baru'],
    ]);

    PricelistLog::create([
      'pricelist_item_id' => $created->id,
      'user_id' => 1,
      'action' => 'created',
      'old_price' => $item['harga_lama'],
      'new_price' => $item['harga_baru'],
    ]);

    echo "OK [{$group['category']}] {$item['description']} | {$item['unit']} | Rp {$item['harga_lama']} → Rp {$item['harga_baru']}\n";
  }
}

echo "\nVendor + Pricelist PT. SYNERGI TEKHNIK MANDIRI berhasil di-seed!\n";
echo "Email login vendor: sinergi@vendor.com | Password: password123\n";
