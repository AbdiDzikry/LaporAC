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
        Schema::create('vendor_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('company_name')->nullable();
            $table->text('company_address')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('npwp')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('bank_account')->nullable();
            $table->string('account_holder')->nullable();
            $table->json('specialties')->nullable(); // ["AC Repair", "Electrical", "Plumbing"]
            $table->text('notes')->nullable();
            $table->string('status')->default('active'); // active, inactive, suspended
            $table->decimal('rating', 3, 2)->default(0.00); // 0.00 - 5.00
            $table->integer('completed_jobs')->default(0);
            $table->timestamps();

            $table->index(['status', 'rating']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_profiles');
    }
};
