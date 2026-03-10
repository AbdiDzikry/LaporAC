<x-mail::message>
    # SPK Baru Ditugaskan

    Halo {{ $spk->vendor->name ?? 'Vendor' }},

    Anda telah menerima Surat Perintah Kerja (SPK) baru melalui sistem LaporAC.

    **Nomor SPK:** {{ $spk->spk_number }}
    **Terkait Tiket:** #{{ $spk->ticket->id }}
    @if($spk->is_warranty_claim)
        **Tipe:** KLAIM GARANSI
    @endif
    **Status:** {{ strtoupper($spk->status) }}

    Harap segera masuk ke portal vendor LaporAC untuk melihat detail pekerjaan dan menangani SPK ini.

    <x-mail::button :url="config('app.frontend_url') . '/login'">
        Lihat SPK di Portal Vendor
    </x-mail::button>

    Terima kasih,<br>
    {{ config('app.name') }}
</x-mail::message>