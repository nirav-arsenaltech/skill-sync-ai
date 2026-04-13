<?php

namespace App\Http\Middleware;

use App\Services\Billing\PlanManager;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $planManager = app(PlanManager::class);

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'is_admin' => $request->user()->is_admin,
                    'plan_key' => $planManager->planKey($request->user()),
                    'plan_label' => $planManager->planLabel($request->user()),
                ] : null,
            ],
            'flash' => [
                'message' => fn () => $request->session()->get('flash.message') ?? $request->old('flash.message'),
                'type' => fn () => $request->session()->get('flash.type') ?? $request->old('flash.type'),
            ],
        ]);
    }
}
