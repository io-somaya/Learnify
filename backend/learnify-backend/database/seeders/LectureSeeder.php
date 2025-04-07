<?php

namespace Database\Seeders;

use App\Models\Lecture;
use Illuminate\Database\Seeder;

class LectureSeeder extends Seeder
{
    public function run()
    {
        $lectures = [
            [
                'title' => 'Mathematics Basics',
                'day_of_week' => 'Monday',
                'start_time' => '09:00',
                'end_time' => '10:30',
                'description' => 'Introduction to algebra and geometry',
                'grade' => '1',
                'zoom_link' => 'https://zoom.us/j/123456789',
                'is_active' => true
            ],
            [
                'title' => 'Advanced Science',
                'day_of_week' => 'Wednesday',
                'start_time' => '11:00',
                'end_time' => '12:30',
                'description' => 'Physics and chemistry fundamentals',
                'grade' => '2',
                'zoom_link' => 'https://zoom.us/j/987654321',
                'is_active' => true
            ],
            [
                'title' => 'Literature Class',
                'day_of_week' => 'Friday',
                'start_time' => '13:00',
                'end_time' => '14:30',
                'description' => 'Arabic poetry and prose analysis',
                'grade' => '3',
                'zoom_link' => 'https://zoom.us/j/555555555',
                'is_active' => true
            ]
        ];

        
        foreach ($lectures as $lecture) {
            Lecture::create($lecture);
        }
    }
}