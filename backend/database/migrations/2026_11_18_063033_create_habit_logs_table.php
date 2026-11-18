<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('habit_logs', function (Blueprint $table) {
        $table->id();
        $table->foreignId('habit_id')->constrained()->onDelete('cascade');
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->date('completed_date')->index(); // Index pour accélérer le Heatmap
        $table->enum('completion_type', ['full', 'two_minute'])->default('full');
        $table->text('notes')->nullable();
        $table->timestamps();

        // Empêcher de valider la même habitude 2 fois le même jour
        $table->unique(['habit_id', 'completed_date']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('habit_logs');
    }
};
