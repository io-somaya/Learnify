<?php
// backend\learnify-backend\database\seeders\TestDataSeeder.php
namespace Database\Seeders;

use App\Models\User;
use App\Models\Lesson;
use App\Models\Package;
use App\Models\Material;
use App\Models\PackageUser;
use App\Models\Payment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create users - using first_name and last_name instead of name
        $teacher = User::create([
            'first_name' => 'Teacher',
            'last_name' => 'User',
            'email' => 'teacher@example.com',
            'password' => Hash::make('password123'),
            'phone_number' => '01012345678',
            'role' => 'teacher',
            'status' => 'active',
        ]);

        $assistant = User::create([
            'first_name' => 'Assistant',
            'last_name' => 'User',
            'email' => 'assistant@example.com',
            'password' => Hash::make('password123'),
            'phone_number' => '01012345679',
            'role' => 'assistant',
            'status' => 'active',
        ]);

        $studentGrade1 = User::create([
            'first_name' => 'Grade 1',
            'last_name' => 'Student',
            'email' => 'student1@example.com',
            'password' => Hash::make('password123'),
            'phone_number' => '01012345670',
            'parent_phone' => '01012345671',
            'grade' => '1',
            'role' => 'student',
            'status' => 'active',
        ]);

        $studentGrade2 = User::create([
            'first_name' => 'Grade 2',
            'last_name' => 'Student',
            'email' => 'student2@example.com',
            'password' => Hash::make('password123'),
            'phone_number' => '01012345672',
            'parent_phone' => '01012345673',
            'grade' => '2',
            'role' => 'student',
            'status' => 'active',
        ]);

        $studentGrade3 = User::create([
            'first_name' => 'Grade 3',
            'last_name' => 'Student',
            'email' => 'student3@example.com',
            'password' => Hash::make('password123'),
            'phone_number' => '01012345674',
            'parent_phone' => '01012345675',
            'grade' => '3',
            'role' => 'student',
            'status' => 'active',
        ]);

        $inactiveStudent = User::create([
            'first_name' => 'Inactive',
            'last_name' => 'Student',
            'email' => 'inactive@example.com',
            'password' => Hash::make('password123'),
            'phone_number' => '01012345676',
            'parent_phone' => '01012345677',
            'grade' => '1',
            'role' => 'student',
            'status' => 'inactive',
        ]);

        // Create packages
        $monthlyPackage = Package::create([
            'name' => 'Monthly Package',
            'description' => 'Access to all lessons for one month',
            'price' => 200.00,
            'duration_days' => 30,
        ]);

        $threeMonthPackage = Package::create([
            'name' => 'Three Month Package',
            'description' => 'Access to all lessons for three months',
            'price' => 500.00,
            'duration_days' => 90,
        ]);

        // Create subscriptions
        // Active subscription for Grade 1 student
        $activeSubscription = PackageUser::create([
            'user_id' => $studentGrade1->id,
            'package_id' => $monthlyPackage->id,
            'start_date' => now()->subDays(5)->format('Y-m-d'),
            'end_date' => now()->addDays(25)->format('Y-m-d'),
        ]);

        // Active subscription for Grade 2 student
        $activeSubscription2 = PackageUser::create([
            'user_id' => $studentGrade2->id,
            'package_id' => $threeMonthPackage->id,
            'start_date' => now()->subDays(10)->format('Y-m-d'),
            'end_date' => now()->addDays(80)->format('Y-m-d'),
        ]);

        // Expired subscription for Grade 3 student
        $expiredSubscription = PackageUser::create([
            'user_id' => $studentGrade3->id,
            'package_id' => $monthlyPackage->id,
            'start_date' => now()->subDays(40)->format('Y-m-d'),
            'end_date' => now()->subDays(10)->format('Y-m-d'),
        ]);

        // Create payments for subscriptions
        Payment::create([
            'package_user_id' => $activeSubscription->id,
            'amount_paid' => 200.00,
            'payment_status' => 'completed',
            'transaction_reference' => 'TXN' . time() . '123',
        ]);

        Payment::create([
            'package_user_id' => $activeSubscription2->id,
            'amount_paid' => 500.00,
            'payment_status' => 'completed',
            'transaction_reference' => 'TXN' . time() . '456',
        ]);

        Payment::create([
            'package_user_id' => $expiredSubscription->id,
            'amount_paid' => 200.00,
            'payment_status' => 'completed',
            'transaction_reference' => 'TXN' . time() . '789',
        ]);

        // Create lessons for each grade
        $grades = ['1', '2', '3'];
        $subjects = ['Math', 'Science', 'Arabic', 'English', 'Social Studies'];

        foreach ($grades as $grade) {
            foreach ($subjects as $index => $subject) {
                $lesson = Lesson::create([
                    'title' => "Grade {$grade} - {$subject} Lesson",
                    'description' => "This is a detailed description for grade {$grade} {$subject} lesson.",
                    'grade' => $grade,
                    'youtube_embed_code' => '<iframe width="560" height="315" src="https://www.youtube.com/embed/sample-id-' . $grade . $index . '" frameborder="0" allowfullscreen></iframe>'
                ]);

                // Create 3 materials for each lesson
                for ($j = 1; $j <= 3; $j++) {
                    Material::create([
                        'lesson_id' => $lesson->id,
                        'file_name' => "{$subject} Material {$j} for Grade {$grade}",
                        'file_url' => "https://example.com/materials/grade{$grade}/{$subject}/material{$j}.pdf"
                    ]);
                }
            }
        }
    }
}
