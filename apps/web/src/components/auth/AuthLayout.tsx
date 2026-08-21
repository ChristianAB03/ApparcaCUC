import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Map, QrCode, Cpu, BarChart3 } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { DemoBadge } from '@/components/brand/DemoBadge';

const FEATURES = [
  { icon: Map, text: 'Disponibilidad en tiempo real y mapa interactivo' },
  { icon: QrCode, text: 'Reservas con código QR y acceso simulado' },
  { icon: Cpu, text: 'Simulación de sensores IoT desde el panel' },
  { icon: BarChart3, text: 'Analíticas de ocupación y uso' },
];

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden brand-gradient p-10 text-white lg:flex lg:flex-col">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        />
        <div className="relative">
          <Link to="/" aria-label="Inicio">
            <Logo variant="light" />
          </Link>
        </div>
        <div className="relative my-auto max-w-md">
          <DemoBadge variant="light" className="mb-6" />
          <h1 className="text-balance font-display text-[2.6rem] font-bold leading-[1.08]">
            Encuentra, reserva y gestiona tu estacionamiento de forma inteligente.
          </h1>
          <p className="mt-4 text-white/80">
            ApparcaCUC es una plataforma de Smart Parking para comunidades universitarias.
          </p>
          <ul className="mt-8 space-y-3.5">
            {FEATURES.map((f) => (
              <li key={f.text} className="flex items-center gap-3 text-white/90">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <f.icon className="h-4 w-4" />
                </span>
                <span className="text-sm">{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs leading-relaxed text-white/60">
          Demostración académica — no es un sistema oficial de la Universidad de la Costa ni está
          conectada a sus sistemas institucionales.
        </p>
      </div>

      <div className="flex flex-col justify-center px-5 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link to="/" aria-label="Inicio">
              <Logo />
            </Link>
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink">{title}</h2>
          {subtitle && <p className="mt-1.5 text-sm text-ink-soft">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
