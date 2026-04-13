<?php

namespace App\Http\Controllers;

use App\Services\Billing\CheckoutSessionSyncService;
use App\Services\Billing\PlanManager;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Laravel\Cashier\Checkout;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class BillingController extends Controller
{
    public function __construct(
        private readonly PlanManager $planManager,
        private readonly CheckoutSessionSyncService $checkoutSessionSyncService,
    ) {}

    public function checkout(Request $request, string $plan): Checkout|RedirectResponse
    {
        $selectedPlan = config("pricing.plans.{$plan}");

        if (! is_array($selectedPlan)) {
            throw new NotFoundHttpException;
        }

        if (! filled($selectedPlan['stripe_price_id']) && $plan !== 'pro') {
            return redirect()->route('pricing')->with('flash.message', 'This plan is not billed through Stripe.');
        }

        $user = $request->user();
        $subscription = $user->subscription('default');

        if ($subscription !== null && ! $subscription->ended()) {
            if ($user->subscribed('default')) {
                return redirect()->route('pricing')->with('flash.message', 'This subscription is already active on your account.');
            }

            return redirect()->route('pricing')->with([
                'flash.message' => 'Your subscription already exists but needs attention. Open the billing portal to manage it.',
                'flash.type' => 'error',
            ]);
        }

        $priceId = $plan === 'pro'
            ? $this->planManager->proPriceId()
            : $selectedPlan['stripe_price_id'];

        return $user
            ->newSubscription('default', $priceId)
            ->allowPromotionCodes()
            ->checkout([
                'success_url' => route('billing.success').'?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('billing.cancel'),
            ]);
    }

    public function portal(Request $request): Response
    {
        $user = $request->user();

        if (! filled($user->stripe_id)) {
            return redirect()->route('pricing')->with([
                'flash.message' => 'Create a Stripe subscription first before opening the billing portal.',
                'flash.type' => 'error',
            ]);
        }

        return $user->redirectToBillingPortal(route('billing.portal.return'));
    }

    public function portalReturn(Request $request): RedirectResponse
    {
        try {
            $this->checkoutSessionSyncService->syncLatestForUser($request->user());
        } catch (\Throwable $exception) {
            report($exception);
            Log::error('Stripe billing portal return sync failed.', [
                'user_id' => $request->user()?->id,
                'message' => $exception->getMessage(),
            ]);

            return redirect()->route('pricing')->with([
                'flash.message' => 'Your Stripe billing changes were saved, but the local account could not be refreshed automatically yet.',
                'flash.type' => 'error',
            ]);
        }

        return redirect()->route('pricing')->with('flash.message', 'Your billing changes were refreshed successfully.');
    }

    public function success(Request $request): RedirectResponse
    {
        $sessionId = $request->string('session_id')->toString();

        if ($sessionId === '') {
            return redirect()->route('pricing')->with([
                'flash.message' => 'Stripe returned without a checkout session reference. Open billing to confirm your subscription status.',
                'flash.type' => 'error',
            ]);
        }

        try {
            $this->checkoutSessionSyncService->sync($request->user(), $sessionId);
        } catch (\Throwable $exception) {
            report($exception);
            Log::error('Stripe checkout local sync failed.', [
                'user_id' => $request->user()?->id,
                'session_id' => $sessionId,
                'message' => $exception->getMessage(),
            ]);

            return redirect()->route('pricing')->with([
                'flash.message' => 'Payment was completed, but the local subscription could not be synced automatically. Open billing to verify the account status.',
                'flash.type' => 'error',
            ]);
        }

        return redirect()->route('pricing')->with('flash.message', 'Stripe checkout completed. Your PRO subscription is now active.');
    }

    public function sync(Request $request): RedirectResponse
    {
        try {
            $this->checkoutSessionSyncService->syncLatestForUser($request->user());
        } catch (\Throwable $exception) {
            report($exception);
            Log::error('Stripe manual billing sync failed.', [
                'user_id' => $request->user()?->id,
                'message' => $exception->getMessage(),
            ]);

            return redirect()->route('pricing')->with([
                'flash.message' => 'Stripe billing could not be synced into the local account yet.',
                'flash.type' => 'error',
            ]);
        }

        return redirect()->route('pricing')->with('flash.message', 'Stripe billing was synced successfully. Your PRO subscription is now active.');
    }

    public function cancel(): RedirectResponse
    {
        return redirect()->route('pricing')->with([
            'flash.message' => 'Stripe checkout was cancelled.',
            'flash.type' => 'error',
        ]);
    }

    public function cancelSubscription(Request $request): RedirectResponse
    {
        $subscription = $request->user()->subscription('default');

        if ($subscription === null || $subscription->ended()) {
            return redirect()->route('pricing')->with([
                'flash.message' => 'There is no active PRO subscription to cancel.',
                'flash.type' => 'error',
            ]);
        }

        if ($subscription->onGracePeriod()) {
            return redirect()->route('pricing')->with([
                'flash.message' => 'Your subscription is already scheduled to cancel at the end of the current billing period.',
                'flash.type' => 'error',
            ]);
        }

        try {
            $subscription->cancel();
            $subscription = $subscription->fresh();
        } catch (\Throwable $exception) {
            report($exception);
            Log::error('Stripe subscription cancellation failed.', [
                'user_id' => $request->user()?->id,
                'subscription_id' => $subscription->stripe_id,
                'message' => $exception->getMessage(),
            ]);

            return redirect()->route('pricing')->with([
                'flash.message' => 'The PRO subscription could not be cancelled right now. Please try again or use the billing portal.',
                'flash.type' => 'error',
            ]);
        }

        $accessEndsAt = $subscription?->ends_at?->format('M j, Y g:i A');

        return redirect()->route('pricing')->with([
            'flash.message' => $accessEndsAt === null
                ? 'Your PRO subscription is scheduled to cancel at the end of the current billing period. No automatic refund was issued.'
                : "Your PRO subscription is scheduled to cancel on {$accessEndsAt}. No automatic refund was issued.",
        ]);
    }
}
