<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MaintenancePeriod extends Model
{
    protected $guarded = [];

    public function schedules()
    {
        return $this->hasMany(MaintenanceSchedule::class, 'period_id');
    }
}
