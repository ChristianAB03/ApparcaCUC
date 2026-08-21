import { cn } from '@/lib/utils';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="ApparcaCUC">
      <defs>
        <linearGradient id="apc-mark-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#A3161A" />
          <stop offset="1" stopColor="#671B24" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill="url(#apc-mark-grad)" />
      <rect x="15" y="13" width="6" height="22" rx="3" fill="#fff" />
      <path d="M18 15 A8 8 0 0 1 18 29" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" />
      <circle cx="34.5" cy="33.5" r="3" fill="#FCD116" />
    </svg>
  );
}

export function Logo({
  className,
  markClassName,
  showText = true,
  variant = 'default',
}: {
  className?: string;
  markClassName?: string;
  showText?: boolean;
  variant?: 'default' | 'light';
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark className={cn('h-9 w-9', markClassName)} />
      {showText && (
        <span className="font-display text-lg font-extrabold leading-none tracking-tight">
          <span className={variant === 'light' ? 'text-white' : 'text-ink'}>Apparca</span>
          <span className={variant === 'light' ? 'text-white/75' : 'text-brand'}>CUC</span>
        </span>
      )}
    </span>
  );
}
