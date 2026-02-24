<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AssetController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\MaintenanceController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PeriodController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::apiResource('assets', AssetController::class);
    Route::apiResource('tickets', TicketController::class);

    // Maintenance Schedule Routes
    Route::get('maintenance', [MaintenanceController::class, 'index']);
    Route::post('maintenance', [MaintenanceController::class, 'store']);
    Route::put('maintenance/{id}', [MaintenanceController::class, 'update']);
    Route::post('maintenance/{id}/complete', [MaintenanceController::class, 'markComplete']);

    // Admin Settings Routes
    Route::apiResource('roles', RoleController::class);
    Route::post('roles/{id}/permissions', [RoleController::class, 'updatePermissions']);
    Route::apiResource('permissions', PermissionController::class)->only(['index']);
    Route::apiResource('users', UserController::class)->only(['index', 'show', 'update']);

    // Period Routes
    Route::get('periods/available-years', [PeriodController::class, 'availableYears']);
    Route::get('periods/stats', [PeriodController::class, 'stats']);
    Route::post('periods/sync-statuses', [PeriodController::class, 'syncStatuses']);
    Route::post('periods/{id}/recalculate-stats', [PeriodController::class, 'recalculateStats']);
    Route::apiResource('periods', PeriodController::class);
});
