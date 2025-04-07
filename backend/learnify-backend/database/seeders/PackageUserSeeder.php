<?php

namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Package;

class PackageUserSeeder extends Seeder
{
    public function run()
    {
        $user = User::first();
        $package = Package::first();

        // Attach package to user
        $user->packages()->attach($package->id, [
            'start_date' => now(),
            'end_date' => now()->addDays($package->duration_days),
            'status' => 'active'
        ]);
    }
}
