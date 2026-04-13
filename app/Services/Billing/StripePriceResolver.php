<?php

namespace App\Services\Billing;

use RuntimeException;
use Stripe\StripeClient;

class StripePriceResolver
{
    public function proMonthlyPriceId(): string
    {
        $configuredPriceId = config('pricing.plans.pro.stripe_price_id');

        if (filled($configuredPriceId)) {
            return $configuredPriceId;
        }

        $secret = config('services.stripe.secret');

        if (! filled($secret)) {
            throw new RuntimeException('Stripe secret is not configured.');
        }

        $stripe = new StripeClient($secret);
        $lookupKey = 'skillsync_pro_monthly';

        $prices = $stripe->prices->all([
            'lookup_keys' => [$lookupKey],
            'active' => true,
            'limit' => 1,
        ]);

        if ($prices->count() > 0) {
            return $prices->data[0]->id;
        }

        $products = $stripe->products->all([
            'active' => true,
            'limit' => 100,
        ]);

        $product = collect($products->data)->first(function (object $product): bool {
            return ($product->metadata['skill_sync_slug'] ?? null) === 'pro';
        });

        if ($product === null) {
            $product = $stripe->products->create([
                'name' => 'SkillSync Pro',
                'description' => 'SkillSync Pro monthly subscription',
                'metadata' => [
                    'skill_sync_slug' => 'pro',
                ],
            ]);
        }

        $price = $stripe->prices->create([
            'unit_amount' => 2900,
            'currency' => 'usd',
            'recurring' => [
                'interval' => 'month',
            ],
            'product' => $product->id,
            'lookup_key' => $lookupKey,
            'metadata' => [
                'skill_sync_slug' => 'pro',
            ],
        ]);

        return $price->id;
    }
}
