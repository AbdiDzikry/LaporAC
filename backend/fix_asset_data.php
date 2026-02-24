<?php

use Illuminate\Support\Facades\DB;
use App\Models\Asset;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Starting asset data migration cleanup (V2)...\n";

$keywords = ['SPLITE', 'CASSETTE', 'STANDING', 'PORTABLE'];

$assets = DB::table('assets')->get();
$updatedCount = 0;

foreach ($assets as $asset) {
    $searchString = strtoupper(($asset->name ?? '') . ' ' . ($asset->brand ?? '') . ' ' . ($asset->category ?? ''));
    $matchedK = null;

    foreach ($keywords as $k) {
        if (str_contains($searchString, $k)) {
            $matchedK = $k;
            break;
        }
    }

    $newData = [];
    if ($matchedK && ($asset->category === 'Air Conditioner' || empty($asset->category))) {
        $newData['category'] = $matchedK;
    }

    if ($asset->brand === 'Unknown') {
        $newData['brand'] = null;
    }

    if (!empty($newData)) {
        DB::table('assets')->where('id', $asset->id)->update($newData);
        $updatedCount++;
        echo "Updated Asset ID {$asset->id}: " . json_encode($newData) . "\n";
    }
}

echo "Cleanup finished. Total updated: {$updatedCount}\n";
