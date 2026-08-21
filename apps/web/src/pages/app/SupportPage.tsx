import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { LifeBuoy, Send, Inbox } from 'lucide-react';
import { useMyTickets, useCreateTicket, type TicketInput } from '@/hooks/useSupport';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, SectionHeading } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/form';
import { Skeleton, EmptyState } from '@/components/ui/feedback';
import { TICKET_CATEGORY_LABELS, TICKET_STATE_CONFIG } from '@/config/parking';
import { fmtDateTime } from '@/lib/format';
import { errorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { TicketCategory } from '@/types';

const EMPTY: TicketInput = { category: 'reservation', subject: '', message: '', reference: '' };

export default function SupportPage() {
  const { data: tickets, isLoading } = useMyTickets();
  const create = useCreateTicket();
  const [form, setForm] = useState<TicketInput>(EMPTY);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await create.mutateAsync({ ...form, reference: form.reference || undefined });
      toast.success('Reporte enviado. Nuestro equipo lo revisará.');
      setForm(EMPTY);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Centro de ayuda"
        description="Reporta un problema o envía una sugerencia sobre ApparcaCUC."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <div className="border-b border-line p-5">
            <SectionHeading title="Nuevo reporte" icon={<LifeBuoy className="h-4 w-4" />} />
          </div>
          <form onSubmit={submit} className="space-y-4 p-5">
            <Field label="Categoría">
              <Select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as TicketCategory }))}
              >
                {Object.entries(TICKET_CATEGORY_LABELS).map(([v, label]) => (
                  <option key={v} value={v}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Asunto">
              <Input
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                placeholder="Describe brevemente el problema"
                maxLength={120}
                required
              />
            </Field>
            <Field label="Referencia (opcional)" hint="Código de reserva o espacio relacionado, si aplica.">
              <Input
                value={form.reference}
                onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
                placeholder="APC-2026-00021 o A-04"
                maxLength={40}
              />
            </Field>
            <Field label="Mensaje">
              <Textarea
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Cuéntanos qué ocurrió con el mayor detalle posible…"
                maxLength={1000}
                required
              />
            </Field>
            <Button type="submit" loading={create.isPending}>
              <Send className="h-4 w-4" /> Enviar reporte
            </Button>
          </form>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <div className="border-b border-line p-5">
              <SectionHeading title="Mis reportes" icon={<Inbox className="h-4 w-4" />} />
            </div>
            <div className="p-4">
              {isLoading || !tickets ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : tickets.length === 0 ? (
                <EmptyState
                  className="border-0"
                  icon={<Inbox className="h-6 w-6" />}
                  title="Sin reportes"
                  description="Cuando envíes un reporte aparecerá aquí."
                />
              ) : (
                <div className="space-y-3">
                  {tickets.map((t) => (
                    <div key={t.id} className="rounded-xl border border-line p-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-ink">{t.subject}</p>
                        <span
                          className={cn(
                            'shrink-0 rounded-full px-2 py-0.5 text-[0.68rem] font-medium',
                            TICKET_STATE_CONFIG[t.status].badge,
                          )}
                        >
                          {TICKET_STATE_CONFIG[t.status].label}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-ink-soft">{t.message}</p>
                      <div className="mt-2 flex items-center justify-between text-[0.68rem] text-ink-muted">
                        <span>{t.code}</span>
                        <span>{fmtDateTime(t.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
