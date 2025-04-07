<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Package;

class PackageSeeder extends Seeder
{
    public function run()
    {
        $packages = [
            [
                'name' => 'Basic Plan',
                'description' => '1 month access',
                'price' => 29.99,
                'duration_days' => 30
            ],
            [
                'name' => 'Premium Plan',
                'description' => '1 year access',
                'price' => 255.99,
                'duration_days' => 365
            ]
        ];

        foreach ($packages as $package) {
            Package::create($package);
        }
    }
}