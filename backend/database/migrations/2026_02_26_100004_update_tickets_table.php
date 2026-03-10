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
        Schema::table('tickets', function (Blueprint $table) {
            $table->string('resolution_category')->nullable(); // minor_repair, major_repair, replacement
            $table->boolean('is_warranty_work')->default(false);
            $table->date('warranty_start_date')->nullable();
            $table->date('warranty_end_date')->nullable();
            $table->foreignId('news_report_id')->nullable()->constrained('news_reports')->nullOnDelete();
            $table->index(['status', 'is_warranty_work']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropForeign(['news_report_id']);
            $table->dropColumn([
                'resolution_category',
                'is_warranty_work',
                'warranty_start_date',
                'warranty_end_date',
                'news_report_id'
            ]);
        });
    }
};
