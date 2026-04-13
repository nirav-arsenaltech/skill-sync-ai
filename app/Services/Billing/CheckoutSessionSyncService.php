<?php

namespace App\Services\Billing;

use App\Models\User;
use Illuminate\Support\Carbon;
use Laravel\Cashier\Subscription as CashierSubscription;
use RuntimeException;
use Stripe\Checkout\Session as StripeCheckoutSession;
use Stripe\Customer as StripeCustomer;
use Stripe\PaymentMethod as StripePaymentMethod;
use Stripe\StripeClient;
use Stripe\Subscription as StripeSubscription;

class CheckoutSessionSyncService
{
    public function sync(User $user, string $sessionId): CashierSubscription
    {
        $stripe = $this->stripe();

        /** @var StripeCheckoutSession $session */
        $session = $stripe->checkout->sessions->retrieve($sessionId, [
            'expand' => ['customer', 'subscription', 'subscription.items.data.price'],
        ]);

        if ($session->mode !== StripeCheckoutSession::MODE_SUBSCRIPTION) {
            throw new RuntimeException('The completed Stripe Checkout session is not a subscription checkout.');
        }

        if ($session->payment_status !== StripeCheckoutSession::PAYMENT_STATUS_PAID) {
            throw new RuntimeException('Stripe Checkout payment has not been completed yet.');
        }

        $customerId = $this->resolveCustomerId($user, $stripe, $session->customer);

        $stripeSubscription = $session->subscription instanceof StripeSubscription
            ? $session->subscription
            : $this->resolveLatestSubscription($stripe, $customerId, is_string($session->subscription) ? $session->subscription : null);

        $this->storeStripeCustomerId($user, $customerId);
        $this->syncPaymentMethodDetails($user, $stripe, $customerId, $stripeSubscription);

        return $this->syncLocalSubscription($user, $stripeSubscription);
    }

    public function syncLatestForUser(User $user): CashierSubscription
    {
        $stripe = $this->stripe();
        $customerId = $this->resolveCustomerId($user, $stripe);

        $stripeSubscription = $this->resolveLatestSubscription($stripe, $customerId);

        $this->storeStripeCustomerId($user, $customerId);
        $this->syncPaymentMethodDetails($user, $stripe, $customerId, $stripeSubscription);

        return $this->syncLocalSubscription($user, $stripeSubscription);
    }

    private function stripe(): StripeClient
    {
        $secret = config('services.stripe.secret');

        if (! filled($secret)) {
            throw new RuntimeException('Stripe secret is not configured.');
        }

        return new StripeClient($secret);
    }

    private function resolveCustomerId(User $user, StripeClient $stripe, string|StripeCustomer|null $customer = null): string
    {
        if ($customer instanceof StripeCustomer) {
            return $customer->id;
        }

        if (is_string($customer) && $customer !== '') {
            return $customer;
        }

        if (filled($user->stripe_id)) {
            return $user->stripe_id;
        }

        $customers = $stripe->customers->all([
            'email' => $user->email,
            'limit' => 10,
        ]);

        $matchedCustomer = collect($customers->data)
            ->first(fn (StripeCustomer $stripeCustomer): bool => $stripeCustomer->email === $user->email);

        if (! $matchedCustomer instanceof StripeCustomer) {
            throw new RuntimeException('No Stripe customer was found for this user.');
        }

        return $matchedCustomer->id;
    }

    private function storeStripeCustomerId(User $user, string $customerId): void
    {
        if ($user->stripe_id === $customerId) {
            return;
        }

        $user->forceFill([
            'stripe_id' => $customerId,
        ])->save();

        $user->refresh();
    }

