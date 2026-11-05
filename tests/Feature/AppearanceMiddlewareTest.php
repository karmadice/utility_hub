<?php

use Illuminate\Support\Facades\View;

test('it defaults to system appearance when cookie is missing', function () {
    $this->get('/')->assertOk();

    expect(View::shared('appearance'))->toBe('system');
});

test('it accepts light appearance from cookie', function () {
    $this->withUnencryptedCookie('appearance', 'light')->get('/')->assertOk();

    expect(View::shared('appearance'))
        ->toBe('light');
});

test('it accepts dark appearance from cookie', function () {
    $this->withUnencryptedCookie('appearance', 'dark')->get('/')->assertOk();

    expect(View::shared('appearance'))
        ->toBe('dark');
});

test('it accepts system appearance from cookie', function () {
    $this->withUnencryptedCookie('appearance', 'system')->get('/')->assertOk();

    expect(View::shared('appearance'))
        ->toBe('system');
});

test('it defaults to system appearance for an invalid cookie', function () {
    $this->withUnencryptedCookie('appearance', 'invalid')->get('/')->assertOk();

    expect(View::shared('appearance'))
        ->toBe('system');
});

test('it defaults to system appearance for an empty cookie', function () {
    $this->withUnencryptedCookie('appearance', '')->get('/')->assertOk();

    expect(View::shared('appearance'))
        ->toBe('system');
});
