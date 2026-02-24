<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    protected $guarded = [];

    protected $casts = [
        'is_damage_confirmed' => 'boolean',
        'is_parts_replaced' => 'boolean',
        'target_date' => 'date',
        'completion_date' => 'datetime',
        'validation_date' => 'datetime',
        'date_resolved' => 'datetime',
    ];

    public function assets()
    {
        return $this->belongsTo(Asset::class, 'asset_id');
    }

    public function assignedTechnician()
    {
        return $this->belongsTo(User::class, 'assigned_technician_id');
    }

    public function validatedBy()
    {
        return $this->belongsTo(User::class, 'validated_by_id');
    }
}
