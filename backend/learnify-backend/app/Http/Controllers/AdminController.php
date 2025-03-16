<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;


class AdminController extends Controller
{
    public function changeRole(Request $request, User $user)
    {
        $request->validate([
            'role' => 'required|in:student,assistant', // Only allow changing to 'student' or 'assistant'
        ]);

        // Ensure the user is not already a teacher
        if ($user->role === 'teacher') {
            return response()->json(['message' => 'Cannot change the role of a teacher.'], 403);
        }

        // Update the user's role
        $user->role = $request->role;
        $user->save();

        return response()->json(['message' => 'User role updated successfully.', 'user' => $user]);
    }
}