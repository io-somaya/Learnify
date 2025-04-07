<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PackagesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
{
    \App\Models\Package::create([
        'name' => 'Monthly Subscription',
        'description' => 'Basic monthly access',
        'price' => 100,
        'duration_days' => 30
    ]);

    \App\Models\Package::create([
        'name' => 'Annual Subscription',
        'description' => 'Yearly access with discount',
        'price' => 1000,
        'duration_days' => 365
    ]);
}
}