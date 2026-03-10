<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('news_reports', function (Blueprint $table) {
            $table->id();
            $table->string('document_number')->unique();
            $table->foreignId('spk_id')->constrained('spks')->cascadeOnDelete();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->foreignId('ticket_id')->constrained('tickets')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('report_date');
            $table->date('completion_date');
            $table->decimal('total_cost', 15, 2)->default(0);
            $table->boolean('is_warranty_claim')->default(false);
            $table->text('work_description')->nullable(); // Description of work done
            $table->json('parts_replaced')->nullable(); // List of parts replaced
            $table->text('recommendations')->nullable(); // Recommendations for future maintenance
            $table->foreignId('generated_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('vendor_signed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('vendor_signed_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->string('pdf_path')->nullable();
            $table->string('status')->default('draft'); // draft, pending_approval, approved, rejected
            $table->timestamps();

            $table->index(['document_number', 'status']);
            $table->index(['report_date', 'completion_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('news_reports');
    }
};
