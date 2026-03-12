<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('spks', function (Blueprint $table) {
            $table->date('proposed_visit_date')->nullable()->after('work_end_date');
            $table->text('vendor_response_notes')->nullable()->after('proposed_visit_date');
            $table->timestamp('vendor_responded_at')->nullable()->after('vendor_response_notes');
            $table->text('admin_schedule_notes')->nullable()->after('vendor_responded_at');
        });
    }

    public function down(): void
    {
        Schema::table('spks', function (Blueprint $table) {
            $table->dropColumn([
                'proposed_visit_date',
                'vendor_response_notes',
                'vendor_responded_at',
                'admin_schedule_notes',
            ]);
        });
    }
};
