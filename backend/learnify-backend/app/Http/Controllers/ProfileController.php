<?php

namespace App\Http\Controllers;

use App\Http\traits\ApiTrait;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    use ApiTrait;

    public function show()
    {
        /** @var User $user */
        $user = Auth::user();
        return $this->apiResponse(200, 'Profile retrieved successfully', $user);
    }

    public function update(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,'.$user->id,
            'phone' => 'sometimes|string|max:20',
            'grade' => 'sometimes|nullable|in:1,2,3',
            'parent_phone' => 'sometimes|nullable|string|max:20',
        ]);

        $user->fill($validated)->save();

        return $this->apiResponse(200, 'Profile updated successfully', $user);
    }

    public function updatePassword(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return $this->apiResponse(422, 'Current password is incorrect', null);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return $this->apiResponse(200, 'Password updated successfully', null);
    }

    public function updatePhoto(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($user->profile_photo_path) {
                Storage::delete($user->profile_photo_path);
            }

            $path = $request->file('photo')->store('profile-photos');
            $user->profile_photo_path = $path;
            $user->save();

            return $this->apiResponse(200, 'Profile photo updated successfully', [
                'photo_url' => Storage::url($path)
            ]);
        }

        return $this->apiResponse(400, 'No photo uploaded', null);
    }
}
