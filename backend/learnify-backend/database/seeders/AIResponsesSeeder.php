<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AIResponsesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if the table exists first
        if (!Schema::hasTable('ai_responses')) {
            Schema::create('ai_responses', function ($table) {
                $table->id();
                $table->string('keyword');
                $table->text('response');
                $table->timestamps();
            });
        }

        // Clear existing data to prevent duplicates on reseeding
        DB::table('ai_responses')->truncate();

        // Insert sample responses
        DB::table('ai_responses')->insert([
            [
                'keyword' => 'assignment',
                'response' => 'To complete your assignment, first read all instructions carefully. Make sure you understand the requirements and deadline. Break the work into manageable sections and allocate time for research, writing, and review. If you need help, you can contact your teacher through the platform or check the lesson materials for guidance.',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'keyword' => 'lecture',
                'response' => 'Lectures are scheduled according to your grade level and subscription. You can find your lecture schedule on your dashboard. To join a lecture, simply click on the Zoom link at the scheduled time. Make sure to prepare by reviewing any pre-lecture materials and having your questions ready.',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'keyword' => 'lesson',
                'response' => 'Lessons are organized by grade level and topic. You can access all your lessons from the dashboard. Each lesson includes video content, downloadable materials, and sometimes practice assignments. Work through the lessons at your own pace, and don\'t hesitate to revisit materials as needed.',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'keyword' => 'subscription',
                'response' => 'Your subscription gives you access to all content for your grade level. You can check your current subscription status in your profile. If your subscription is expiring soon, you\'ll receive a notification. To renew or upgrade your package, visit the Packages section in your account.',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'keyword' => 'technical',
                'response' => 'If you\'re experiencing technical issues, try these steps: 1) Clear your browser cache, \ 2) Try a different browser, 3) Check your internet connection, 4) Make sure your device meets the minimum requirements. If problems persist, contact our technical support team learnify.supp.G2025@gmail.com',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'keyword' => 'default',
                'response' => 'I\'m here to help with your learning journey. You can ask me about assignments, lectures, lessons, or technical support. How can I assist you today?',
                'created_at' => now(),
                'updated_at' => now()
            ],
        ]);
    }
}