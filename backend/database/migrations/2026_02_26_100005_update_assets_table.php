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
        Schema::table('assets', function (Blueprint $table) {
            $table->string('warranty_status')->default('none'); // none, active, expired
            $table->integer('warranty_months')->default(3);
            $table->timestamp('last_repair_date')->nullable();
            $table->foreignId('last_repair_spk_id')->nullable()->constrained('spks')->nullOnDelete();
            $table->integer('total_repairs')->default(0);
            $table->decimal('total_repair_cost', 15, 2)->default(0);
            
            $table->index(['warranty_status', 'warranty_expiry']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropForeign(['last_repair_spk_id']);
            $table->dropColumn([
                'warranty_status',
                'warranty_months',
                'last_repair_date',
                'last_repair_spk_id',
                'total_repairs',
                'total_repair_cost'
            ]);
        });
    }
};
