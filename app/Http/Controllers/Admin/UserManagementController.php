<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAdminUserRequest;
use App\Http\Requests\UpdateAdminUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::query()
            ->when(
                $request->string('search')->toString(),
                fn ($query, string $search) => $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
            )
            ->with(['subscriptions' => fn ($query) => $query->latest()])
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(function (User $user): array {
                $subscription = $user->subscriptions->first();

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_admin' => $user->is_admin,
                    'created_at' => $user->created_at?->toDateTimeString(),
                    'stripe_id' => $user->stripe_id,
                    'pm_type' => $user->pm_type,
                    'pm_last_four' => $user->pm_last_four,
                    'subscription' => $subscription ? [
                        'stripe_price' => $subscription->stripe_price,
                        'stripe_status' => $subscription->stripe_status,
                        'ends_at' => $subscription->ends_at?->toDateTimeString(),
                    ] : null,
                ];
            });

        return Inertia::render('Admin/Users/Index', [
            'filters' => $request->only('search'),
            'users' => $users,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Users/Create');
    }

    public function store(StoreAdminUserRequest $request): RedirectResponse
    {
        User::create($request->validated());

        return redirect()
            ->route('admin.users.index')
            ->with('flash.message', 'User created successfully.');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('Admin/Users/Edit', [
            'userRecord' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_admin' => $user->is_admin,
                'stripe_id' => $user->stripe_id,
                'pm_type' => $user->pm_type,
                'pm_last_four' => $user->pm_last_four,
            ],
        ]);
    }

    public function update(UpdateAdminUserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();

        if (! filled($validated['password'] ?? null)) {
            unset($validated['password']);
        }

        $user->update($validated);

        return redirect()
            ->route('admin.users.index')
            ->with('flash.message', 'User updated successfully.');
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->is($requestUser = request()->user())) {
            return redirect()
                ->route('admin.users.index')
                ->with([
                    'flash.message' => 'You cannot delete your own administrator account.',
                    'flash.type' => 'error',
                ]);
        }

        $user->delete();

        return redirect()
            ->route('admin.users.index')
            ->with('flash.message', 'User deleted successfully.');
    }
}
