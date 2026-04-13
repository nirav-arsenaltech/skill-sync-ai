<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Cashier\Subscription;

it('renders the pricing page', function () {
    $response = $this->get(route('pricing'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Pricing')
            ->has('plans', 2)
            ->where('plans.0.key', 'free')
            ->where('plans.0.is_free', true)
            ->where('plans.1.key', 'pro')
            ->where('plans.1.is_free', false)
            ->where('billing.isAuthenticated', false)
            ->where('billing.isSubscribed', false)
            ->where('billing.planLabel', 'FREE'));
});

it('includes the authenticated user billing snapshot on the pricing page', function () {
    $user = User::factory()->create([
        'stripe_id' => 'cus_123',
        'pm_type' => 'visa',
        'pm_last_four' => '4242',
    ]);

    $response = $this->actingAs($user)->get(route('pricing'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Pricing')
            ->where('billing.isAuthenticated', true)
            ->where('billing.hasBillingProfile', true)
            ->where('billing.isPro', false)
            ->where('billing.currentPriceId', null)
            ->where('billing.status', null)
            ->where('billing.planLabel', 'FREE')
            ->where('billing.stripeCustomerId', 'cus_123')
            ->where('billing.pmType', 'visa')
            ->where('billing.pmLastFour', '4242')
            ->where('billing.paymentMethod', 'VISA ending 4242')
            ->where('auth.user.plan_label', 'FREE'));
});

it('registers the pricing route and keeps the welcome page available', function () {
    $response = $this->get(route('home'));
    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Welcome'));

    expect(route('pricing', absolute: false))->toBe('/pricing');
});

it('includes the pro billing snapshot for subscribed users', function () {
    $user = User::factory()->create([
        'stripe_id' => 'cus_pro_123',
        'pm_type' => 'visa',
        'pm_last_four' => '4242',
        'trial_ends_at' => now()->addDays(7),
    ]);

    Subscription::create([
        'user_id' => $user->id,
        'type' => 'default',
        'stripe_id' => 'sub_pro_123',
        'stripe_status' => 'active',
        'stripe_price' => 'price_pro',
        'trial_ends_at' => now()->addDays(7),
    ]);

    $response = $this->actingAs($user)->get(route('pricing'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Pricing')
            ->where('billing.isAuthenticated', true)
            ->where('billing.isPro', true)
            ->where('billing.isSubscribed', true)
            ->where('billing.hasBillingProfile', true)
            ->where('billing.planLabel', 'PRO')
            ->where('billing.status', 'active')
            ->where('billing.statusLabel', 'Active')
            ->where('billing.cancelScheduled', false)
            ->where('billing.paymentMethod', 'VISA ending 4242'));
});

it('includes cancellation scheduling details for pro users on a grace period', function () {
    $user = User::factory()->create([
        'stripe_id' => 'cus_pro_123',
        'pm_type' => 'visa',
        'pm_last_four' => '4242',
    ]);

    Subscription::create([
        'user_id' => $user->id,
        'type' => 'default',
        'stripe_id' => 'sub_pro_123',
        'stripe_status' => 'active',
        'stripe_price' => 'price_pro',
        'ends_at' => now()->addDays(14),
    ]);

    $response = $this->actingAs($user)->get(route('pricing'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Pricing')
            ->where('billing.isPro', true)
            ->where('billing.cancelScheduled', true)
            ->where('billing.canCancel', false)
            ->where('billing.statusLabel', 'Cancellation scheduled'));
});
