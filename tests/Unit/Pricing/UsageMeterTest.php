<?php

use App\Models\CoverLetter;
use App\Models\InterviewPrep;
use App\Models\Job;
use App\Models\Matches;
use App\Models\OnlineExam;
use App\Models\Resume;
use App\Models\User;
use App\Services\Billing\FeatureLimitService;
use App\Services\Billing\PlanManager;
use App\Services\Billing\StripePriceResolver;
use Laravel\Cashier\Subscription;

it('defaults users to non admin access', function () {
    expect(User::factory()->make()->is_admin)->toBeFalse();
});

it('defines free and pro pricing plans', function () {
    $plans = config('pricing.plans');

    expect(array_keys($plans))->toBe(['free', 'pro'])
        ->and($plans['free']['stripe_price_id'])->toBeNull()
        ->and($plans['pro']['stripe_price_id'])->toBe(config('pricing.plans.pro.stripe_price_id'));
});

it('resolves free and pro labels from the plan manager', function () {
    config()->set('pricing.plans.pro.stripe_price_id', 'price_pro');

    $planManager = app(PlanManager::class);
    $freeUser = User::factory()->create();
    $proUser = User::factory()->create();

    Subscription::create([
        'user_id' => $proUser->id,
        'type' => 'default',
        'stripe_id' => 'sub_pro',
        'stripe_status' => 'active',
        'stripe_price' => 'price_pro',
    ]);

    expect($planManager->planLabel($freeUser))->toBe('FREE')
        ->and($planManager->planLabel($proUser))->toBe('PRO');
});

it('uses the configured pro price before trying stripe resolution', function () {
    config()->set('pricing.plans.pro.stripe_price_id', 'price_configured');

    $resolver = app(StripePriceResolver::class);

    expect($resolver->proMonthlyPriceId())->toBe('price_configured');
});

it('denies free users once they reach the limit for each managed feature', function (string $feature, Closure $seedRecords) {
    $user = User::factory()->create();
    $limitService = app(FeatureLimitService::class);

    $seedRecords($user);

    expect($limitService->denialMessage($user, $feature))
        ->toBeString()
        ->not->toBeEmpty();
})->with([
    'jobs' => ['jobs', function (User $user): void {
        for ($i = 0; $i < 10; $i++) {
            Job::create([
                'user_id' => $user->id,
                'title' => "Job {$i}",
                'description' => 'Job description',
            ]);
        }
    }],
    'resumes' => ['resumes', function (User $user): void {
        for ($i = 0; $i < 10; $i++) {
            Resume::create([
                'user_id' => $user->id,
                'name' => "Resume {$i}",
                'file_path' => "resumes/{$i}.pdf",
            ]);
        }
    }],
    'analytics' => ['analytics', function (User $user): void {
        $job = Job::create([
            'user_id' => $user->id,
            'title' => 'Backend Engineer',
            'description' => 'Build APIs',
        ]);
        $resume = Resume::create([
            'user_id' => $user->id,
            'name' => 'Resume',
            'file_path' => 'resumes/analytics.txt',
        ]);

        for ($i = 0; $i < 10; $i++) {
            Matches::create([
                'user_id' => $user->id,
                'resume_id' => $resume->id,
                'job_description_id' => $job->id,
                'match_percentage' => 70,
                'semantic_score' => 70,
                'keyword_score' => 70,
                'keyword_gap' => 0,
                'ai_result' => ['summary' => 'ok'],
            ]);
        }
    }],
    'cover letters' => ['cover_letters', function (User $user): void {
        $job = Job::create([
            'user_id' => $user->id,
            'title' => 'Product Designer',
            'description' => 'Design products',
        ]);
        $resume = Resume::create([
            'user_id' => $user->id,
            'name' => 'Resume',
            'file_path' => 'resumes/cover-letter.txt',
        ]);

        for ($i = 0; $i < 10; $i++) {
            CoverLetter::create([
                'user_id' => $user->id,
                'resume_id' => $resume->id,
                'job_description_id' => $job->id,
                'company_name' => "Company {$i}",
                'ai_result' => ['summary' => 'ok'],
                'file_path' => "cover_letters/{$i}.pdf",
                'template_id' => 0,
            ]);
        }
    }],
    'interview preps' => ['interview_preps', function (User $user): void {
        $job = Job::create([
            'user_id' => $user->id,
            'title' => 'QA Engineer',
            'description' => 'Test software',
        ]);
        $resume = Resume::create([
            'user_id' => $user->id,
            'name' => 'Resume',
            'file_path' => 'resumes/interview.txt',
        ]);

        for ($i = 0; $i < 10; $i++) {
            InterviewPrep::create([
                'user_id' => $user->id,
                'resume_id' => $resume->id,
                'job_description_id' => $job->id,
                'questions_answers' => ['questions' => []],
                'summary' => 'summary',
            ]);
        }
    }],
    'online exams' => ['online_exams', function (User $user): void {
        $job = Job::create([
            'user_id' => $user->id,
            'title' => 'Frontend Engineer',
            'description' => 'Build interfaces',
        ]);
        $resume = Resume::create([
            'user_id' => $user->id,
            'name' => 'Resume',
            'file_path' => 'resumes/online-exam.txt',
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
    }],
]);

it('allows pro users to keep creating records past the free limit', function () {
    config()->set('pricing.plans.pro.stripe_price_id', 'price_pro');

    $user = User::factory()->create();

    Subscription::create([
        'user_id' => $user->id,
        'type' => 'default',
        'stripe_id' => 'sub_pro',
        'stripe_status' => 'active',
        'stripe_price' => 'price_pro',
    ]);

    for ($i = 0; $i < 12; $i++) {
        Job::create([
            'user_id' => $user->id,
            'title' => "Job {$i}",
            'description' => 'Job description',
        ]);
    }

    expect(app(FeatureLimitService::class)->denialMessage($user, 'jobs'))->toBeNull();
});
