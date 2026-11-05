import { useEffect, useState } from 'react';

export type ResolvedAppearance = 'light' | 'dark';
export type Appearance = ResolvedAppearance | 'system';

export type UseAppearanceReturn = {
    readonly appearance: Appearance;
    readonly resolvedAppearance: ResolvedAppearance;
    readonly updateAppearance: (mode: Appearance) => void;
};

type AppearanceSnapshot = {
    appearance: Appearance;
    resolvedAppearance: ResolvedAppearance;
};

const listeners = new Set<() => void>();

let currentAppearance: Appearance = 'system';
let systemMediaQuery: MediaQueryList | null = null;

const prefersDark = (): boolean => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;

    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') {
        return null;
    }

    const cookie = document.cookie
        .split(';')
        .map((item) => item.trim())
        .find((item) => item.startsWith(`${name}=`));

    if (!cookie) {
        return null;
    }

    try {
        return decodeURIComponent(cookie.substring(name.length + 1));
    } catch {
        return null;
    }
};

const getStoredAppearance = (): Appearance => {
    const stored = getCookie('appearance');

    if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
    }

    return 'system';
};

const resolveAppearance = (appearance: Appearance): ResolvedAppearance => {
    if (appearance === 'system') {
        return prefersDark() ? 'dark' : 'light';
    }

    return appearance;
};

const getSnapshot = (): AppearanceSnapshot => ({
    appearance: currentAppearance,
    resolvedAppearance: resolveAppearance(currentAppearance),
});

const applyTheme = (appearance: Appearance): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const isDark = resolveAppearance(appearance) === 'dark';

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
};

const notify = (): void => {
    listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
};

const handleSystemThemeChange = (): void => {
    applyTheme(currentAppearance);
    notify();
};

export function initializeTheme(): void {
    if (typeof window === 'undefined') {
        return;
    }

    currentAppearance = getStoredAppearance();

    applyTheme(currentAppearance);

    systemMediaQuery?.removeEventListener('change', handleSystemThemeChange);

    systemMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    systemMediaQuery.addEventListener('change', handleSystemThemeChange);

    notify();
}

export function useAppearance(): UseAppearanceReturn {
    const [snapshot, setSnapshot] = useState<AppearanceSnapshot>(getSnapshot);

    useEffect(() => {
        const syncAppearance = (): void => {
            setSnapshot(getSnapshot());
        };

        const unsubscribe = subscribe(syncAppearance);

        syncAppearance();

        return unsubscribe;
    }, []);

    const updateAppearance = (mode: Appearance): void => {
        currentAppearance = mode;

        setCookie('appearance', mode);

        applyTheme(mode);
        notify();
    };

    return {
        appearance: snapshot.appearance,
        resolvedAppearance: snapshot.resolvedAppearance,
        updateAppearance,
    };
}
