<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Asset;

class AssetPart2Seeder extends Seeder
{
    public function run()
    {
        $assets = [
            ['sku' => 'GB033', 'location' => 'OFFICE 4W', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '1.5 PK', 'status' => 'good'],
            ['sku' => 'GB034', 'location' => 'OFFICE 4W', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '1 PK', 'status' => 'good'],
            ['sku' => 'GB035', 'location' => 'OFFICE 4W', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GB036', 'location' => 'OFFICE 4 W', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GB037', 'location' => 'SAP ( INVENTORY )', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GB038', 'location' => 'DOJO MTC', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GB039', 'location' => 'DOJO', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GB040', 'location' => 'OFFICE QUALITY BARU', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GB041', 'location' => 'OFFICE QUALITY BARU', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GB042', 'location' => 'OFFICE QUALITY BARU', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '1 PK', 'status' => 'good'],
            ['sku' => 'GB043', 'location' => 'OFFICE QUALITY BARU', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '1 PK', 'status' => 'good'],

            ['sku' => 'GC001', 'location' => 'OFFICE 4W FG', 'brand' => 'DAIKIN', 'category' => 'CASSETTE', 'pk' => '3 PK', 'status' => 'good'],
            ['sku' => 'GC002', 'location' => 'OFFICE 4W FG', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GC003', 'location' => 'R. GR ( INVENTORY )', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GC004', 'location' => 'R. PLATING CED', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '1 PK', 'status' => 'good'],
            ['sku' => 'GC005', 'location' => 'R. PLATING CED', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GC006', 'location' => 'R. PLATING CED', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GC007', 'location' => 'R. CHEMICAL ( CED )', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GC008', 'location' => 'R. INCOMING ( CED )', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '1 PK', 'status' => 'good'],
            ['sku' => 'GC009', 'location' => 'R. PANEL GEDUNG PLATTING', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GC010', 'location' => 'PANEL CED', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GC011', 'location' => 'KOPERASI GEDUNG BARU', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GC012', 'location' => 'R. CHEMICAL ( CED )', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GC013', 'location' => 'R. CHEMICAL ( CED )', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],

            ['sku' => 'GD001', 'location' => 'R. OBEYA ( ENG 4W )', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GD002', 'location' => 'R. OBEYA ( ENG 4W )', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GD003', 'location' => 'SERVER ENG 4W', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '1 PK', 'status' => 'good'],
            ['sku' => 'GD004', 'location' => 'R. OBEYA ( ENG 4W )', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '1 PK', 'status' => 'good'],
            ['sku' => 'GD005', 'location' => 'R. OFFICE ENG 4W', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '1 PK', 'status' => 'good'],
            ['sku' => 'GD006', 'location' => 'DESIGN ENG 4W', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '1 PK', 'status' => 'good'],
            ['sku' => 'GD007', 'location' => 'PP MEMBER ENG 4W', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '1 PK', 'status' => 'good'],
            ['sku' => 'GD008', 'location' => 'QC ENG 4W', 'brand' => 'DAIKIN', 'category' => 'CASSETTE', 'pk' => '5 PK', 'status' => 'good'],
            ['sku' => 'GD009', 'location' => 'TOOLING DEV ENG 4W', 'brand' => 'DAIKIN', 'category' => 'CASSETTE', 'pk' => '5 PK', 'status' => 'good'],
            ['sku' => 'GD010', 'location' => 'FAST ENG 4W', 'brand' => 'DAIKIN', 'category' => 'CASSETTE', 'pk' => '5 PK', 'status' => 'good'],
            ['sku' => 'GD011', 'location' => 'R. ENG 4W', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '1.5 PK', 'status' => 'good'],
            ['sku' => 'GD012', 'location' => 'R. ENG 4W', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GD013', 'location' => 'R. ENG 4W', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '1 PK', 'status' => 'good'],
            ['sku' => 'GD014', 'location' => 'R. ENG 4W', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GD015', 'location' => 'R. PE FAST', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GD016', 'location' => 'OFFICE PE FAST', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GD017', 'location' => 'R. OFFICE FAST DOKING', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GD018', 'location' => 'R. OFFICE FAST DOKING', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '1 PK', 'status' => 'good'],
            ['sku' => 'GD019', 'location' => 'R. OFFICE FAST DOKING', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '1 PK', 'status' => 'good'],
            ['sku' => 'GD020', 'location' => 'R. OFFICE FAST DOKING', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GD021', 'location' => 'R. PANEL PLATTING FAST', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '1 PK', 'status' => 'good'],
            ['sku' => 'GD022', 'location' => 'R. PANEL PLATTING FAST', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '1 PK', 'status' => 'good'],
            ['sku' => 'GD023', 'location' => 'R. LAB PLATTING FAST', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '1.5 PK', 'status' => 'good'],
            ['sku' => 'GD024', 'location' => 'R. PANEL TREATMENT ( FAST )', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GD025', 'location' => 'R. PANEL TREATMENT ( FAST )', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '1 PK', 'status' => 'good'],
            ['sku' => 'GD026', 'location' => 'R. PANEL TREATMENT ( FAST )', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '1 PK', 'status' => 'good'],
            ['sku' => 'GD027', 'location' => 'R. PANEL TREATMENT ( FAST )', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GD028', 'location' => 'R. PANEL TREATMENT ( FAST )', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GD029', 'location' => 'R. PANEL TREATMENT ( FAST )', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GD030', 'location' => 'R. PANEL CHILLER BATRE PAC', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '1 PK', 'status' => 'good'],
            ['sku' => 'GD031', 'location' => 'PENDINGIN DUCTING HT 01', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GD032', 'location' => 'R. ENG 4W', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],

            ['sku' => 'GE001', 'location' => 'R. OFFICE AZP', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GE002', 'location' => 'R. OFFICE AZP', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GE003', 'location' => 'PANEL AZP', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GE004', 'location' => 'OFFICE LAB AZP', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '1 PK', 'status' => 'good'],
            ['sku' => 'GE005', 'location' => 'OFFICE AZP', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '1 PK', 'status' => 'good'],

            ['sku' => 'GF001', 'location' => 'OFFICE HYUNDAI', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GF002', 'location' => 'OFFICE HYUNDAI', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '1 PK', 'status' => 'good'],
            ['sku' => 'GF003', 'location' => 'OFFICE HYUNDAI', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '1 PK', 'status' => 'good'],

            ['sku' => 'GG001', 'location' => 'OFFICE D 03', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'GG002', 'location' => 'OFFICE D 03', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],

            ['sku' => '3W001', 'location' => 'OFFICE ATAS', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => '3W002', 'location' => 'OFFICE ATAS', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => '3W003', 'location' => 'OFFICE ATAS', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => '3W004', 'location' => 'OFFICE ATAS', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => '3W005', 'location' => 'OFFICE ATAS', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],

            ['sku' => 'AICOOL1', 'location' => 'GEDUNG C', 'brand' => 'DAIKIN', 'category' => 'STANDING', 'pk' => '15 PK', 'status' => 'good'],
            ['sku' => 'AICOOL2', 'location' => 'GEDUNG C', 'brand' => 'DAIKIN', 'category' => 'STANDING', 'pk' => '15 PK', 'status' => 'good'],
            ['sku' => 'AICOOL3', 'location' => 'GEDUNG C', 'brand' => 'DAIKIN', 'category' => 'STANDING', 'pk' => '15 PK', 'status' => 'good'],

            ['sku' => 'DC01', 'location' => 'OFFICE DCI', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'DC02', 'location' => 'OFFICE DCI', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'DC03', 'location' => 'OFFICE DCI', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good'],
            ['sku' => 'DC04', 'location' => 'OFFICE DCI', 'brand' => 'DAIKIN', 'category' => 'SPLITE', 'pk' => '2 PK', 'status' => 'good']
        ];

        foreach ($assets as $a) {
            $name = "AC {$a['category']} {$a['pk']} {$a['brand']} {$a['location']} - {$a['sku']}";
            Asset::updateOrCreate(
                ['sku' => $a['sku']],
                [
                    'name' => $name,
                    'brand' => $a['brand'],
                    'category' => $a['category'],
                    'location' => $a['location'],
                    'pk' => $a['pk'],
                    'status' => $a['status']
                ]
            );
        }
    }
}
