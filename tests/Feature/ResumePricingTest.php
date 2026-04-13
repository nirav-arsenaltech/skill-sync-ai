<?php

use App\Models\User;
use Laravel\Cashier\Subscription;

it('redirects free plan requests back to pricing because checkout is stripe-only for paid plans', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('billing.checkout', 'free'));

    $response
        ->assertRedirect(route('pricing'))
        ->assertSessionHas('flash.message', 'This plan is not billed through Stripe.');
});

it('detects when the requested paid plan is already active', function () {
    config()->set('pricing.plans.pro.stripe_price_id', 'price_monthly');

    $user = User::factory()->create();

    Subscription::create([
        'user_id' => $user->id,
        'type' => 'default',
        'stripe_id' => 'sub_123',
        'stripe_status' => 'active',
        'stripe_price' => 'price_monthly',
    ]);

    $response = $this->actingAs($user)->get(route('billing.checkout', 'pro'));

    $response
        ->assertRedirect(route('pricing'))
        ->assertSessionHas('flash.message', 'This subscription is already active on your account.');
});
