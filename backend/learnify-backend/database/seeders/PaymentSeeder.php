<?php

namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\Payment;

class PaymentSeeder extends Seeder
{
    public function run()
    {
        Payment::create([
            'package_user_id' => 1,
            'amount_paid' => 29.99,
            'transaction_reference' => 'PAY-' . time(),
            'payment_status' => 'completed'
        ]);
    }
}