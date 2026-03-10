<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MenuPermission extends Model
{
    use HasFactory;

    protected $fillable = [
        'role_id',
        'menu_route',
        'menu_label',
        'menu_icon',
        'sort_order',
        'is_visible',
        'is_active',
    ];

    protected $casts = [
        'is_visible' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Get menu permissions for a specific role
     */
    public static function getMenuForRole(int $roleId, bool $onlyActive = true)
    {
        $query = self::where('role_id', $roleId);
        
        if ($onlyActive) {
            $query->where('is_active', true)
                  ->where('is_visible', true)
                  ->orderBy('sort_order');
        }
        
        return $query->get();
    }

    /**
     * Check if a role has access to a specific menu route
     */
    public static function hasAccess(int $roleId, string $route): bool
    {
        return self::where('role_id', $roleId)
            ->where('menu_route', $route)
            ->where('is_active', true)
            ->where('is_visible', true)
            ->exists();
    }
}
