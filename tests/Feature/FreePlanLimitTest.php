<?php

use App\Models\Job;
use App\Models\Matches;
use App\Models\OnlineExam;
use App\Models\Resume;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('blocks free users from creating more than ten jobs', function () {
    $user = User::factory()->create();

    for ($i = 0; $i < 10; $i++) {
        Job::create([
            'user_id' => $user->id,
            'title' => "Job {$i}",
            'description' => 'Job description',
        ]);
    }

    $response = $this->actingAs($user)->post(route('jobs.store'), [
        'title' => 'Blocked Job',
        'description' => 'Blocked description',
    ]);

    $response
        ->assertSessionHasErrors([
            'title' => 'Free users can create up to 10 jobs. Upgrade to PRO to continue.',
        ])
        ->assertRedirect();
});

it('blocks free users from uploading more than ten resumes', function () {
    Storage::fake(storageDiskName());

    $user = User::factory()->create();

    for ($i = 0; $i < 10; $i++) {
        Resume::create([
            'user_id' => $user->id,
            'name' => "Resume {$i}",
            'file_path' => "resumes/{$i}.pdf",
        ]);
    }

    $response = $this->actingAs($user)->post(route('resumes.store'), [
        'name' => 'Blocked Resume',
        'file' => UploadedFile::fake()->create('resume.pdf', 10),
    ]);

    $response
        ->assertSessionHasErrors([
            'file' => 'Free users can create up to 10 resumes. Upgrade to PRO to continue.',
        ])
        ->assertRedirect();
});

it('blocks free users from creating online exams after ten records', function () {
    $user = User::factory()->create();
    $job = Job::create([
        'user_id' => $user->id,
        'title' => 'Frontend Engineer',
        'description' => 'Build interfaces',
    ]);
    $resume = Resume::create([
        'user_id' => $user->id,
        'name' => 'Resume',
        'file_path' => 'resumes/resume.txt',
    ]);

    for ($i = 0; $i < 10; $i++) {
        OnlineExam::create([
            'user_id' => $user->id,
            'resume_id' => $resume->id,
            'job_description_id' => $job->id,
            'status' => 'completed',
            'questions' => [],
            'question_count' => 0,
            'time_limit_minutes' => 10,
        ]);
    }

    $response = $this->actingAs($user)->post(route('online-exams.store'), [
        'job_id' => $job->id,
        'resume_id' => $resume->id,
        'focus' => 'Frontend',
        'time_limit_minutes' => 15,
        'question_count' => 5,
    ]);

    $response
        ->assertSessionHasErrors([
            'job_id' => 'Free users can create up to 10 online exams. Upgrade to PRO to continue.',
        ])
        ->assertRedirect();
});

it('blocks analytics scans when the request would push a free user above ten results', function () {
    $user = User::factory()->create();
    $job = Job::create([
        'user_id' => $user->id,
        'title' => 'Backend Engineer',
        'description' => 'Build APIs',
    ]);

    $resumeOne = Resume::create([
        'user_id' => $user->id,
        'name' => 'Resume One',
        'file_path' => 'resumes/one.txt',
    ]);

    $resumeTwo = Resume::create([
        'user_id' => $user->id,
        'name' => 'Resume Two',
        'file_path' => 'resumes/two.txt',
    ]);

    for ($i = 0; $i < 9; $i++) {
        Matches::create([
            'user_id' => $user->id,
            'resume_id' => $resumeOne->id,
            'job_description_id' => $job->id,
            'match_percentage' => 70,
            'semantic_score' => 70,
            'keyword_score' => 70,
            'keyword_gap' => 0,
            'ai_result' => ['summary' => 'ok'],
        ]);
    }

    $response = $this->actingAs($user)->post(route('analytics.scan'), [
        'job_id' => $job->id,
        'resume_ids' => [$resumeOne->id, $resumeTwo->id],
    ]);

    $response
        ->assertSessionHasErrors([
            'resume_ids' => 'Free users can create up to 10 analytics reports. Upgrade to PRO to continue.',
        ])
        ->assertRedirect();
});
