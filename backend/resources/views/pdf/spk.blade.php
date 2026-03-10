<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>Surat Perintah Kerja (SPK)</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 12px;
            color: #333;
            line-height: 1.5;
            margin: 0;
            padding: 20px;
        }

        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
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
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 20px;
            text-transform: uppercase;
        }

        table.info-table {
            width: 100%;
            margin-bottom: 20px;
        }

        table.info-table td {
            vertical-align: top;
            padding: 3px 0;
        }

        table.info-table td.label {
            width: 25%;
            font-weight: bold;
        }

        table.info-table td.separator {
            width: 2%;
        }

        table.info-table td.value {
            width: 73%;
        }

        table.items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        table.items-table th,
        table.items-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }

        table.items-table th {
            background-color: #f5f5f5;
            font-weight: bold;
        }

        table.items-table .text-right {
            text-align: right;
        }

        table.items-table .text-center {
            text-align: center;
        }

        .summary-box {
            float: right;
            border: 1px solid #ddd;
            padding: 10px;
            width: 300px;
            background-color: #fafafa;
            margin-bottom: 30px;
        }

        .clear {
            clear: both;
        }

        .signatures {
            width: 100%;
            margin-top: 50px;
        }

        .signatures td {
            text-align: center;
            width: 33.33%;
            vertical-align: bottom;
            padding-top: 60px;
        }

        .signatures .name {
            font-weight: bold;
            text-decoration: underline;
        }

        .signatures .role {
            font-size: 11px;
            color: #666;
        }

        .page-break {
            page-break-after: always;
        }

        .badge {
            display: inline-block;
            padding: 3px 6px;
            border-radius: 3px;
            color: #fff;
            font-weight: bold;
            font-size: 10px;
        }

        .badge-warranty {
            background-color: #f59e0b;
            /* amber-500 */
        }

        .notes-section {
            margin-top: 20px;
            padding: 15px;
            background-color: #f9f9f9;
            border-left: 4px solid #3b82f6;
        }
    </style>
</head>

