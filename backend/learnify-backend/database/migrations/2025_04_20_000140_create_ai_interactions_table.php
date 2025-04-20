<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First check if users table exists
        if (Schema::hasTable('users')) {
            Schema::create('ai_interactions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->text('query');
                $table->text('response');
                $table->string('topic')->nullable();
                $table->boolean('was_helpful')->nullable();
                $table->timestamps();
            });
        } else {
            // Create table without foreign key first
            Schema::create('ai_interactions', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->text('query');
                $table->text('response');
                $table->string('topic')->nullable();
                $table->boolean('was_helpful')->nullable();
                $table->timestamps();
            });

            // Then add foreign key constraint
            Schema::table('ai_interactions', function (Blueprint $table) {
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_interactions');
    }
};