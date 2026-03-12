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
use App\Http\Controllers\Api\AppConfigController;
use App\Http\Controllers\Api\PricelistItemController;
use App\Http\Controllers\Api\SpkController;
use App\Http\Controllers\Api\MenuPermissionController;
use App\Http\Controllers\Api\VendorProfileController;
use App\Http\Controllers\Api\NewsReportController;

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
    Route::delete('maintenance/{id}', [MaintenanceController::class, 'destroy']);
    Route::post('maintenance/{id}/generate-spk', [MaintenanceController::class, 'generateSpk']);

    // Admin Settings Routes
    Route::apiResource('roles', RoleController::class);
    Route::post('roles/{id}/permissions', [RoleController::class, 'updatePermissions']);
    Route::apiResource('permissions', PermissionController::class)->only(['index']);
    Route::apiResource('users', UserController::class);

    // Laporan / History
    Route::get('reports/history', [\App\Http\Controllers\Api\ReportController::class, 'historyReport']);

    // Period Routes
    Route::get('periods/available-years', [PeriodController::class, 'availableYears']);
    Route::get('periods/stats', [PeriodController::class, 'stats']);
    Route::post('periods/sync-statuses', [PeriodController::class, 'syncStatuses']);
    Route::post('periods/{id}/recalculate-stats', [PeriodController::class, 'recalculateStats']);
    Route::apiResource('periods', PeriodController::class);

    // App Config Routes
    Route::get('app-configs', [AppConfigController::class, 'index']);
    Route::post('app-configs/bulk-update', [AppConfigController::class, 'updateConfigs']);
    Route::post('app-configs/test-email', [AppConfigController::class, 'testEmail']);


    // Pricelist Routes
    Route::get('pricelists/{id}/logs', [PricelistItemController::class, 'getLogs']);
    Route::apiResource('pricelists', PricelistItemController::class);

    // SPK Routes
    Route::get('spks/resolved', [SpkController::class, 'getResolved']);
    Route::get('spks/{id}/download', [SpkController::class, 'downloadSpk']);
    Route::post('spks/{id}/approve-by-section-head', [SpkController::class, 'approveBySectionHead']);
    Route::post('spks/{id}/reject-by-section-head', [SpkController::class, 'rejectBySectionHead']);
    Route::post('spks/{id}/verify-completion', [SpkController::class, 'verifyCompletion']);
    Route::post('berita-acara/generate', [SpkController::class, 'generateBeritaAcara']);
    Route::apiResource('spks', SpkController::class);

    // Menu Permission Routes
    Route::get('menu-permissions/my-menus', [MenuPermissionController::class, 'myMenus']);
    Route::get('menu-permissions/check/{route}', [MenuPermissionController::class, 'checkAccess']);
    Route::get('menu-permissions/available-menus', [MenuPermissionController::class, 'availableMenus']);
    Route::get('menu-permissions/role/{roleId}', [MenuPermissionController::class, 'index']);
    Route::post('menu-permissions/role/{roleId}', [MenuPermissionController::class, 'update']);
    Route::delete('menu-permissions/{id}', [MenuPermissionController::class, 'destroy']);

    // Vendor Profile Routes
    Route::get('vendors', [VendorProfileController::class, 'index']);
    Route::get('vendors/active', [VendorProfileController::class, 'activeVendors']);
    Route::get('vendors/{id}', [VendorProfileController::class, 'show']);
    Route::get('vendors/{id}/statistics', [VendorProfileController::class, 'statistics']);
    Route::get('vendors/by-user/{userId}', [VendorProfileController::class, 'showByUser']);
    Route::post('vendors', [VendorProfileController::class, 'store']);
    Route::put('vendors/{id}', [VendorProfileController::class, 'update']);
    Route::delete('vendors/{id}', [VendorProfileController::class, 'destroy']);
    Route::post('vendors/{id}/update-rating', [VendorProfileController::class, 'updateRating']);

    // News Report (Berita Acara) Routes
    Route::get('news-reports', [NewsReportController::class, 'index']);
    Route::get('news-reports/{id}', [NewsReportController::class, 'show']);
    Route::get('news-reports/{id}/download', [NewsReportController::class, 'downloadPdf']);
    Route::post('news-reports', [NewsReportController::class, 'store']);
    Route::put('news-reports/{id}', [NewsReportController::class, 'update']);
    Route::post('news-reports/{id}/approve', [NewsReportController::class, 'approve']);
    Route::post('news-reports/{id}/reject', [NewsReportController::class, 'reject']);
    Route::post('news-reports/{id}/vendor-sign', [NewsReportController::class, 'vendorSign']);
    Route::delete('news-reports/{id}', [NewsReportController::class, 'destroy']);
});
