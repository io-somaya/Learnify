<?php
//backend\learnify-backend\app\Http\Controllers\Teacher\UserManagement\UserManagementController.php
namespace App\Http\Controllers\Teacher\UserManagement;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserManagementController extends Controller
{
    protected $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    /**
     * Display a listing of the users.
     */
    public function index(Request $request)
    {
        $users = $this->userRepository->getAllUsers($request);

        return response()->json([
            'status' => 'success',
            'data' => $users
        ]);
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        return response()->json([
            'status' => 'success',
            'data' => $user
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'phone_number' => 'sometimes|nullable|string|max:20',
            'parent_phone' => 'sometimes|nullable|string|max:20',
            'grade' => 'sometimes|nullable|in:1,2,3',
            'role' => 'sometimes|in:student,teacher,assistant',
            'status' => 'sometimes|in:active,inactive,suspended',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $updated = $this->userRepository->updateUser($user, $request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'User updated successfully.',
            'data' => $updated
        ]);
    }

    /**
     * Update user status.
     */
    public function updateStatus(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:active,inactive,suspended',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        if (in_array($request->status, ['inactive', 'suspended'])) {
            // Update the user's subscription to pending
            $user->subscriptions()->update(['status' => 'pending']);
        }

        $updated = $this->userRepository->updateUserStatus($user, $request->status);

        return response()->json([
            'status' => 'success',
            'message' => 'User status updated successfully.',
            'data' => $updated
        ]);
    }

    /**
     * Update user role.
     */
    public function updateRole(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), [
            'role' => 'required|in:student,assistant',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $updated = $this->userRepository->updateUserRole($user, $request->role);

        return response()->json([
            'status' => 'success',
            'message' => 'User role updated successfully.',
            'data' => $updated
        ]);
    }

    /**
     * Update user grade.
     */
    public function updateGrade(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), [
            'grade' => 'required|in:1,2,3',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $updated = $this->userRepository->updateUserGrade($user, $request->grade);

        return response()->json([
            'status' => 'success',
            'message' => 'User grade updated successfully.',
            'data' => $updated
        ]);
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user)
    {
        $this->userRepository->deleteUser($user);

        return response()->json([
            'status' => 'success',
            'message' => 'User deleted successfully.'
        ]);
    }
}
