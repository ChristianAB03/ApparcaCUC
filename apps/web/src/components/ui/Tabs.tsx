import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  value: string;
  label: ReactNode;
  count?: number;
}

export function Tabs({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: Tab[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={cn('inline-flex items-center gap-1 overflow-x-auto rounded-xl bg-ink/5 p-1', className)}>
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            'whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
            value === t.value ? 'bg-card text-ink shadow-sm' : 'text-ink-soft hover:text-ink',
          )}
        >
          {t.label}
          {t.count != null && <span className="ml-1.5 text-xs text-ink-muted">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
