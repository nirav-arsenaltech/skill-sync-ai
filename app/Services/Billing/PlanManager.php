<?php

namespace App\Services\Billing;

use App\Models\User;

class PlanManager
{
    public function __construct(
        private readonly StripePriceResolver $stripePriceResolver,
    ) {}

    public function proPriceId(): string
    {
        return $this->stripePriceResolver->proMonthlyPriceId();
    }

    public function isPro(User $user): bool
    {
        $subscription = $user->subscription('default');

        if ($subscription === null || $subscription->ended()) {
            return false;
        }

        if ($user->subscribed('default')) {
            return true;
        }

        return $subscription->stripe_price === $this->proPriceId();
    }

    public function planKey(?User $user): string
    {
        if ($user === null) {
            return 'free';
        }

        return $this->isPro($user) ? 'pro' : 'free';
    }

    public function planLabel(?User $user): string
    {
        return strtoupper($this->planKey($user));
    }
}
