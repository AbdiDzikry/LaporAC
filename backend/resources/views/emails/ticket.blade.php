<x-mail::message>
    # Status Tiket Laporan Terkini

    Halo,

    Tiket Laporan LaporAC bernomor **#{{ $ticket->id }}** telah diupdate statusnya.

    **Status Saat Ini:** {{ strtoupper($ticket->status) }}
    **Aset Terkait:** {{ $ticket->asset->name ?? 'N/A' }} ({{ $ticket->asset->location ?? '' }})
    **Keluhan:** {{ $ticket->issue_description }}

    Terima kasih telah menggunakan layanan LaporAC.

    <x-mail::button :url="config('app.frontend_url') . '/ticket/' . $ticket->id">
        Lihat Detail Tiket
    </x-mail::button>

    Hormat kami,<br>
    Tim Maintenance LaporAC
</x-mail::message>