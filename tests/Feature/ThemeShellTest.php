<?php

use App\Models\User;

it('boots the theme script on the welcome page', function () {
    $response = $this->get(route('home'));

    $response
        ->assertOk()
        ->assertSee('skillsync-theme', false);
});

it('boots the theme script for authenticated pages', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('dashboard'));

    $response
        ->assertOk()
        ->assertSee('skillsync-theme', false);
});
