<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class NewsReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_number',
        'spk_id',
        'asset_id',
        'ticket_id',
        'title',
        'description',
        'report_date',
        'completion_date',
        'total_cost',
        'is_warranty_claim',
        'work_description',
        'parts_replaced',
        'recommendations',
        'generated_by',
        'approved_by',
        'vendor_signed_by',
        'vendor_signed_at',
        'approved_at',
        'pdf_path',
        'status',
    ];

    protected $casts = [
        'report_date' => 'date',
        'completion_date' => 'date',
        'total_cost' => 'decimal:2',
        'is_warranty_claim' => 'boolean',
        'parts_replaced' => 'array',
        'vendor_signed_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->document_number)) {
                $model->document_number = 'BA-' . date('Ymd') . '-' . Str::upper(Str::random(6));
            }
        });
    }

    public function spk()
    {
        return $this->belongsTo(Spk::class);
    }

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    public function generatedBy()
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function vendorSignedBy()
    {
        return $this->belongsTo(User::class, 'vendor_signed_by');
    }

    /**
     * Generate Berita Acara from SPK
     */
    public static function createFromSpk(Spk $spk, int $generatedBy): self
    {
        $ticket = $spk->ticket;
        $asset = $ticket?->asset;

        return self::create([
            'document_number' => 'BA-' . date('Ymd') . '-' . Str::upper(Str::random(6)),
            'spk_id' => $spk->id,
            'asset_id' => $asset?->id,
            'ticket_id' => $ticket?->id,
            'title' => 'Berita Acara Perbaikan AC - ' . ($asset?->name ?? 'Unknown'),
            'description' => $ticket?->description,
            'report_date' => now(),
            'completion_date' => $spk->updated_at,
            'total_cost' => $spk->total_cost,
            'is_warranty_claim' => $spk->is_warranty_claim,
            'work_description' => $spk->completion_notes,
            'parts_replaced' => $spk->items?->map(fn($item) => [
                'name' => $item->item_name,
                'qty' => $item->qty,
                'price' => $item->price_per_item,
            ])->toArray() ?? [],
            'generated_by' => $generatedBy,
            'status' => 'draft',
        ]);
    }

    /**
     * Get PDF path for download
     */
    public function getPdfUrlAttribute(): ?string
    {
        if (!$this->pdf_path) {
            return null;
        }
        
        return asset('storage/' . $this->pdf_path);
    }
}
