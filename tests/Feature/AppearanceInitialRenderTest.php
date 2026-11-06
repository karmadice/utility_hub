<?php

dataset('appearance cookies', [
    'dark cookie' => ['dark', true, 'dark'],
    'light cookie' => ['light', false, 'light'],
    'system cookie' => ['system', false, 'system'],
    'missing cookie' => [null, false, 'system'],
    'invalid cookie' => ['invalid', false, 'system'],
    'empty cookie' => ['', false, 'system'],
]);

test('it renders the correct inital theme', function (
    ?string $cookie,
    bool $expectsDarkClass,
    string $expectedAppearance
) {
    if ($cookie !== null) {
        $this->withUnencryptedCookie('appearance', $cookie);
    }

    $response = $this->get('/');

    $response->assertOk();

    $html = $response->getContent();

    // 1. The server-rendered <html> tag only carries the "dark"
    // class when the validated prefernece is explicitly "dark".

    if ($expectsDarkClass) {
        expect($html)->toMatch('/<html[^>]*\bclass="dark"/');
    } else {
        expect($html)->not->toMatch('/<html[^>]*\bclass="dark"/');
    }

    // 2. The inline script receives the validated value, so the browser
    // resolves "system" against the OS before first paint.
    expect($html)->toContain('const appearance = "'.$expectedAppearance.'";');

})->with('appearance cookies');
