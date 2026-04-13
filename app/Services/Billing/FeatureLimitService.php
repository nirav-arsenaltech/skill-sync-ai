<?php

namespace App\Services\Billing;

use App\Models\CoverLetter;
use App\Models\InterviewPrep;
use App\Models\Job;
use App\Models\Matches;
use App\Models\OnlineExam;
use App\Models\Resume;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use InvalidArgumentException;

class FeatureLimitService
{
    public const FREE_LIMIT = 10;

    /**
     * @var array<string, class-string<Model>>
     */
    private array $featureModels = [
        'jobs' => Job::class,
        'resumes' => Resume::class,
        'analytics' => Matches::class,
        'cover_letters' => CoverLetter::class,
        'interview_preps' => InterviewPrep::class,
        'online_exams' => OnlineExam::class,
    ];

    /**
     * @var array<string, string>
     */
    private array $featureNames = [
        'jobs' => 'jobs',
        'resumes' => 'resumes',
        'analytics' => 'analytics reports',
        'cover_letters' => 'cover letters',
        'interview_preps' => 'interview prep sessions',
        'online_exams' => 'online exams',
    ];

    public function __construct(
        private readonly PlanManager $planManager,
    ) {}

    public function currentCount(User $user, string $feature): int
    {
        $modelClass = $this->featureModels[$feature] ?? null;

        if ($modelClass === null) {
            throw new InvalidArgumentException("Unsupported feature [{$feature}].");
        }

        return $modelClass::query()
            ->where('user_id', $user->id)
            ->count();
    }

    public function remainingFreeCapacity(User $user, string $feature): ?int
    {
        if ($this->planManager->isPro($user)) {
            return null;
        }

        return max(self::FREE_LIMIT - $this->currentCount($user, $feature), 0);
    }

    public function denialMessage(User $user, string $feature, int $requested = 1): ?string
    {
        if ($this->planManager->isPro($user)) {
            return null;
        }

        $currentCount = $this->currentCount($user, $feature);

        if (($currentCount + $requested) <= self::FREE_LIMIT) {
            return null;
        }

        $featureName = $this->featureNames[$feature] ?? $feature;

        return 'Free users can create up to '.self::FREE_LIMIT." {$featureName}. Upgrade to PRO to continue.";
    }

    public function validationKey(string $feature): string
    {
        return match ($feature) {
            'jobs' => 'title',
            'resumes' => 'file',
            'analytics' => 'resume_ids',
            'cover_letters' => 'job_id',
            'interview_preps' => 'job_id',
            'online_exams' => 'job_id',
            default => 'plan',
        };
    }
}
