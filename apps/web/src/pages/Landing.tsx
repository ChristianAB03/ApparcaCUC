import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Map,
  QrCode,
  Cpu,
  BarChart3,
  Bell,
  Car,
  CheckCircle2,
  Clock,
  ScanLine,
  LogIn,
  Github,
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { DemoBadge } from '@/components/brand/DemoBadge';
import { Button } from '@/components/ui/Button';

/* ── Decorative, original schematic (no photos) ── */
const PREVIEW = [
  'a', 'a', 'o', 'r', 'a', 'a', 'o', 'a',
  'o', 'a', 'a', 'a', 'r', 'o', 'a', 'd',
  'a', 'r', 'a', 'o', 'a', 'a', 'a', 'o',
];
const previewColor: Record<string, string> = {
  a: 'bg-state-available/25 border-state-available/40',
  o: 'bg-state-occupied/25 border-state-occupied/40',
  r: 'bg-gold/30 border-gold/50',
  d: 'bg-state-disabled/25 border-state-disabled/40',
};

function HeroPreview() {
  return (
    <div className="relative rounded-2xl border border-line bg-card p-5 shadow-elevated">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">Zona A · en vivo</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-state-available/12 px-2 py-0.5 text-xs font-medium text-state-available">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-state-available" /> Sensores simulados
        </span>
      </div>
      <div className="grid grid-cols-8 gap-1.5">
        {PREVIEW.map((s, i) => (
          <div
            key={i}
            className={`aspect-square rounded-md border ${previewColor[s]} ${i === 3 ? 'animate-pulse' : ''}`}
          />
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-xl bg-surface p-3">
        <div>
          <p className="text-xs text-ink-muted">Disponibles ahora</p>
          <p className="font-display text-xl font-bold text-ink">28 / 50</p>
        </div>
        <div className="h-9 w-px bg-line" />
        <div>
          <p className="text-xs text-ink-muted">Ocupación</p>
          <p className="font-display text-xl font-bold text-brand">44%</p>
        </div>
        <div className="h-9 w-px bg-line" />
        <div>
          <p className="text-xs text-ink-muted">Zonas</p>
          <p className="font-display text-xl font-bold text-ink">4</p>
        </div>
      </div>
    </div>
  );
}

function Section({ id, children, className }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 ${className ?? ''}`}>
      {children}
    </section>
  );
}

const STEPS = [
  { icon: Map, title: 'Consulta el mapa', text: 'Mira la disponibilidad en tiempo real por zona y espacio.' },
  { icon: Clock, title: 'Reserva tu espacio', text: 'Elige espacio, fecha, hora y duración en segundos.' },
  { icon: QrCode, title: 'Genera tu QR', text: 'Recibe un código de acceso único para tu reserva.' },
  { icon: ScanLine, title: 'Ingresa y sal', text: 'Valida el QR en el simulador de acceso al entrar y salir.' },
];

const FEATURES = [
  { icon: Map, title: 'Mapa interactivo', text: 'Estado de cada espacio con semáforo de color, iconos y detalle.' },
  { icon: QrCode, title: 'Reservas con QR', text: 'Reserva en tiempo real con código de reserva y pase de acceso.' },
  { icon: Cpu, title: 'Simulación IoT', text: 'Sensores simulados que cambian el estado desde el panel admin.' },
  { icon: Car, title: 'Gestión de vehículos', text: 'Registra tus vehículos y asócialos a tus reservas.' },
  { icon: Bell, title: 'Notificaciones', text: 'Avisos de confirmación, recordatorios y liberación de espacios.' },
  { icon: BarChart3, title: 'Analíticas', text: 'Ocupación por hora, reservas por día y espacios más usados.' },
];

const STATS = [
  { value: '50', label: 'Espacios monitoreados' },
  { value: '4', label: 'Zonas del campus' },
  { value: '< 1 min', label: 'Para reservar' },
  { value: '100%', label: 'Datos simulados' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-line/70 bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Logo />
            <DemoBadge className="hidden sm:inline-flex" />
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                Iniciar sesión
              </Button>
            </Link>
            <Link to="/login">
              <Button size="sm">
                Explorar la demo <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <Section className="grid items-center gap-12 py-14 lg:grid-cols-2 lg:py-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-xs font-medium text-ink-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Smart Parking para universidades
          </span>
          <h1 className="mt-5 text-balance font-display text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl">
            Encuentra, reserva y gestiona tu estacionamiento de forma inteligente.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-ink-soft">
            ApparcaCUC digitaliza el parqueadero universitario: disponibilidad en tiempo real, reservas con
            QR y monitoreo con sensores — todo en una plataforma moderna.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto">
                Explorar la demo <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#como-funciona">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Ver cómo funciona
              </Button>
            </a>
          </div>
          <p className="mt-5 text-sm text-ink-muted">
            Prueba con las cuentas demo de usuario y administrador — sin registro.
          </p>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-brand/5 blur-2xl" />
          <HeroPreview />
        </div>
      </Section>

      {/* Problem */}
      <Section className="py-8">
        <div className="rounded-2xl border border-line bg-card p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink">El problema</h2>
          <p className="mt-3 max-w-3xl text-ink-soft">
            En muchos campus, encontrar estacionamiento significa dar vueltas sin saber dónde hay espacio.
            Esto provoca <span className="font-medium text-ink">demoras en el ingreso</span>,{' '}
            <span className="font-medium text-ink">congestión vehicular</span> y falta de información sobre la
            disponibilidad real. ApparcaCUC ataca ese problema con datos en tiempo real y reservas anticipadas.
          </p>
        </div>
      </Section>

      {/* How it works */}
      <Section id="como-funciona" className="py-14">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink">Cómo funciona</h2>
          <p className="mt-3 text-ink-soft">Del mapa a tu espacio en cuatro pasos.</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="card p-5">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <s.icon className="h-5 w-5" />
                </span>
                <span className="font-display text-3xl font-bold text-line">{i + 1}</span>
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink">{s.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{s.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Features */}
      <Section className="py-14">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink">Todo lo que incluye</h2>
          <p className="mt-3 text-ink-soft">Una plataforma completa de gestión de estacionamiento.</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6 transition-all hover:border-brand/25 hover:shadow-elevated">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink">{f.title}</h3>
              <p className="mt-1.5 text-sm text-ink-soft">{f.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Stats */}
      <Section className="py-8">
        <div className="overflow-hidden rounded-2xl brand-gradient p-8 text-white sm:p-10">
          <div className="grid gap-8 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="font-display text-4xl font-bold">{s.value}</p>
                <p className="mt-1 text-sm text-white/80">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-white/60">
            Cifras ilustrativas de la demo — datos simulados, no son estadísticas oficiales de ninguna institución.
          </p>
        </div>
      </Section>

      {/* CTA */}
      <Section className="py-16">
        <div className="rounded-2xl border border-line bg-card p-8 text-center sm:p-12">
          <h2 className="text-balance font-display text-3xl font-bold tracking-tight text-ink">
            ¿Listo para explorar ApparcaCUC?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-ink-soft">
            Entra con una cuenta demo y recorre el flujo completo: reserva, QR, acceso y panel administrativo.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto">
                <LogIn className="h-4 w-4" /> Entrar a la demo
              </Button>
            </Link>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t border-line bg-card">
        <Section className="py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-md">
              <Logo />
              <p className="mt-3 text-sm text-ink-soft">
                Smart Parking Management System — proyecto académico evolucionado a una demo funcional de
                portafolio.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink-muted">
                {['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB'].map((t) => (
                  <span key={t} className="rounded-full bg-surface px-2.5 py-1 font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
              <p className="max-w-xs text-ink-soft">
                Demostración académica. No es un sistema oficial de la Universidad de la Costa ni está conectada
                a sus sistemas institucionales.
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-ink-muted sm:flex-row">
            <p>© {new Date().getFullYear()} ApparcaCUC · Demo de portafolio</p>
            <span className="inline-flex items-center gap-1.5">
              <Github className="h-3.5 w-3.5" /> Proyecto de portafolio
            </span>
          </div>
        </Section>
      </footer>
    </div>
  );
}
