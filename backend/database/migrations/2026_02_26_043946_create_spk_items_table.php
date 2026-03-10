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
        Schema::create('spk_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('spk_id')->constrained('spks')->cascadeOnDelete();
            $table->foreignId('pricelist_item_id')->nullable()->constrained('pricelist_items')->nullOnDelete();
            $table->string('item_name'); // Store name directly in case the pricelist item is deleted/changed later
            $table->integer('qty')->default(1);
            $table->decimal('price_per_item', 15, 2);
            $table->decimal('total_price', 15, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spk_items');
    }
};
