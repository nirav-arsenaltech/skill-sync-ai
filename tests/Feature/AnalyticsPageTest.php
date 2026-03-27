<?php

use App\Models\Job;
use App\Models\Matches;
use App\Models\Resume;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('renders analytics history with normalized report data', function () {
    $user = User::factory()->create();

    $job = Job::create([
        'user_id' => $user->id,
        'title' => 'Senior Laravel Developer',
        'description' => 'Build Laravel and React features.',
    ]);

    $resume = Resume::create([
        'user_id' => $user->id,
        'name' => 'Jane Doe Resume',
        'file_path' => 'resumes/jane-doe.pdf',
    ]);

    Matches::create([
        'user_id' => $user->id,
        'resume_id' => $resume->id,
        'job_description_id' => $job->id,
        'match_percentage' => 84,
        'semantic_score' => 79,
        'keyword_score' => 81,
        'keyword_gap' => 19,
        'ai_result' => json_encode([
            'strengths' => 'Strong Laravel and Inertia experience.',
            'weaknesses' => 'Needs deeper CI/CD exposure.',
            'ai_text' => 'Detailed analysis body.',
            'ats_best_practice' => [
                'ats_score' => 88,
                'email_address' => 'Present on the resume.',
            ],
            'skills_analysis' => [
                [
                    'skill' => 'Laravel',
                    'resume_count' => 4,
                    'job_count' => 3,
                    'gap' => -1,
                    'matched' => true,
                ],
            ],
        ]),
    ]);

    $response = $this
        ->actingAs($user)
        ->get(route('analytics.index'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Analytics/Index')
            ->has('matchedHistory', 1)
            ->where('matchedHistory.0.resume_name', 'Jane Doe Resume')
            ->missing('matchedHistory.0.overall_match_percentage')
            ->where('matchedHistory.0.ai_result.overall_match_percentage', 84)
            ->where('matchedHistory.0.ai_result.scores.semantic_score', 79)
            ->where('matchedHistory.0.ai_result.scores.keyword_score', 81)
            ->where('matchedHistory.0.ai_result.scores.keyword_gap', '19')
            ->where('matchedHistory.0.ai_result.ats_best_practice.ats_score', 88)
            ->where('matchedHistory.0.ai_result.strengths', 'Strong Laravel and Inertia experience.')
            ->where('matchedHistory.0.ai_result.weaknesses', 'Needs deeper CI/CD exposure.')
            ->where('matchedHistory.0.ai_result.skills_analysis.0.matched', true)
        );
});
