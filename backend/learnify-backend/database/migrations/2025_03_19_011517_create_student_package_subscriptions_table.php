<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStudentPackageSubscriptionsTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('student_package_subscriptions', function (Blueprint $table) {
            $table->id(); // Primary key
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade'); // Foreign key to users table
            $table->foreignId('package_id')->constrained('subscription_packages')->onDelete('cascade'); // Foreign key to subscription_packages table
            $table->date('start_date'); // Start date of the subscription
            $table->date('end_date'); // End date of the subscription
            $table->timestamps(); // created_at and updated_at columns
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_package_subscriptions');
    }
}