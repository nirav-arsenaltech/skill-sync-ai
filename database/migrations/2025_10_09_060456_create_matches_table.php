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
        if (!Schema::hasTable('matches')) {
            Schema::create('matches', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->foreignId('resume_id')->constrained('resumes')->onDelete('cascade');
                $table->foreignId('job_description_id')->constrained('job_descriptions')->onDelete('cascade');
                $table->float('match_percentage')->nullable();
                $table->float('semantic_score')->nullable();
                $table->float('keyword_score')->nullable();
                $table->json('keyword_gap')->nullable();
                $table->timestamps();
            });
        }

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('matches');
    }
};
