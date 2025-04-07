<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //create test student
        User::create([
            "first_name" => "student",
            "last_name" => "student",
            'email' => 'student@learnify.com',
            'password' => bcrypt('student123'),
            "phone_number"	=> '0123456789',
            'parent_phone' => '0103456789',
            'role' => 'student',
            'grade' => '1'
        ]);

        //create test teacher
        User::create([
            "first_name" => "teacher",
            "last_name" => "teacher",
            'email' => 'teacher@learnify.com',
            'password' => bcrypt('teacher123'),
            'role' => 'teacher',
        ]);
    }
}
