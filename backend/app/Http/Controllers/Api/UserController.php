<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\User;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        return response()->json($query->get());
    }

    public function show(string $id)
    {
        return response()->json(User::findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'role' => 'sometimes|string',
            'name' => 'sometimes|string',
        ]);

        $user->update($validated);
        return response()->json($user);
    }
}
