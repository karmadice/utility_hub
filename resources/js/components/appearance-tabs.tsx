import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const tabs: {
        value: Appearance;
        icon: LucideIcon;
        label: string;
    }[] = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ];

    return (
        <div
            role="group"
            aria-label="Appearance"
            className={cn(
                'inline-flex gap-1 rounded-lg bg-surface-subtle p-1',
                className,
            )}
            {...props}
        >
            {tabs.map(({ value, icon: Icon, label }) => {
                const selected = appearance === value;

                return (
                    <button
                        key={value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => updateAppearance(value)}
                        className={cn(
                            'inline-flex items-center rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors',
                            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
                            selected
                                ? 'bg-surface-elevated text-foreground shadow-xs'
                                : 'text-text-secondary hover:bg-accent hover:text-accent-foreground',
                        )}
                    >
                        <Icon aria-hidden="true" className="mr-1.5 h-4 w-4" />
                        {label}
                    </button>
                );
            })}
        </div>
    );
}
