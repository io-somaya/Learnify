<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class UserRepository
{
    /**
     * Get all users with filtering options.
     *
     * @param Request $request
     * @return LengthAwarePaginator
     */
    public function getAllUsers(Request $request): LengthAwarePaginator
    {
        $query = User::query();

        // Filter by role
        if ($request->has('role') && $request->role) {
            $query->where('role', $request->role);
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by grade
        if ($request->has('grade') && $request->grade) {
            $query->where('grade', $request->grade);
        }

        // Search by name or email
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortField = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $allowedSortFields = ['first_name', 'last_name', 'email', 'role', 'status', 'grade', 'created_at'];

        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection);
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        return $query->paginate($perPage);
    }

    /**
     * Update a user.
     *
     * @param User $user
     * @param array $data
     * @return User
     */
    public function updateUser(User $user, array $data): User
    {
        $user->update($data);
        return $user->fresh();
    }

    /**
     * Update user status.
     *
     * @param User $user
     * @param string $status
     * @return User
     */
    public function updateUserStatus(User $user, string $status): User
    {
        $user->status = $status;
        $user->save();
        return $user->fresh();
    }

    /**
     * Update user role.
     *
     * @param User $user
     * @param string $role
     * @return User
     */
    public function updateUserRole(User $user, string $role): User
    {
        $user->role = $role;
        $user->save();
        return $user->fresh();
    }

    /**
     * Update user grade.
     *
     * @param User $user
     * @param string $grade
     * @return User
     */
    public function updateUserGrade(User $user, string $grade): User
    {
        $user->grade = $grade;
        $user->save();
        return $user->fresh();
    }

    /**
     * Delete a user.
     *
     * @param User $user
     * @return bool
     */
    public function deleteUser(User $user): bool
    {
        return $user->delete();
    }
}
