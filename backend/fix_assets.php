<?php
use App\Models\Asset;

$assets = Asset::all();
$updated = 0;

foreach ($assets as $a) {
    // Extract Category and PK from name like "AC SPLITE 2 PK - RA 001"
    if (preg_match('/AC\s+([A-Z]+)\s+([\d\.]+\s*PK)/i', $a->name, $matches)) {
        $a->category = strtoupper($matches[1]);
        $a->pk = strtoupper($matches[2]);
    } else if (preg_match('/AC\s+([A-Z]+)\s+-/i', $a->name, $matches)) {
        // e.g., "AC CASSETTE - XY"
        $a->category = strtoupper($matches[1]);
    }

    // Since many were generically assigned 'Air Conditioner', revert to extracted values

    // Fix status mapping: previously seeded 'active' -> my script changed to 'maintenance'. 
    // They should be 'good' because normal operational status is 'good'.
    if ($a->status === 'maintenance' || $a->status === 'active') {
        $a->status = 'good';
    }

    $a->save();
    $updated++;
}

echo "Updated $updated assets.\n";
