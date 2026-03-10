<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Models\MaintenanceSchedule;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    public function historyReport()
    {
        $tickets = Ticket::with(['asset', 'spk.vendor'])
            ->whereIn('status', ['closed', 'resolved'])
            ->orderBy('updated_at', 'desc')
            ->get();

        $maintenance = MaintenanceSchedule::with('asset')
            ->whereIn('status', ['completed', 'skipped', 'missed'])
            ->orderBy('scheduled_date', 'desc')
            ->get();

        $pdf = Pdf::loadView('pdf.history', compact('tickets', 'maintenance'))->setPaper('A4', 'landscape');

        return $pdf->download('Rekap_History_Global.pdf');
    }
}
