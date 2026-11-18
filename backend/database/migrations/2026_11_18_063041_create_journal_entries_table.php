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
    Schema::create('journal_entries', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->date('entry_date');
        $table->tinyInteger('mood_score'); // 1 à 5
        $table->tinyInteger('energy_level'); // 1 à 5
        $table->text('gratitude_text')->nullable();
        $table->text('daily_reflection')->nullable();
        $table->string('tomorrow_focus')->nullable();
        $table->timestamps();

        // Une seule entrée de journal par jour et par utilisateur
        $table->unique(['user_id', 'entry_date']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('journal_entries');
    }
};
