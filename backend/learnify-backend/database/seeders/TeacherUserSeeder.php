<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TeacherUserSeeder extends Seeder
{
    public function run()
    {
        User::create([
            'first_name' => 'Admin',
            'last_name' => 'Teacher',
            'email' => 'teacher@example.com',
            'password' => Hash::make('teacher123'),
            'phone_number' => '01012345678',
            'parent_phone' => '01087654321',
            'grade' => '1',
            'role' => 'teacher',
            'email_verified_at' => now(),
        ]);

        $this->command->info('Teacher user created successfully!');
        $this->command->info('Email: teacher@example.com');
        $this->command->info('Password: teacher123');
    }
}
