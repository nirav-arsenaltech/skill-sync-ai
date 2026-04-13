<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('prevents non admins from accessing the admin users resource', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('admin.users.index'))
        ->assertForbidden();
});

it('allows admins to view the admin users index', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('admin.users.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Admin/Users/Index'));
});

it('allows admins to create update and delete users', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();

    $this->actingAs($admin)
        ->post(route('admin.users.store'), [
            'name' => 'Managed User',
            'email' => 'managed@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'is_admin' => true,
        ])
        ->assertRedirect(route('admin.users.index'));

    $managedUser = User::query()->where('email', 'managed@example.com')->firstOrFail();

    expect($managedUser->is_admin)->toBeTrue();

    $this->actingAs($admin)
        ->put(route('admin.users.update', $user), [
            'name' => 'Updated User',
            'email' => $user->email,
            'password' => '',
            'password_confirmation' => '',
            'is_admin' => true,
        ])
        ->assertRedirect(route('admin.users.index'));

    expect($user->fresh()->name)->toBe('Updated User')
        ->and($user->fresh()->is_admin)->toBeTrue();

    $this->actingAs($admin)
        ->delete(route('admin.users.destroy', $user))
        ->assertRedirect(route('admin.users.index'));

    expect(User::find($user->id))->toBeNull();
});

it('does not allow an admin to delete their own account', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->delete(route('admin.users.destroy', $admin))
        ->assertRedirect(route('admin.users.index'))
        ->assertSessionHas('flash.message', 'You cannot delete your own administrator account.');

    expect(User::find($admin->id))->not->toBeNull();
});
