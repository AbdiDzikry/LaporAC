<?php

namespace App\Mail;

use App\Models\User;
use App\Models\VendorProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VendorCredentialUpdateMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $user;
    public $vendorProfile;
    public $plainPassword;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, VendorProfile $vendorProfile, ?string $plainPassword = null)
    {
        $this->user = $user;
        $this->vendorProfile = $vendorProfile;
        $this->plainPassword = $plainPassword;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Pembaruan Akses Portal Vendor LaporAC Anda',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.vendor-credential-update',
        );
    }
}
