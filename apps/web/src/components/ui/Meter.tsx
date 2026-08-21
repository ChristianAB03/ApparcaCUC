import { cn } from '@/lib/utils';

function toneFor(pct: number): string {
  if (pct < 0.6) return 'rgb(var(--forest))';
  if (pct < 0.85) return 'rgb(var(--gold))';
  return 'rgb(var(--brand))';
}

export function OccupancyRing({
  value,
  size = 128,
  label,
  thickness = 11,
}: {
  value: number;
  size?: number;
  label?: string;
  thickness?: number;
}) {
  const pct = Math.min(1, Math.max(0, value));
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--line))" strokeWidth={thickness} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={toneFor(pct)}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-2xl font-bold text-ink">{Math.round(pct * 100)}%</div>
        {label && <div className="text-[0.7rem] font-medium uppercase tracking-wide text-ink-muted">{label}</div>}
      </div>
    </div>
  );
}

export function ProgressBar({
  value,
  className,
  barClassName,
}: {
  value: number;
  className?: string;
  barClassName?: string;
}) {
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-line', className)}>
      <div
        className={cn('h-full rounded-full bg-brand transition-all duration-500', barClassName)}
        style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
      />
    </div>
  );
}
