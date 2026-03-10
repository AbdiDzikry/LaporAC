<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>Rekap Histori Global</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 11px;
            color: #333;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
        }

        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }

        .header h1 {
            margin: 0;
            font-size: 18px;
            text-transform: uppercase;
        }

        .header p {
            margin: 5px 0 0;
            font-size: 12px;
            color: #666;
        }

        .document-title {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 20px;
            text-transform: uppercase;
        }

        .section-title {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 10px;
            margin-top: 30px;
            background-color: #f0f0f0;
            padding: 5px;
            border-left: 3px solid #333;
        }

        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 10px;
        }

        table.data-table th,
        table.data-table td {
            border: 1px solid #ddd;
            padding: 6px;
            text-align: left;
        }

        table.data-table th {
            background-color: #f5f5f5;
            font-weight: bold;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .badge {
            display: inline-block;
            padding: 2px 4px;
            border-radius: 3px;
            color: #fff;
            font-size: 9px;
            background-color: #666;
            text-transform: uppercase;
        }

        .badge-success {
            background-color: #10b981;
        }

        .page-break {
            page-break-after: always;
        }
    </style>
</head>

<body>

    <div class="header">
        <h1>Sistem Informasi LaporAC (Layanan Operasional AC)</h1>
        <p>Gedung Administrasi Umum - PT PLN (Persero)</p>
    </div>

    <div class="document-title">
        REKAPITULASI HISTORI PERBAIKAN & MAINTENANCE AC
        <br>
        <span style="font-size: 10px; font-weight: normal;">Dicetak pada: {{ now()->format('d F Y H:i') }}</span>
    </div>

    <!-- TIKET PERBAIKAN -->
    <div class="section-title">A. HISTORI TIKET PERBAIKAN (KELUHAN)</div>
    @if(count($tickets) > 0)
        <table class="data-table">
            <thead>
                <tr>
                    <th width="5%" class="text-center">No</th>
                    <th width="10%">No. Tiket</th>
                    <th width="15%">Aset / Lokasi</th>
                    <th width="20%">Keluhan</th>
                    <th width="15%">Penyelesaian</th>
                    <th width="15%">Pelaksana</th>
                    <th width="10%">Tgl Selesai</th>
                    <th width="10%" class="text-right">Biaya (Rp)</th>
                </tr>
            </thead>
            <tbody>
                @foreach($tickets as $index => $t)
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td>#{{ $t->id }}</td>
                        <td>
                            {{ $t->asset->name ?? '-' }}<br>
                            <span style="color:#666">{{ $t->asset->location ?? '-' }}</span>
                        </td>
                        <td>{{ \Illuminate\Support\Str::limit($t->description, 50) }}</td>
                        <td>
                            @if($t->status === 'resolved')
                                Ditangani Internal
                            @else
                                Vendor (SPK)
                            @endif
                        </td>
                        <td>{{ $t->spk ? ($t->spk->vendor->name ?? 'Vendor') : 'Teknisi Internal' }}</td>
                        <td>{{ $t->completed_at ? \Carbon\Carbon::parse($t->completed_at)->format('d/m/Y') : \Carbon\Carbon::parse($t->updated_at)->format('d/m/Y') }}
                        </td>
                        <td class="text-right">
                            @if($t->spk)
                                {{ $t->spk->is_warranty_claim ? '0 (Garansi)' : number_format($t->spk->total_cost, 0, ',', '.') }}
                            @else
                                -
                            @endif
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <p style="font-size:10px; color:#666;">Belum ada histori tiket perbaikan.</p>
    @endif

    <!-- MAINTENANCE RUTIN -->
    <div class="section-title" style="margin-top: 40px;">B. HISTORI JADWAL MAINTENANCE RUTIN</div>
    @if(count($maintenance) > 0)
        <table class="data-table">
            <thead>
                <tr>
                    <th width="5%" class="text-center">No</th>
                    <th width="25%">Aset / Tipe / Lokasi</th>
                    <th width="15%">Tgl Jadwal Target</th>
                    <th width="15%">Tgl Realisasi</th>
                    <th width="15%">Status</th>
                    <th width="25%">Catatan Teknisi</th>
                </tr>
            </thead>
            <tbody>
                @foreach($maintenance as $index => $m)
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td>
                            <strong>{{ $m->asset->name ?? '-' }}</strong><br>
                            <span style="color:#666">{{ $m->asset->sku ?? '-' }} | {{ $m->asset->location ?? '-' }}</span>
                        </td>
                        <td>{{ \Carbon\Carbon::parse($m->scheduled_date)->format('d/m/Y') }}</td>
                        <td>{{ $m->completed_date ? \Carbon\Carbon::parse($m->completed_date)->format('d/m/Y') : '-' }}</td>
                        <td>
                            <span class="badge {{ $m->status === 'completed' ? 'badge-success' : '' }}">
                                {{ strtoupper($m->status) }}
                            </span>
                        </td>
                        <td>{{ \Illuminate\Support\Str::limit($m->technician_notes ?? '-', 50) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <p style="font-size:10px; color:#666;">Belum ada histori jadwal maintenance rutin.</p>
    @endif

</body>

</html>