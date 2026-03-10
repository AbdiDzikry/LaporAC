<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewsReport;
use App\Models\Spk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class NewsReportController extends Controller
{
    /**
     * Display a listing of news reports
     */
    public function index(Request $request)
    {
        $query = NewsReport::with(['spk', 'asset', 'ticket', 'generatedBy', 'approvedBy', 'vendorSignedBy']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('spk_id')) {
            $query->where('spk_id', $request->spk_id);
        }

        if ($request->has('asset_id')) {
            $query->where('asset_id', $request->asset_id);
        }

        if ($request->has('is_warranty_claim')) {
            $query->where('is_warranty_claim', $request->is_warranty_claim);
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    /**
     * Store a newly created news report
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'spk_id' => 'required|exists:spks,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'report_date' => 'required|date',
            'completion_date' => 'required|date',
            'total_cost' => 'nullable|numeric',
            'is_warranty_claim' => 'boolean',
            'work_description' => 'nullable|string',
            'parts_replaced' => 'nullable|array',
            'recommendations' => 'nullable|string',
        ]);

        $spk = Spk::findOrFail($validated['spk_id']);
        
        $newsReport = NewsReport::createFromSpk($spk, auth()->id());
        
        // Update with any additional provided data
        $newsReport->update(array_merge($validated, [
            'asset_id' => $spk->ticket?->asset_id,
            'ticket_id' => $spk->ticket_id,
        ]));

        return response()->json($newsReport->load(['spk', 'asset', 'ticket']), 201);
    }

    /**
     * Display the specified news report
     */
    public function show($id)
    {
        $newsReport = NewsReport::with([
            'spk.vendor',
            'spk.items.pricelistItem',
            'asset',
            'ticket',
            'generatedBy',
            'approvedBy',
            'vendorSignedBy'
        ])->findOrFail($id);

        return response()->json($newsReport);
    }

    /**
     * Update the specified news report
     */
    public function update(Request $request, $id)
    {
        $newsReport = NewsReport::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'report_date' => 'sometimes|date',
            'completion_date' => 'sometimes|date',
            'total_cost' => 'sometimes|numeric',
            'is_warranty_claim' => 'sometimes|boolean',
            'work_description' => 'nullable|string',
            'parts_replaced' => 'nullable|array',
            'recommendations' => 'nullable|string',
            'status' => 'sometimes|in:draft,pending_approval,approved,rejected',
        ]);

        $newsReport->update($validated);

        return response()->json($newsReport->load(['spk', 'asset', 'ticket']));
    }

    /**
     * Approve a news report
     */
    public function approve($id)
    {
        $newsReport = NewsReport::findOrFail($id);
        
        $newsReport->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return response()->json($newsReport);
    }

    /**
     * Reject a news report
     */
    public function reject($id, Request $request)
    {
        $newsReport = NewsReport::findOrFail($id);
        
        $validated = $request->validate([
            'rejection_reason' => 'required|string',
        ]);

        $newsReport->update([
            'status' => 'rejected',
            'description' => ($newsReport->description ?? '') . "\n\nRejection Reason: " . $validated['rejection_reason'],
        ]);

        return response()->json($newsReport);
    }

    /**
     * Sign news report as vendor
     */
    public function vendorSign($id)
    {
        $newsReport = NewsReport::findOrFail($id);
        
        $newsReport->update([
            'vendor_signed_by' => auth()->id(),
            'vendor_signed_at' => now(),
        ]);

        return response()->json($newsReport);
    }

    /**
     * Generate PDF for news report
     */
    public function downloadPdf($id)
    {
        $newsReport = NewsReport::with([
            'spk.vendor.vendorProfile',
            'spk.items',
            'asset',
            'ticket',
            'generatedBy',
            'approvedBy'
        ])->findOrFail($id);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.news_report', compact('newsReport'));

        return $pdf->download("BA_{$newsReport->document_number}.pdf");
    }

    /**
     * Delete a news report
     */
    public function destroy($id)
    {
        $newsReport = NewsReport::findOrFail($id);
        
        // Delete PDF file if exists
        if ($newsReport->pdf_path && Storage::exists($newsReport->pdf_path)) {
            Storage::delete($newsReport->pdf_path);
        }
        
        $newsReport->delete();

        return response()->json(null, 204);
    }
}
