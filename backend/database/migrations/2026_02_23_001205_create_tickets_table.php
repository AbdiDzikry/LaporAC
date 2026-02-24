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
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->string('status')->default('open');
            $table->string('issue_category')->nullable();
            $table->string('priority')->nullable();
            $table->string('location')->nullable();

            // Reporter
            $table->string('reporter_name')->nullable();
            $table->string('reporter_nik')->nullable();

            // Relations
            $table->foreignId('asset_id')->nullable()->constrained('assets')->nullOnDelete();
            $table->foreignId('assigned_technician_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('assigned_technician_name')->nullable();
            $table->foreignId('validated_by_id')->nullable()->constrained('users')->nullOnDelete();

            // Dates
            $table->date('target_date')->nullable();
            $table->timestamp('completion_date')->nullable();
            $table->timestamp('validation_date')->nullable();
            $table->timestamp('date_resolved')->nullable();

            // Inspection/Action
            $table->string('action_type')->nullable();
            $table->string('failure_type')->nullable();
            $table->text('initial_diagnosis')->nullable();
            $table->text('root_cause')->nullable();
            $table->boolean('is_damage_confirmed')->nullable();
            $table->boolean('is_parts_replaced')->nullable();
            $table->text('validation_notes')->nullable();
            $table->text('completion_notes')->nullable();
            $table->integer('cost')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
