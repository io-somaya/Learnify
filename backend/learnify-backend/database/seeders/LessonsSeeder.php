<?php

namespace Database\Seeders;

use App\Models\Lesson;
use App\Models\Material;
use Illuminate\Database\Seeder;

class LessonsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create lessons for each grade
        $grades = ['1', '2', '3'];

        foreach ($grades as $grade) {
            // Create 5 lessons per grade
            for ($i = 1; $i <= 5; $i++) {
                $lesson = Lesson::create([
                    'title' => "Grade {$grade} - Lesson {$i}",
                    'description' => "This is a detailed description for grade {$grade} lesson number {$i}.",
                    'grade' => $grade,
                    'youtube_embed_code' => '<iframe width="560" height="315" src="https://www.youtube.com/embed/sample-id-' . $grade . $i . '" frameborder="0" allowfullscreen></iframe>'
                ]);

                // Create 2 materials for each lesson
                for ($j = 1; $j <= 2; $j++) {
                    Material::create([
                        'lesson_id' => $lesson->id,
                        'file_name' => "Material {$j} for Lesson {$i}",
                        'file_url' => "https://example.com/materials/grade{$grade}/lesson{$i}/material{$j}.pdf"
                    ]);
                }
            }
        }
    }
}
