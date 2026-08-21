import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ScanLine, CheckCircle2, XCircle, LogOut, ArrowRight, Ticket } from 'lucide-react';
import { useAccessScan } from '@/hooks/useReservations';
import { useActiveReservation } from '@/hooks/useReservations';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form';
import { DemoBadge } from '@/components/brand/DemoBadge';
import { errorMessage } from '@/lib/api';

interface ScanResult {
  ok: boolean;
  action?: 'checkin' | 'checkout';
  spaceCode?: string;
  title: string;
  detail: string;
}

const FLOW = ['Reserva', 'QR', 'Validación', 'Ocupado', 'Salida', 'Disponible'];

export default function AccessSimulatorPage() {
  const { data: active } = useActiveReservation();
  const scan = useAccessScan();
  const [code, setCode] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const value = code.trim();
    if (!value) return;
    try {
      const res = await scan.mutateAsync(value);
      setResult({
        ok: true,
        action: res.action,
        spaceCode: res.spaceCode,
        title: res.action === 'checkin' ? 'Acceso autorizado' : 'Salida registrada',
        detail:
          res.action === 'checkin'
            ? `El espacio ${res.spaceCode} pasó a ocupado. ¡Bienvenido!`
            : `El espacio ${res.spaceCode} quedó disponible. ¡Hasta pronto!`,
      });
      setCode('');
    } catch (err) {
      setResult({ ok: false, title: 'Reserva no válida', detail: errorMessage(err) });
    }
  };

  return (
    <div>
      <PageHeader
        title="Simulador de acceso"
        description="Valida un código de reserva como lo haría una barrera física."
        badge={<DemoBadge />}
      />

      {/* Flow steps */}
      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-card p-4">
        {FLOW.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-ink-soft">{step}</span>
            {i < FLOW.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-ink-muted" />}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Terminal */}
        <Card className="overflow-hidden lg:col-span-3">
          <div className="brand-gradient flex items-center justify-between px-5 py-3 text-white">
            <span className="inline-flex items-center gap-2 font-display text-sm font-semibold">
              <ScanLine className="h-4 w-4" /> Terminal de acceso
            </span>
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">Barrera simulada</span>
          </div>

          <div className="relative flex flex-col items-center gap-2 border-b border-line bg-ink/[0.03] py-10">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-dashed border-brand/30 bg-card">
              <ScanLine className="h-10 w-10 text-brand/70" />
              <motion.div
                className="absolute inset-x-3 h-0.5 rounded-full bg-brand/60"
                initial={{ top: '18%' }}
                animate={{ top: ['18%', '82%', '18%'] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
            <p className="text-sm text-ink-muted">Escanea o ingresa tu código</p>
          </div>

          <form onSubmit={submit} className="space-y-3 p-5">
            <Input
              placeholder="Código de acceso (ej. 7F3K9Q) o reserva (APC-…)"
              leftIcon={<Ticket className="h-4 w-4" />}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="text-center font-display text-lg tracking-widest"
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" className="flex-1" loading={scan.isPending}>
                Validar acceso
              </Button>
              {active && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCode(active.accessCode)}
                  className="flex-1"
                >
                  Usar mi código ({active.accessCode})
                </Button>
              )}
            </div>
          </form>

          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key={result.title + result.detail}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`m-5 mt-0 flex items-start gap-3 rounded-xl border p-4 ${
                  result.ok
                    ? result.action === 'checkin'
                      ? 'border-forest/30 bg-forest/8'
                      : 'border-brand/25 bg-brand/8'
                    : 'border-state-occupied/30 bg-state-occupied/8'
                }`}
              >
                {result.ok ? (
                  result.action === 'checkin' ? (
                    <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-forest" />
                  ) : (
                    <LogOut className="mt-0.5 h-6 w-6 shrink-0 text-brand" />
                  )
                ) : (
                  <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-state-occupied" />
                )}
                <div>
                  <p className="font-display text-lg font-semibold text-ink">{result.title}</p>
                  <p className="text-sm text-ink-soft">{result.detail}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Explanation */}
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-display text-base font-semibold text-ink">¿Cómo funciona?</h3>
          <p className="mt-2 text-sm text-ink-soft">
            Al validar un código, el sistema identifica la reserva y actualiza el estado del espacio, tal como lo
            haría una barrera con lector QR:
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest/12 text-xs font-bold text-forest">
                1
              </span>
              <span className="text-ink-soft">
                Primera validación → <span className="font-medium text-ink">ingreso</span>: el espacio pasa a
                ocupado.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/12 text-xs font-bold text-brand">
                2
              </span>
              <span className="text-ink-soft">
                Segunda validación → <span className="font-medium text-ink">salida</span>: el espacio vuelve a
                disponible.
              </span>
            </li>
          </ul>
          <p className="mt-4 rounded-lg bg-surface px-3 py-2 text-xs text-ink-muted">
            No existe una barrera física real: la validación es una demostración del flujo de acceso.
          </p>
        </Card>
      </div>
    </div>
  );
}
