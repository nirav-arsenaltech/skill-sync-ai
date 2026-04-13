<?php

namespace App\Http\Controllers;

use App\Services\Billing\PlanManager;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(
        private readonly PlanManager $planManager,
    ) {}

    public function index(): Response
    {
        return Inertia::render('Welcome');
    }

    public function pricing(Request $request): Response
    {
        $user = $request->user();
        $subscription = $user?->subscription('default');
        $isPro = $this->planManager->planKey($user) === 'pro';
        $plans = collect(config('pricing.plans'))
            ->map(fn (array $plan, string $key) => [
                'key' => $key,
                'name' => $plan['name'],
                'headline' => $plan['headline'],
                'price' => $plan['price'],
                'price_suffix' => $plan['price_suffix'],
                'description' => $plan['description'],
                'features' => $plan['features'],
                'highlighted' => $plan['highlighted'],
                'stripe_price_id' => $plan['stripe_price_id'],
                'is_free' => $key === 'free',
            ])
            ->values();

        $planLabel = $this->planManager->planLabel($user);
        $cancelScheduled = $subscription?->onGracePeriod() ?? false;
        $accessEndsAt = $subscription?->ends_at?->toDateTimeString();

        $statusLabel = match (true) {
            $subscription === null => null,
            $subscription->ended() => 'Canceled',
            $cancelScheduled => 'Cancellation scheduled',
            filled($subscription->stripe_status) => str($subscription->stripe_status)->replace('_', ' ')->title()->toString(),
            default => 'Active',
        };

        return Inertia::render('Pricing', [
            'plans' => $plans,
            'billing' => [
                'isAuthenticated' => $user !== null,
                'isSubscribed' => $user?->subscribed('default') ?? false,
                'isPro' => $isPro,
                'hasBillingProfile' => filled($user?->stripe_id),
                'canSync' => filled($user?->stripe_id) && $planLabel !== 'PRO',
                'canCancel' => $subscription !== null && ! $subscription->ended() && ! $cancelScheduled,
                'cancelScheduled' => $cancelScheduled,
                'stripeCustomerId' => $user?->stripe_id,
                'currentPriceId' => $subscription?->stripe_price,
                'status' => $subscription?->stripe_status,
                'statusLabel' => $statusLabel,
                'planLabel' => $planLabel,
                'paymentMethod' => filled($user?->pm_type)
                    ? trim(sprintf('%s ending %s', strtoupper((string) $user->pm_type), (string) $user->pm_last_four))
                    : null,
                'pmType' => $user?->pm_type,
                'pmLastFour' => $user?->pm_last_four,
                'trialEndsAt' => $subscription?->trial_ends_at?->toDateTimeString() ?? $user?->trial_ends_at?->toDateTimeString(),
                'accessEndsAt' => $accessEndsAt,
            ],
        ]);
    }
}
