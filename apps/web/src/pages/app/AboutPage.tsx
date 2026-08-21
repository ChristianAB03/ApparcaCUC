import {
  Code2,
  Map,
  QrCode,
  Cpu,
  BarChart3,
  CalendarClock,
  ShieldAlert,
  CircleDot,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { LogoMark } from '@/components/brand/Logo';
import { DemoBadge } from '@/components/brand/DemoBadge';

const STACK = ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Node.js', 'Express', 'MongoDB', 'JWT'];

const FEATURES = [
  { icon: Map, text: 'Simulación de parqueo en tiempo real' },
  { icon: CalendarClock, text: 'Reservas con estados y ciclo de vida' },
  { icon: QrCode, text: 'Acceso por QR (validación simulada)' },
  { icon: Cpu, text: 'Simulación de sensores IoT' },
  { icon: BarChart3, text: 'Panel administrativo y analíticas' },
  { icon: ShieldAlert, text: 'Autenticación y roles (JWT)' },
];

const LIMITATIONS = [
  'La integración con sensores físicos IoT no está implementada: los estados se simulan.',
  'No hay conexión con sistemas institucionales ni control de acceso físico real.',
  'Los datos (usuarios, vehículos, reservas) son ficticios y de demostración.',
];

export default function AboutPage() {
  return (
    <div>
      <PageHeader title="Sobre el proyecto" description="Qué es ApparcaCUC y cómo está construido." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-start gap-4 border-b border-line p-6">
            <LogoMark className="h-14 w-14 shrink-0" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl font-bold text-ink">ApparcaCUC</h2>
                <DemoBadge />
              </div>
              <p className="mt-1 text-sm font-medium text-brand">Smart Parking Management System</p>
              <p className="mt-2 text-sm text-ink-soft">
                Proyecto académico evolucionado a una <span className="font-medium text-ink">demo funcional</span>{' '}
                que demuestra el concepto de estacionamiento inteligente para comunidades universitarias, de
                extremo a extremo: frontend, API REST, base de datos, autenticación y simulación de IoT.
              </p>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-2">
            <div>
              <h3 className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wide text-ink-muted">
                <Code2 className="h-4 w-4" /> Tecnologías
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {STACK.map((t) => (
                  <span key={t} className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-ink-soft">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wide text-ink-muted">
                <CircleDot className="h-4 w-4" /> Funciones
              </h3>
              <ul className="mt-3 space-y-2">
                {FEATURES.map((f) => (
                  <li key={f.text} className="flex items-center gap-2.5 text-sm text-ink-soft">
                    <f.icon className="h-4 w-4 text-brand" />
                    {f.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-display text-base font-semibold text-ink">Limitaciones actuales</h3>
            <ul className="mt-3 space-y-2.5">
              {LIMITATIONS.map((l) => (
                <li key={l} className="flex gap-2.5 text-sm text-ink-soft">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-muted" />
                  {l}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="border-gold/40 bg-gold/[0.06] p-6">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#846708]" />
              <div>
                <h3 className="font-display text-base font-semibold text-ink">Aviso</h3>
                <p className="mt-2 text-sm text-ink-soft">
                  Esta aplicación es una demostración funcional basada en un proyecto académico.{' '}
                  <span className="font-medium text-ink">
                    No representa un sistema oficial de la Universidad de la Costa ni se encuentra conectada a sus
                    sistemas institucionales.
                  </span>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-ink-muted">
        Desarrollado como proyecto de portafolio · Basado en el proyecto de aula ApparcaCUC.
      </p>
    </div>
  );
}
