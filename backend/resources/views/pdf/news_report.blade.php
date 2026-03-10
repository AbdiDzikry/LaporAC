<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>Berita Acara & Tagihan</title>
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

        .notes-section {
            margin-top: 20px;
            padding: 15px;
            background-color: #f9f9f9;
            border-left: 4px solid #3b82f6;
        }
    </style>
</head>

<body>

    <div class="header">
        <h1>Sistem Informasi LaporAC (Layanan Operasional AC)</h1>
        <p>Gedung Administrasi Umum - PT PLN (Persero)</p>
    </div>

    <div class="document-title">
        BERITA ACARA SERAH TERIMA (BAST) & INVOICE
        <br>
        <span style="font-size: 12px; font-weight: normal;">No BA: {{ $newsReport->document_number }} | Reff SPK:
            {{ $newsReport->spk->spk_number ?? '-' }}</span>
    </div>

    <p style="text-align: justify;">
        Pada hari ini
        <strong>{{ $newsReport->completion_date ? \Carbon\Carbon::parse($newsReport->completion_date)->translatedFormat('l') : '......' }}</strong>,
        tanggal
        <strong>{{ $newsReport->completion_date ? \Carbon\Carbon::parse($newsReport->completion_date)->format('d F Y') : '......' }}</strong>,
        telah diselesaikan pekerjaan perbaikan AC oleh
        <strong>{{ $newsReport->spk->vendor->vendorProfile->company_name ?? $newsReport->spk->vendor->name ?? 'Vendor' }}</strong>
        sesuai dengan Surat Perintah Kerja (SPK) Nomor <strong>{{ $newsReport->spk->spk_number ?? '-' }}</strong>.
    </p>

    <h3 style="margin-bottom: 5px; margin-top: 20px;">Rincian Tindakan / Sparepart</h3>

    @if(isset($newsReport->spk->items) && count($newsReport->spk->items) > 0)
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
                @foreach($newsReport->spk->items as $index => $item)
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
                        {{ number_format($newsReport->total_cost, 0, ',', '.') }}</td>
                </tr>
                @if($newsReport->is_warranty_claim)
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
            "{{ $newsReport->work_description ?? 'Tidak ada catatan khusus.' }}"
        </p>
    </div>

    <p style="margin-top: 30px;">
        Demikian Berita Acara ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.
    </p>

    <table class="signatures" style="margin-top: 50px;">
        <tr>
            <td>
                <div class="name">{{ $newsReport->vendorSignedBy->name ?? '.......................' }}</div>
                <div class="role">Pihak Pelaksana (Vendor)</div>
            </td>
            <td></td>
            <td>
                <div class="name">{{ $newsReport->approvedBy->name ?? '.......................' }}</div>
                <div class="role">Pihak Pemeriksa (Admin PT PLN)</div>
            </td>
        </tr>
    </table>

</body>

</html>