<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Lesson;
use App\Models\Package;
use App\Models\Material;
use App\Models\PackageUser;
use App\Models\Payment;
use App\Models\Lecture;
use App\Models\Assignment;
use App\Models\Question;
use App\Models\Option;
use App\Models\AssignmentUser;
use App\Models\Answer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DiscussionTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a teacher
        $teacher = User::create([
            'first_name' => 'Mahmoud',
            'last_name' => 'Elbasha',
            'email' => 'teacher@learnify.com',
            'password' => Hash::make('password123'),
            'phone_number' => '01012345678',
            'role' => 'teacher',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // Create an assistant
        $assistant = User::create([
            'first_name' => 'Abdelrhman',
            'last_name' => 'Hasen',
            'email' => 'assistant@learnify.com',
            'password' => Hash::make('password123'),
            'phone_number' => '01023456789',
            'role' => 'assistant',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // Grade 1 student with subscription expiring in 2 days
        $student1Expiring = User::create([
            'first_name' => 'Mahmoud',
            'last_name' => 'Eid',
            'email' => 'student1@learnify.com',
            'password' => Hash::make('password123'),
            'phone_number' => '01034567890',
            'parent_phone' => '01087654321',
            'grade' => '1',
            'role' => 'student',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // Grade 2 student at beginning of subscription
        $student2Beginning = User::create([
            'first_name' => 'Somaya',
            'last_name' => 'Hasen',
            'email' => 'student2@learnify.com',
            'password' => Hash::make('password123'),
            'phone_number' => '01045678901',
            'parent_phone' => '01098765432',
            'grade' => '2',
            'role' => 'student',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // Grade 3 student at beginning of subscription
        $student3Beginning = User::create([
            'first_name' => 'Omar',
            'last_name' => 'Rizk',
            'email' => 'student3@learnify.com',
            'password' => Hash::make('password123'),
            'phone_number' => '01056789012',
            'parent_phone' => '01009876543',
            'grade' => '3',
            'role' => 'student',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // Grade 1 student with expired subscription
        $student1Expired = User::create([
            'first_name' => 'Ahmed',
            'last_name' => 'Samir',
            'email' => 'student4@learnify.com',
            'password' => Hash::make('password123'),
            'phone_number' => '01067890123',
            'parent_phone' => '01010987654',
            'grade' => '1',
            'role' => 'student',
            'status' => 'inactive',
            'email_verified_at' => now(),
        ]);

        // Create packages
        $monthlyPackage = Package::create([
            'name' => 'Monthly Package',
            'description' => 'Access to all lessons and materials for one month',
            'price' => 300.00,
            'duration_days' => 30,
        ]);

        $quarterlyPackage = Package::create([
            'name' => 'Quarterly Package',
            'description' => 'Access to all lessons and materials for three months with 15% discount',
            'price' => 765.00,
            'duration_days' => 90,
        ]);

        $yearlyPackage = Package::create([
            'name' => 'Yearly Package',
            'description' => 'Access to all lessons and materials for one year with 25% discount',
            'price' => 2700.00,
            'duration_days' => 365,
        ]);

        // Create subscriptions
        // Grade 1 student with subscription expiring in 2 days
        $subscriptionExpiring = PackageUser::create([
            'user_id' => $student1Expiring->id,
            'package_id' => $monthlyPackage->id,
            'start_date' => Carbon::now()->subDays(28)->format('Y-m-d'),
            'end_date' => Carbon::now()->addDays(2)->format('Y-m-d'),
            'status' => 'active',
        ]);

        // Grade 2 student at beginning of subscription
        $subscriptionBeginning2 = PackageUser::create([
            'user_id' => $student2Beginning->id,
            'package_id' => $quarterlyPackage->id,
            'start_date' => Carbon::now()->subDays(5)->format('Y-m-d'),
            'end_date' => Carbon::now()->addDays(85)->format('Y-m-d'),
            'status' => 'active',
        ]);

        // Grade 3 student at beginning of subscription
        $subscriptionBeginning3 = PackageUser::create([
            'user_id' => $student3Beginning->id,
            'package_id' => $yearlyPackage->id,
            'start_date' => Carbon::now()->subDays(5)->format('Y-m-d'),
            'end_date' => Carbon::now()->addDays(360)->format('Y-m-d'),
            'status' => 'active',
        ]);

        // Grade 1 student with expired subscription
        $subscriptionExpired = PackageUser::create([
            'user_id' => $student1Expired->id,
            'package_id' => $monthlyPackage->id,
            'start_date' => Carbon::now()->subDays(45)->format('Y-m-d'),
            'end_date' => Carbon::now()->subDays(15)->format('Y-m-d'),
            'status' => 'expired',
        ]);

        // Create payments for subscriptions
        Payment::create([
            'package_user_id' => $subscriptionExpiring->id,
            'amount_paid' => 300.00,
            'payment_status' => 'completed',
            'transaction_reference' => 'TXN' . time() . '001',
        ]);

        Payment::create([
            'package_user_id' => $subscriptionBeginning2->id,
            'amount_paid' => 765.00,
            'payment_status' => 'completed',
            'transaction_reference' => 'TXN' . time() . '002',
        ]);

        Payment::create([
            'package_user_id' => $subscriptionBeginning3->id,
            'amount_paid' => 2700.00,
            'payment_status' => 'completed',
            'transaction_reference' => 'TXN' . time() . '003',
        ]);

        Payment::create([
            'package_user_id' => $subscriptionExpired->id,
            'amount_paid' => 300.00,
            'payment_status' => 'completed',
            'transaction_reference' => 'TXN' . time() . '004',
        ]);

        // Create lessons for each grade
        $subjects = ['Math', 'Science', 'Arabic'];
        $lessons = [];

        foreach (['1', '2', '3'] as $grade) {
            foreach ($subjects as $subject) {
                $lesson = Lesson::create([
                    'title' => "Grade {$grade} - {$subject}",
                    'description' => "This is a comprehensive {$subject} lesson for students in grade {$grade}.",
                    'grade' => $grade,
                    'youtube_embed_code' => '<iframe width="560" height="315" src="https://www.youtube.com/embed/example-' . $grade . $subject . '" frameborder="0" allowfullscreen></iframe>'
                ]);

                $lessons[$grade][$subject] = $lesson;

                // Create 2 materials for each lesson
                Material::create([
                    'lesson_id' => $lesson->id,
                    'file_name' => "{$subject} Textbook for Grade {$grade}",
                    'file_url' => "https://learnify.com/materials/grade{$grade}/{$subject}/textbook.pdf"
                ]);

                Material::create([
                    'lesson_id' => $lesson->id,
                    'file_name' => "{$subject} Worksheet for Grade {$grade}",
                    'file_url' => "https://learnify.com/materials/grade{$grade}/{$subject}/worksheet.pdf"
                ]);
            }
        }

        // Create exactly 3 lectures for each grade
        $lectureDays = ['Sunday', 'Wednesday'];
        $lectureTimeSlot = ['09:00:00', '10:30:00'];

        foreach (['1', '2', '3'] as $grade) {
            // Create exactly 3 lectures for each grade (one for each subject)
            foreach ($subjects as $subject) {
                $day = $lectureDays[array_rand($lectureDays)]; // Randomly choose a day

                Lecture::create([
                    'title' => "Grade {$grade} - {$subject}",
                    'day_of_week' => $day,
                    'start_time' => $lectureTimeSlot[0],
                    'end_time' => $lectureTimeSlot[1],
                    'description' => "{$subject} lecture for Grade {$grade} students",
                    'grade' => $grade,
                    'zoom_link' => "https://zoom.us/j/grade{$grade}{$subject}{$day}",
                    'is_active' => true
                ]);
            }
        }

        // Create assignments for each grade (3 per grade, each linked to a lesson)
        $assignments = [];

        foreach (['1', '2', '3'] as $grade) {
            foreach ($subjects as $subject) {
                $assignment = Assignment::create([
                    'lesson_id' => $lessons[$grade][$subject]->id,
                    'title' => "Grade {$grade} - {$subject} Assignment",
                    'description' => "Complete this {$subject} assignment for grade {$grade}.",
                    'grade' => $grade,
                    'due_date' => Carbon::now()->addDays(7)->format('Y-m-d H:i:s')
                ]);

                $assignments[$grade][$subject] = $assignment;

                // Create 5 questions for each assignment
                for ($i = 1; $i <= 5; $i++) {
                    $question = Question::create([
                        'assignment_id' => $assignment->id,
                        'question_text' => "Question {$i}: What is the correct answer for this {$subject} problem?",
                        'question_type' => 'mcq'
                    ]);

                    // Create 4 options for each question (first one is correct)
                    for ($j = 1; $j <= 4; $j++) {
                        Option::create([
                            'question_id' => $question->id,
                            'option_text' => "Option {$j} for {$subject} question {$i}",
                            'is_correct' => ($j === 1) // First option is correct
                        ]);
                    }
                }
            }
        }

        // Create assignment submissions for students
        $students = [
            '1' => [$student1Expiring, $student1Expired],
            '2' => [$student2Beginning],
            '3' => [$student3Beginning]
        ];

        foreach ($students as $grade => $gradeStudents) {
            foreach ($gradeStudents as $student) {
                foreach ($subjects as $subject) {
                    // Create assignment submission
                    $submission = AssignmentUser::create([
                        'user_id' => $student->id,
                        'assignment_id' => $assignments[$grade][$subject]->id,
                        'score' => rand(70, 100), // Random score between 70-100
                        'submit_time' => Carbon::now()->subDays(rand(1, 3))->format('Y-m-d H:i:s'),
                        'status' => 'graded'
                    ]);

                    // Create answers for each question in the assignment
                    foreach (Question::where('assignment_id', $assignments[$grade][$subject]->id)->get() as $question) {
                        $options = Option::where('question_id', $question->id)->get();
                        $correctOption = $options->where('is_correct', true)->first();

                        // 80% chance of selecting the correct answer
                        $selectedOption = (rand(1, 100) <= 80) ? $correctOption : $options->random();

                        Answer::create([
                            'assignment_user_id' => $submission->id,
                            'question_id' => $question->id,
                            'selected_option_id' => $selectedOption->id,
                            'is_correct' => $selectedOption->is_correct
                        ]);
                    }
                }
            }
        }
    }
}
