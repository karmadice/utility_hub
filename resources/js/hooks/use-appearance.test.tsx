import { act, renderHook } from '@testing-library/react';
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vite-plus/test';

import { initializeTheme, useAppearance } from './use-appearance';

describe('useAppearance', () => {
    let systemPrefersDark = false;
    let systemChangeListener: (() => void) | undefined;

    const setAppearanceCookie = (value: string) => {
        document.cookie = `appearance=${value};path=/`;
    };

    beforeEach(() => {
        localStorage.clear();

        document.cookie = 'appearance=; Max-Age=0; path=/';

        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = '';

        systemPrefersDark = false;
        systemChangeListener = undefined;

        vi.stubGlobal(
            'matchMedia',
            vi.fn().mockImplementation(() => ({
                get matches() {
                    return systemPrefersDark;
                },
                media: '(prefers-color-scheme: dark)',
                onchange: null,
                addEventListener: vi.fn(
                    (_event: string, callback: () => void) => {
                        systemChangeListener = callback;
                    },
                ),
                removeEventListener: vi.fn(),
                addListener: vi.fn(),
                removeListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        );

        initializeTheme();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('defaults to system appearance', () => {
        const { result } = renderHook(() => useAppearance());

        expect(result.current.appearance).toBe('system');
        expect(result.current.resolvedAppearance).toBe('light');
    });

    it('applies the light appearance', () => {
        const { result } = renderHook(() => useAppearance());

        act(() => {
            result.current.updateAppearance('light');
        });

        expect(result.current.appearance).toBe('light');
        expect(result.current.resolvedAppearance).toBe('light');
        expect(document.documentElement).not.toHaveClass('dark');
        expect(document.documentElement.style.colorScheme).toBe('light');
    });

    it('applies the dark appearance', () => {
        const { result } = renderHook(() => useAppearance());

        act(() => {
            result.current.updateAppearance('dark');
        });

        expect(result.current.appearance).toBe('dark');
        expect(result.current.resolvedAppearance).toBe('dark');
        expect(document.documentElement).toHaveClass('dark');
        expect(document.documentElement.style.colorScheme).toBe('dark');
    });

    it('persists the selected appearance in a cookie', () => {
        const { result } = renderHook(() => useAppearance());

        act(() => {
            result.current.updateAppearance('dark');
        });

        expect(document.cookie).toContain('appearance=dark');
        expect(localStorage.getItem('appearance')).toBeNull();
    });

    it('uses the appearance cookie during initialization', () => {
        setAppearanceCookie('dark');

        initializeTheme();

        const { result } = renderHook(() => useAppearance());

        expect(result.current.appearance).toBe('dark');
        expect(document.documentElement).toHaveClass('dark');
    });

    it('falls back to system for an invalid appearance cookie', () => {
        localStorage.setItem('appearance', 'dark');
        setAppearanceCookie('invalid');

        initializeTheme();

        const { result } = renderHook(() => useAppearance());

        expect(result.current.appearance).toBe('system');
    });

    it('falls back to system for an empty appearance cookie', () => {
        localStorage.setItem('appearance', 'dark');
        setAppearanceCookie('');

        initializeTheme();

        const { result } = renderHook(() => useAppearance());

        expect(result.current.appearance).toBe('system');
    });

    it('follows system preference changes', () => {
        const { result } = renderHook(() => useAppearance());

        expect(result.current.resolvedAppearance).toBe('light');

        systemPrefersDark = true;

        act(() => {
            systemChangeListener?.();
        });

        expect(result.current.appearance).toBe('system');
        expect(result.current.resolvedAppearance).toBe('dark');
        expect(document.documentElement).toHaveClass('dark');
    });

    it('does not override an explicitly selected appearance when system preference changes', () => {
        const { result } = renderHook(() => useAppearance());

        act(() => {
            result.current.updateAppearance('light');
        });

        systemPrefersDark = true;

        act(() => {
            systemChangeListener?.();
        });

        expect(result.current.appearance).toBe('light');
        expect(result.current.resolvedAppearance).toBe('light');
        expect(document.documentElement).not.toHaveClass('dark');
    });
});
