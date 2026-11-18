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
    Schema::create('habits', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->foreignId('identity_id')->nullable()->constrained()->onDelete('set null');
        $table->string('title');
        $table->string('two_minute_version'); // Law 3: Make it Easy
        $table->time('cue_time')->nullable(); // Law 1: Implementation Intention
        $table->string('cue_location')->nullable();
        $table->string('stack_after_habit')->nullable(); // Law 1: Habit Stacking
        $table->string('reward_note')->nullable(); // Law 2: Temptation Bundling
        $table->json('frequency')->nullable(); // ["mon","tue",...]
        $table->integer('current_streak')->default(0);
        $table->integer('best_streak')->default(0);
        $table->boolean('missed_yesterday')->default(false); // Règle: Never Miss Twice
        $table->boolean('is_active')->default(true);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('habits');
    }
};