    private function syncPaymentMethodDetails(
        User $user,
        StripeClient $stripe,
        string $customerId,
        ?StripeSubscription $stripeSubscription = null,
    ): void {
        $customer = $stripe->customers->retrieve($customerId, [
            'expand' => ['invoice_settings.default_payment_method'],
        ]);

        $defaultPaymentMethod = $customer->invoice_settings?->default_payment_method;

        if (! $defaultPaymentMethod && $stripeSubscription?->default_payment_method) {
            $defaultPaymentMethod = $stripeSubscription->default_payment_method instanceof StripePaymentMethod
                ? $stripeSubscription->default_payment_method
                : $stripe->paymentMethods->retrieve($stripeSubscription->default_payment_method);
        }

        if (! $defaultPaymentMethod) {
            $paymentMethods = $stripe->paymentMethods->all([
                'customer' => $customerId,
                'type' => 'card',
                'limit' => 1,
            ]);

            $defaultPaymentMethod = $paymentMethods->data[0] ?? null;
        }

        if (! $defaultPaymentMethod) {
            $user->forceFill([
                'pm_type' => null,
                'pm_last_four' => null,
            ])->save();

            return;
        }

        if ($defaultPaymentMethod->type === 'card') {
            $pmType = $defaultPaymentMethod->card->brand;
            $pmLastFour = $defaultPaymentMethod->card->last4;
        } else {
            $pmType = $defaultPaymentMethod->type;
            $pmLastFour = $defaultPaymentMethod->{$defaultPaymentMethod->type}->last4 ?? null;
        }

        $user->forceFill([
            'pm_type' => $pmType,
            'pm_last_four' => $pmLastFour,
        ])->save();
    }

    private function resolveLatestSubscription(StripeClient $stripe, string $customerId, ?string $preferredSubscriptionId = null): StripeSubscription
    {
        if ($preferredSubscriptionId) {
            return $stripe->subscriptions->retrieve($preferredSubscriptionId, [
                'expand' => ['items.data.price'],
            ]);
        }

        $subscriptions = $stripe->subscriptions->all([
            'customer' => $customerId,
            'status' => 'all',
            'limit' => 10,
            'expand' => ['data.items.data.price'],
        ]);

        $stripeSubscription = collect($subscriptions->data)
            ->first(function (StripeSubscription $subscription): bool {
                return in_array($subscription->status, ['active', 'trialing', 'past_due', 'unpaid'], true);
            });

        if (! $stripeSubscription instanceof StripeSubscription) {
            throw new RuntimeException('No Stripe subscription was found for this customer.');
        }

        return $stripeSubscription;
    }

    private function syncLocalSubscription(User $user, StripeSubscription $stripeSubscription): CashierSubscription
    {
        $firstItem = $stripeSubscription->items->data[0] ?? null;

        if ($firstItem === null) {
            throw new RuntimeException('Stripe did not return any subscription items for this customer.');
        }

        $trialEndsAt = isset($stripeSubscription->trial_end)
            ? Carbon::createFromTimestamp($stripeSubscription->trial_end)
            : null;

        $isSinglePrice = count($stripeSubscription->items->data) === 1;

        /** @var CashierSubscription $subscription */
        $subscription = $user->subscriptions()->updateOrCreate([
            'stripe_id' => $stripeSubscription->id,
        ], [
            'type' => $stripeSubscription->metadata['type'] ?? $stripeSubscription->metadata['name'] ?? 'default',
            'stripe_status' => $stripeSubscription->status,
            'stripe_price' => $isSinglePrice ? $firstItem->price->id : null,
            'quantity' => $isSinglePrice ? ($firstItem->quantity ?? null) : null,
            'trial_ends_at' => $trialEndsAt,
            'ends_at' => null,
        ]);

        $user->forceFill([
            'trial_ends_at' => $trialEndsAt,
        ])->save();

        $subscriptionItemIds = [];

        foreach ($stripeSubscription->items->data as $item) {
            $subscriptionItemIds[] = $item->id;

            $subscription->items()->updateOrCreate([
                'stripe_id' => $item->id,
            ], [
                'stripe_product' => is_string($item->price->product) ? $item->price->product : $item->price->product->id,
                'stripe_price' => $item->price->id,
                'quantity' => $item->quantity ?? null,
            ]);
        }

        $subscription->items()->whereNotIn('stripe_id', $subscriptionItemIds)->delete();

        return $subscription->fresh(['items']);
    }
}
