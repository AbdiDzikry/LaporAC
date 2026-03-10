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
        Schema::table('spks', function (Blueprint $table) {
            $table->foreignId('approved_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('vendor_signed_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('vendor_signed_at')->nullable();
            $table->text('vendor_notes')->nullable();
            $table->date('work_start_date')->nullable();
            $table->date('work_end_date')->nullable();
            $table->string('spk_type')->default('repair'); // repair, maintenance, installation
            $table->index(['status', 'is_warranty_claim']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('spks', function (Blueprint $table) {
            $table->dropForeign(['approved_by_id']);
            $table->dropForeign(['vendor_signed_by_id']);
            $table->dropColumn([
                'approved_by_id',
                'approved_at',
                'vendor_signed_by_id',
                'vendor_signed_at',
                'vendor_notes',
                'work_start_date',
                'work_end_date',
                'spk_type'
            ]);
        });
    }
};