<body>

    <!-- ======== HALAMAN 1: SPK ======== -->
    <div class="header">
        <h1>Sistem Informasi LaporAC (Layanan Operasional AC)</h1>
        <p>Gedung Administrasi Umum - PT PLN (Persero)</p>
    </div>

    <div class="document-title">
        SURAT PERINTAH KERJA (SPK)
        <br>
        <span style="font-size: 12px; font-weight: normal;">No: {{ $spk->spk_number }}</span>
    </div>

    <div style="float: right;">
        @if($spk->is_warranty_claim)
            <span class="badge badge-warranty">KLAIM GARANSI</span>
        @endif
    </div>
    <div class="clear"></div>

    <table class="info-table">
        <tr>
            <td class="label">Tanggal SPK</td>
            <td class="separator">:</td>
            <td class="value">{{ \Carbon\Carbon::parse($spk->created_at)->format('d F Y') }}</td>
        </tr>
        <tr>
            <td class="label">Nama Vendor Pelaksana</td>
            <td class="separator">:</td>
            <td class="value font-bold">{{ $spk->vendor->name ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td class="label">Mengerjakan</td>
            <td class="separator">:</td>
            <td class="value">Perbaikan Aset (Keluhan Tiket #{{ $spk->ticket_id }})</td>
        </tr>
        <tr>
            <td class="label">Deskripsi Laporan</td>
            <td class="separator">:</td>
            <td class="value">{{ $spk->ticket->description ?? '-' }}</td>
        </tr>
    </table>

    <h3 style="margin-bottom: 5px;">Aset yang Dikerjakan</h3>
    <table class="items-table">
        <tr>
            <th width="20%">No Aset (SKU)</th>
            <th width="35%">Tipe / Merk Aset</th>
            <th width="25%">Lokasi</th>
            <th width="20%">Kapasitas</th>
        </tr>
        <tr>
            <td>{{ $spk->ticket->asset->sku ?? '-' }}</td>
            <td>{{ $spk->ticket->asset->category ?? '-' }} / {{ $spk->ticket->asset->brand ?? '-' }}</td>
            <td>{{ $spk->ticket->asset->location ?? '-' }}</td>
            <td>{{ $spk->ticket->asset->pk ?? '-' }}</td>
        </tr>
    </table>

    <div class="notes-section">
        <strong>Ketentuan Perbaikan:</strong>
        <ol style="margin-top: 5px; padding-left: 20px;">
            <li>Pekerjaan harus diselesaikan sesuai dengan standar layanan perbaikan AC.</li>
            <li>Apabila memerlukan penggantian sparepart, harap diajukan melalui sistem Pricelist (Katalog Harga) yang
                disetujui ADMIN.</li>
            <li>Hasil pekerjaan dituangkan dalam Berita Acara Serah Terima (BAST).</li>
        </ol>
    </div>

    <table class="signatures" style="margin-top: 80px;">
        <tr>
            <td>
                <div class="name">______________________</div>
                <div class="role">Admin LaporAC</div>
            </td>
            <td></td>
            <td>
                <div class="name">______________________</div>
                <div class="role">Perwakilan Vendor</div>
            </td>
        </tr>
    </table>

    <!-- ======== PAGE BREAK ======== -->
    <div class="page-break"></div>

    <!-- ======== HALAMAN 2: BAST ======== -->
    <div class="header">
        <h1>Sistem Informasi LaporAC (Layanan Operasional AC)</h1>
        <p>Gedung Administrasi Umum - PT PLN (Persero)</p>
    </div>

    <div class="document-title">
        BERITA ACARA SERAH TERIMA (BAST) & RINCIAN BIAYA
        <br>
        <span style="font-size: 12px; font-weight: normal;">Reff SPK: {{ $spk->spk_number }}</span>
    </div>

    <p style="text-align: justify;">
        Pada hari ini
        <strong>{{ $spk->updated_at ? \Carbon\Carbon::parse($spk->updated_at)->translatedFormat('l') : '......' }}</strong>,
        tanggal
        <strong>{{ $spk->updated_at ? \Carbon\Carbon::parse($spk->updated_at)->format('d F Y') : '......' }}</strong>,
        telah diselesaikan pekerjaan perbaikan AC oleh <strong>{{ $spk->vendor->name ?? 'Vendor' }}</strong> sesuai
        dengan Surat Perintah Kerja (SPK) Nomor <strong>{{ $spk->spk_number }}</strong>.
    </p>

    <h3 style="margin-bottom: 5px; margin-top: 20px;">Rincian Tindakan / Sparepart</h3>

    @if(isset($spk->items) && count($spk->items) > 0)
        <table class="items-table">
            <thead>
                <tr>
                    <th width="5%" class="text-center">No</th>
                    <th width="45%">Deskripsi Pekerjaan / Nama Barang</th>
                    <th width="10%" class="text-center">Qty</th>
                    <th width="20%" class="text-right">Harga Satuan (Rp)</th>
                    <th width="20%" class="text-right">Total (Rp)</th>
                </tr>
            </thead>
            <tbody>
                @foreach($spk->items as $index => $item)
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td>{{ $item->item_name }}</td>
                        <td class="text-center">{{ $item->qty }}</td>
                        <td class="text-right">{{ number_format($item->price_per_item, 0, ',', '.') }}</td>
                        <td class="text-right">{{ number_format($item->total_price, 0, ',', '.') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div class="summary-box">
            <table width="100%">
                <tr>
                    <td><strong>Total Biaya:</strong></td>
                    <td class="text-right font-bold" style="font-size: 14px;">Rp
                        {{ number_format($spk->total_cost, 0, ',', '.') }}</td>
                </tr>
                @if($spk->is_warranty_claim)
                    <tr>
                        <td colspan="2" style="color:red; font-size:11px; padding-top: 5px;">*Terklaim Garansi (Total Tagihan Rp
                            0)</td>
                    </tr>
                @endif
            </table>
        </div>
        <div class="clear"></div>
    @else
        <div
            style="background-color: #f5f5f5; padding: 15px; text-align: center; border: 1px dashed #ccc; margin-bottom: 20px;">
            Belum ada rincian invoice/sparepart yang dimasukkan.
        </div>
    @endif

    <div class="notes-section">
        <strong>Catatan Penyelesaian (Dari Vendor):</strong>
        <p style="margin-top: 5px; font-style: italic;">
            "{{ $spk->completion_notes ?? 'Tidak ada catatan khusus.' }}"
        </p>
    </div>

    <p style="margin-top: 30px;">
        Demikian Berita Acara ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.
    </p>

    <table class="signatures" style="margin-top: 50px;">
        <tr>
            <td>
                <div class="name">{{ $spk->vendor->name ?? '.......................' }}</div>
                <div class="role">Pihak Pelaksana (Vendor)</div>
            </td>
            <td></td>
            <td>
                <div class="name">{{ $spk->ticket->validatedBy->full_name ?? '.......................' }}</div>
                <div class="role">Pihak Pemeriksa (Admin PT PLN)</div>
            </td>
        </tr>
    </table>

</body>

</html>