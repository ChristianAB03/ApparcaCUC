import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'brand' | 'green' | 'gold' | 'gray' | 'red';

const tones: Record<Tone, string> = {
  brand: 'bg-brand/10 text-brand',
  green: 'bg-state-available/12 text-state-available',
  gold: 'bg-gold/15 text-[#846708]',
  gray: 'bg-state-disabled/12 text-state-disabled',
  red: 'bg-state-occupied/12 text-state-occupied',
};

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
  hint?: ReactNode;
  className?: string;
}

export function StatCard({ label, value, icon, tone = 'brand', hint, className }: StatCardProps) {
  return (
    <div className={cn('card p-5', className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink-soft">{label}</p>
        {icon && (
          <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', tones[tone])}>{icon}</span>
        )}
      </div>
      <p className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}
