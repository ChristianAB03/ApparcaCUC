import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { STATE_CONFIG } from '@/config/parking';
import type { ParkingState } from '@/types';

export function Badge({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StateBadge({ state, size = 'md' }: { state: ParkingState; size?: 'sm' | 'md' }) {
  const config = STATE_CONFIG[state];
  const { Icon } = config;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        config.badge,
        size === 'sm' ? 'px-2 py-0.5 text-[0.7rem]' : 'px-2.5 py-1 text-xs',
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden />
      {config.label}
    </span>
  );
}

export function Dot({ className }: { className?: string }) {
  return <span className={cn('inline-block h-2 w-2 rounded-full', className)} />;
}
