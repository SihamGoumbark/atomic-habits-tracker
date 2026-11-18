<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Identity;
use Illuminate\Http\Request;

class IdentityController extends Controller
{
    public function index(Request $request)
    {
        $identities = $request->user()
            ->identities()
            ->withCount('habits')
            ->latest()
            ->get();

        return response()->json(['identities' => $identities], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:20',
            'icon' => 'nullable|string|max:50',
        ]);

        $identity = $request->user()->identities()->create($validated);

        return response()->json([
            'message' => 'Identité créée avec succès',
            'identity' => $identity,
        ], 201);
    }

    public function update(Request $request, Identity $identity)
    {
        if ($identity->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:20',
            'icon' => 'nullable|string|max:50',
        ]);

        $identity->update($validated);

        return response()->json([
            'message' => 'Identité mise à jour',
            'identity' => $identity,
        ], 200);
    }

    public function destroy(Request $request, Identity $identity)
    {
        if ($identity->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $identity->delete();

        return response()->json(['message' => 'Identité supprimée'], 200);
    }
}
