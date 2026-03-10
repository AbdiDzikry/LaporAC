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
        Schema::create('pricelist_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pricelist_item_id')->constrained('pricelist_items')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); // Admin or Vendor who edited
            $table->string('action'); // created, updated, deleted
            $table->decimal('old_price', 15, 2)->nullable();
            $table->decimal('new_price', 15, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pricelist_logs');
    }
};
