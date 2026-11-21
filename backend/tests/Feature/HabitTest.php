<?php

namespace Tests\Feature;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class HabitTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_habits(): void
    {
        $this->getJson('/api/habits')
            ->assertUnauthorized();
    }

    public function test_user_can_create_a_habit(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/habits', [
            'title' => 'Lire 10 pages',
            'two_minute_version' => 'Lire 1 seule page',
            'cue_time' => '08:00',
            'cue_location' => 'Salon',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('habit.title', 'Lire 10 pages');

        $this->assertDatabaseHas('habits', [
            'user_id' => $user->id,
            'title' => 'Lire 10 pages',
            'two_minute_version' => 'Lire 1 seule page',
        ]);
    }

    public function test_user_cannot_view_or_modify_another_users_habit(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();

        $habit = $owner->habits()->create([
            'title' => 'Habitude privée du propriétaire',
            'two_minute_version' => 'Version 2 minutes',
        ]);

        Sanctum::actingAs($intruder);

        // L'intrus ne voit pas l'habitude dans sa liste
        $this->getJson('/api/habits')
            ->assertOk()
            ->assertJsonMissing(['id' => $habit->id]);

        // L'intrus est bloqué (403) s'il tente de la modifier, supprimer ou valider
        $this->putJson("/api/habits/{$habit->id}", ['title' => 'Piraté'])
            ->assertStatus(403);

        $this->deleteJson("/api/habits/{$habit->id}")
            ->assertStatus(403);

        $this->postJson("/api/habits/{$habit->id}/toggle")
            ->assertStatus(403);
    }

    public function test_streak_increments_when_completed_on_consecutive_days(): void
    {
        $user = User::factory()->create();
        $habit = $user->habits()->create([
            'title' => 'Méditer 10 minutes',
            'two_minute_version' => 'Respirer profondément 2 minutes',
            'current_streak' => 1,
            'best_streak' => 1,
        ]);

        // On simule une validation effectuée hier
        $habit->logs()->create([
            'user_id' => $user->id,
            'completed_date' => Carbon::yesterday()->toDateString(),
            'completion_type' => 'full',
        ]);

        Sanctum::actingAs($user);

        // L'utilisateur valide aujourd'hui via l'endpoint /toggle
        $response = $this->postJson("/api/habits/{$habit->id}/toggle", [
            'completion_type' => 'full',
        ]);

        $response->assertOk()
            ->assertJsonPath('completed_today', true)
            ->assertJsonPath('habit.current_streak', 2)
            ->assertJsonPath('habit.best_streak', 2);
    }
}