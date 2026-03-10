<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppConfig;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class AppConfigController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $configs = AppConfig::all()->pluck('value', 'identifier');
        return response()->json($configs);
    }

    /**
     * Update configs in bulk.
     */
    public function updateConfigs(Request $request)
    {
        $request->validate([
            'configs' => 'required|array',
        ]);

        foreach ($request->configs as $identifier => $value) {
            AppConfig::updateOrCreate(
                ['identifier' => $identifier],
                ['value' => $value]
            );
        }

        return response()->json(['message' => 'Configurations updated successfully']);
    }

    /**
     * Send a test email to verify SMTP configuration.
     */
    public function testEmail(Request $request)
    {
        $request->validate([
            'to' => 'required|email',
        ]);

        try {
            Mail::raw(
                "Ini adalah email uji coba dari sistem LaporAC.\n\nJika Anda menerima email ini, konfigurasi SMTP sudah berhasil dikonfigurasi dengan benar.\n\n-- Tim LaporAC",
                function ($message) use ($request) {
                    $message->to($request->to)
                        ->subject('[LaporAC] Test Email - Konfigurasi SMTP Berhasil');
                }
            );

            return response()->json(['message' => 'Email test berhasil dikirim ke ' . $request->to]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mengirim email: ' . $e->getMessage()
            ], 422);
        }
    }
}
