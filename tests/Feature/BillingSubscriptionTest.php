<?php

use App\Http\Controllers\BillingController;
use App\Models\User;
use App\Services\Billing\CheckoutSessionSyncService;
use App\Services\Billing\PlanManager;
use Laravel\Cashier\Subscription;

it('redirects guests away from billing checkout', function () {
    $this->get(route('billing.checkout', 'pro'))
        ->assertRedirect(route('login'));
});

it('redirects users without a stripe customer away from the billing portal', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('billing.portal'))
        ->assertRedirect(route('pricing'))
        ->assertSessionHas('flash.message', 'Create a Stripe subscription first before opening the billing portal.');
});

it('refreshes the local billing state when a user returns from the stripe portal', function () {
    $user = User::factory()->create([
        'stripe_id' => 'cus_test_123',
    ]);

    $mock = \Mockery::mock(CheckoutSessionSyncService::class);
    $mock->shouldReceive('syncLatestForUser')
        ->once()
        ->withArgs(fn (User $syncUser): bool => $syncUser->is($user));

    app()->instance(CheckoutSessionSyncService::class, $mock);

    $this->actingAs($user)
        ->get(route('billing.portal.return'))
        ->assertRedirect(route('pricing'))
        ->assertSessionHas('flash.message', 'Your billing changes were refreshed successfully.');
});

it('redirects users with an incomplete subscription back to pricing instead of opening another checkout', function () {
    $user = User::factory()->create();

    Subscription::create([
        'user_id' => $user->id,
        'type' => 'default',
        'stripe_id' => 'sub_incomplete',
        'stripe_status' => 'incomplete',
        'stripe_price' => 'price_pro',
    ]);

    $this->actingAs($user)
        ->get(route('billing.checkout', 'pro'))
        ->assertRedirect(route('pricing'))
        ->assertSessionHas('flash.message', 'This subscription is already active on your account.');
});

it('allows the checkout action to return a cashier checkout response object', function () {
    $returnType = (new ReflectionMethod(BillingController::class, 'checkout'))->getReturnType();

    expect($returnType)->not->toBeNull();
    expect($returnType instanceof ReflectionUnionType)->toBeTrue();

    $typeNames = collect($returnType->getTypes())
        ->map(fn (ReflectionNamedType $type): string => $type->getName())
        ->values()
        ->all();

    expect($typeNames)->toContain('Laravel\\Cashier\\Checkout');
    expect($typeNames)->toContain('Illuminate\\Http\\RedirectResponse');
});

it('syncs the local subscription immediately after a successful checkout redirect', function () {
    $user = User::factory()->create();

    $mock = \Mockery::mock(CheckoutSessionSyncService::class);
    $mock->shouldReceive('sync')
        ->once()
        ->withArgs(fn (User $syncUser, string $sessionId): bool => $syncUser->is($user) && $sessionId === 'cs_test_123');

    app()->instance(CheckoutSessionSyncService::class, $mock);

    $this->actingAs($user)
        ->get(route('billing.success', ['session_id' => 'cs_test_123']))
        ->assertRedirect(route('pricing'))
        ->assertSessionHas('flash.message', 'Stripe checkout completed. Your PRO subscription is now active.');
});

it('shows an error when stripe returns without a checkout session id', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('billing.success'))
        ->assertRedirect(route('pricing'))
        ->assertSessionHas('flash.message', 'Stripe returned without a checkout session reference. Open billing to confirm your subscription status.');
});

it('allows a user to manually sync the latest stripe subscription into the local database', function () {
    $user = User::factory()->create([
        'stripe_id' => 'cus_test_123',
    ]);

    $mock = \Mockery::mock(CheckoutSessionSyncService::class);
    $mock->shouldReceive('syncLatestForUser')
        ->once()
        ->withArgs(fn (User $syncUser): bool => $syncUser->is($user));

    app()->instance(CheckoutSessionSyncService::class, $mock);

    $this->actingAs($user)
        ->post(route('billing.sync'))
        ->assertRedirect(route('pricing'))
        ->assertSessionHas('flash.message', 'Stripe billing was synced successfully. Your PRO subscription is now active.');
});

it('shows an error when manual stripe sync fails', function () {
    $user = User::factory()->create([
        'stripe_id' => 'cus_test_123',
    ]);

    $mock = \Mockery::mock(CheckoutSessionSyncService::class);
    $mock->shouldReceive('syncLatestForUser')
        ->once()
        ->andThrow(new RuntimeException('sync failed'));

    app()->instance(CheckoutSessionSyncService::class, $mock);

    $this->actingAs($user)
        ->post(route('billing.sync'))
        ->assertRedirect(route('pricing'))
        ->assertSessionHas('flash.message', 'Stripe billing could not be synced into the local account yet.');
});

it('shows an error when a user tries to cancel without an active subscription', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('billing.subscription.cancel'))
        ->assertRedirect(route('pricing'))
        ->assertSessionHas('flash.message', 'There is no active PRO subscription to cancel.');
});

it('schedules a pro subscription cancellation at the end of the billing period', function () {
    $subscription = \Mockery::mock(Subscription::make([
        'user_id' => 1,
        'type' => 'default',
        'stripe_id' => 'sub_test_123',
        'stripe_status' => 'active',
        'stripe_price' => 'price_pro',
    ]))->makePartial();

    $subscription->forceFill([
        'ends_at' => now()->addMonth(),
    ]);

    $subscription->shouldReceive('ended')->once()->andReturnFalse();
    $subscription->shouldReceive('onGracePeriod')->once()->andReturnFalse();
    $subscription->shouldReceive('cancel')->once();
    $subscription->shouldReceive('fresh')->once()->andReturnSelf();

    $user = \Mockery::mock(User::factory()->create())->makePartial();
    $user->shouldReceive('subscription')->once()->with('default')->andReturn($subscription);

    $planManager = \Mockery::mock(PlanManager::class);
    $planManager->shouldReceive('planKey')->andReturn('pro');
    $planManager->shouldReceive('planLabel')->andReturn('PRO');
    app()->instance(PlanManager::class, $planManager);

    $this->actingAs($user)
        ->post(route('billing.subscription.cancel'))
        ->assertRedirect(route('pricing'))
        ->assertSessionHas('flash.message');
});
