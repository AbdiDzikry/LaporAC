<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Berita Acara Kolektif</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 11px;
            color: #333;
            line-height: 1.5;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 12px;
            margin-bottom: 15px;
        }
        .header h1 { margin: 0; font-size: 16px; text-transform: uppercase; }
        .header p { margin: 4px 0 0; font-size: 11px; color: #666; }
        .document-title {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 15px;
            text-transform: uppercase;
        }
        .intro-text { text-align: justify; margin-bottom: 15px; }
        table.spk-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 10px;
        }
        table.spk-table th, table.spk-table td {
            border: 1px solid #999;
            padding: 6px 8px;
            text-align: left;
        }
        table.spk-table th {
            background-color: #e5e7eb;
            font-weight: bold;
            text-align: center;
            font-size: 10px;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .section-title {
            font-weight: bold;
            font-size: 12px;
            margin: 20px 0 8px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 4px;
        }
        .summary-box {
            border: 1px solid #333;
            padding: 10px;
            margin-top: 15px;
            background-color: #fafafa;
        }
        .summary-box table { width: 100%; }
        .summary-box td { padding: 3px 0; }
        .signatures { width: 100%; margin-top: 50px; }
        .signatures td {
            text-align: center;
            width: 33.33%;
            vertical-align: bottom;
            padding-top: 50px;
        }
        .signatures .name { font-weight: bold; text-decoration: underline; }
        .signatures .role { font-size: 10px; color: #666; }
        .page-break { page-break-after: always; }
        .badge-warranty {
            display: inline-block;
            padding: 2px 5px;
            border-radius: 3px;
            background-color: #f59e0b;
            color: #fff;
            font-weight: bold;
            font-size: 9px;
        }
        .notes { font-style: italic; color: #555; font-size: 10px; }
    </style>
</head>
<body>

    <!-- HEADER -->
    <div class="header">
        <h1>Sistem Informasi LaporAC (Layanan Operasional AC)</h1>
        <p>Gedung Administrasi Umum - PT PLN (Persero)</p>
    </div>

    <div class="document-title">
        BERITA ACARA PELAKSANAAN PEKERJAAN
        <br>
        <span style="font-size: 11px; font-weight: normal;">
            Tanggal Cetak: {{ now()->format('d F Y') }}
        </span>
    </div>

    <p class="intro-text">
        Berikut adalah Berita Acara pelaksanaan pekerjaan perbaikan AC yang telah diselesaikan dan diverifikasi.
        Dokumen ini membandingkan data dari Surat Perintah Kerja (SPK) dengan realisasi pekerjaan yang dilakukan oleh Vendor.
    </p>

    <!-- RINGKASAN -->
    <div class="section-title">Ringkasan ({{ $spks->count() }} SPK)</div>

    <table class="spk-table">
        <thead>
            <tr>
                <th width="5%">No</th>
                <th width="14%">No. SPK</th>
                <th width="12%">Tgl SPK</th>
                <th width="15%">Vendor</th>
                <th width="14%">Unit AC (SKU)</th>
                <th width="12%">Lokasi</th>
                <th width="14%">Total Biaya</th>
                <th width="14%">Tgl Selesai</th>
            </tr>
        </thead>
        <tbody>
            @php $grandTotal = 0; @endphp
            @foreach($spks as $idx => $spk)
                @php $grandTotal += $spk->is_warranty_claim ? 0 : $spk->total_cost; @endphp
                <tr>
                    <td class="text-center">{{ $idx + 1 }}</td>
                    <td>{{ $spk->spk_number }}</td>
                    <td>{{ \Carbon\Carbon::parse($spk->created_at)->format('d/m/Y') }}</td>
                    <td>{{ $spk->vendor->name ?? '-' }}</td>
                    <td>{{ $spk->ticket->asset->sku ?? '-' }}</td>
                    <td>{{ $spk->ticket->asset->location ?? '-' }}</td>
                    <td class="text-right">
                        @if($spk->is_warranty_claim)
                            <span class="badge-warranty">GARANSI</span>
                        @else
                            Rp {{ number_format($spk->total_cost, 0, ',', '.') }}
                        @endif
                    </td>
                    <td>{{ $spk->verified_at ? \Carbon\Carbon::parse($spk->verified_at)->format('d/m/Y') : '-' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="summary-box">
        <table>
            <tr>
                <td><strong>Total SPK Pekerjaan:</strong></td>
                <td class="text-right"><strong>{{ $spks->count() }} pekerjaan</strong></td>
            </tr>
            <tr>
                <td><strong>Grand Total Biaya:</strong></td>
                <td class="text-right" style="font-size: 13px;"><strong>Rp {{ number_format($grandTotal, 0, ',', '.') }}</strong></td>
            </tr>
        </table>
    </div>

    <!-- DETAIL PER SPK -->
    @foreach($spks as $idx => $spk)
        <div class="page-break"></div>

        <div class="header">
            <h1>Sistem Informasi LaporAC</h1>
            <p>Detail Berita Acara — SPK {{ $spk->spk_number }}</p>
        </div>

        <div class="section-title">A. Data SPK (Perintah Kerja)</div>
        <table class="spk-table">
            <tr>
                <td width="25%" style="font-weight:bold; background:#f5f5f5;">No. SPK</td>
                <td>{{ $spk->spk_number }}</td>
                <td width="20%" style="font-weight:bold; background:#f5f5f5;">Tanggal SPK</td>
                <td>{{ \Carbon\Carbon::parse($spk->created_at)->format('d F Y') }}</td>
            </tr>
            <tr>
                <td style="font-weight:bold; background:#f5f5f5;">Vendor Pelaksana</td>
                <td>{{ $spk->vendor->name ?? '-' }}</td>
                <td style="font-weight:bold; background:#f5f5f5;">Klaim Garansi</td>
                <td>{{ $spk->is_warranty_claim ? 'Ya' : 'Tidak' }}</td>
            </tr>
            <tr>
                <td style="font-weight:bold; background:#f5f5f5;">Unit AC (SKU)</td>
                <td>{{ $spk->ticket->asset->sku ?? '-' }}</td>
                <td style="font-weight:bold; background:#f5f5f5;">Lokasi</td>
                <td>{{ $spk->ticket->asset->location ?? '-' }}</td>
            </tr>
            <tr>
                <td style="font-weight:bold; background:#f5f5f5;">Kategori / Merk</td>
                <td colspan="3">{{ $spk->ticket->asset->category ?? '-' }} / {{ $spk->ticket->asset->brand ?? '-' }} — {{ $spk->ticket->asset->pk ?? '-' }} PK</td>
            </tr>
            <tr>
                <td style="font-weight:bold; background:#f5f5f5;">Keluhan Dilaporkan</td>
                <td colspan="3">{{ $spk->ticket->description ?? '-' }}</td>
            </tr>
        </table>

        <div class="section-title">B. Realisasi Pekerjaan (Berita Acara)</div>

        @if($spk->items && count($spk->items) > 0)
            <table class="spk-table">
                <thead>
                    <tr>
                        <th width="5%">No</th>
                        <th width="45%">Deskripsi Pekerjaan / Sparepart</th>
                        <th width="10%">Qty</th>
                        <th width="20%">Harga Satuan</th>
                        <th width="20%">Total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($spk->items as $iIdx => $item)
                        <tr>
                            <td class="text-center">{{ $iIdx + 1 }}</td>
                            <td>{{ $item->item_name }}</td>
                            <td class="text-center">{{ $item->qty }}</td>
                            <td class="text-right">Rp {{ number_format($item->price_per_item, 0, ',', '.') }}</td>
                            <td class="text-right">Rp {{ number_format($item->total_price, 0, ',', '.') }}</td>
                        </tr>
                    @endforeach
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="4" class="text-right" style="font-weight:bold;">Total Biaya:</td>
                        <td class="text-right" style="font-weight:bold;">
                            @if($spk->is_warranty_claim)
                                <s>Rp {{ number_format($spk->total_cost, 0, ',', '.') }}</s> → Rp 0 (Garansi)
                            @else
                                Rp {{ number_format($spk->total_cost, 0, ',', '.') }}
                            @endif
                        </td>
                    </tr>
                </tfoot>
            </table>
        @else
            <p style="text-align:center; color:#999;">— Tidak ada rincian item pekerjaan —</p>
        @endif

        <p><strong>Catatan Penyelesaian Vendor:</strong></p>
        <p class="notes">"{{ $spk->completion_notes ?? 'Tidak ada catatan.' }}"</p>

        <p style="margin-top: 20px;">
            Demikian Berita Acara ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.
        </p>

        <table class="signatures">
            <tr>
                <td>
                    <div class="name">{{ $spk->vendor->name ?? '.....................' }}</div>
                    <div class="role">Pihak Pelaksana (Vendor)</div>
                </td>
                <td></td>
                <td>
                    <div class="name">______________________</div>
                    <div class="role">Pihak Pemeriksa (Admin)</div>
                </td>
            </tr>
        </table>
    @endforeach

</body>
</html>
