import { FlaskConical } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DemoBadge({
  className,
  variant = 'default',
  label = 'Demo',
}: {
  className?: string;
  variant?: 'default' | 'light';
  label?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide',
        variant === 'light'
          ? 'border-white/25 bg-white/10 text-white'
          : 'border-gold/40 bg-gold/10 text-[#846708]',
        className,
      )}
      title="Demostración académica — proyecto de portafolio. No es un sistema oficial de la Universidad de la Costa."
    >
      <FlaskConical className="h-3 w-3" aria-hidden />
      {label}
    </span>
  );
}
