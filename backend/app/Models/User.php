<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'nik',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relationships

    public function vendorProfile()
    {
        return $this->hasOne(VendorProfile::class);
    }

    public function assignedTickets()
    {
        return $this->hasMany(Ticket::class, 'assigned_technician_id');
    }

    public function validatedTickets()
    {
        return $this->hasMany(Ticket::class, 'validated_by_id');
    }

    public function spksAsVendor()
    {
        return $this->hasMany(Spk::class, 'vendor_id');
    }

    public function approvedSpks()
    {
        return $this->hasMany(Spk::class, 'approved_by_id');
    }

    public function generatedNewsReports()
    {
        return $this->hasMany(NewsReport::class, 'generated_by');
    }

    public function approvedNewsReports()
    {
        return $this->hasMany(NewsReport::class, 'approved_by');
    }

    // Scopes

    public function scopeVendors($query)
    {
        return $query->where('role', 'vendor');
    }

    public function scopeTechnicians($query)
    {
        return $query->where('role', 'technician');
    }

    public function scopeAdmins($query)
    {
        return $query->where('role', 'admin');
    }

    public function scopeSuperAdmins($query)
    {
        return $query->where('role', 'super_admin');
    }

    // Methods

    public function isVendor(): bool
    {
        return $this->role === 'vendor';
    }

    public function isTechnician(): bool
    {
        return $this->role === 'technician';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin' || $this->role === 'super_admin';
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function getVendorProfileAttribute()
    {
        return $this->vendorProfile;
    }
}
