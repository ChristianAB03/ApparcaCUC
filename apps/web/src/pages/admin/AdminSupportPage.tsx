import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { LifeBuoy } from 'lucide-react';
import { useAdminTickets, useUpdateTicket } from '@/hooks/useAdmin';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { Field, Select, Textarea } from '@/components/ui/form';
import { Skeleton, EmptyState } from '@/components/ui/feedback';
import { TICKET_CATEGORY_LABELS, TICKET_STATE_CONFIG } from '@/config/parking';
import { fmtDateTime } from '@/lib/format';
import { errorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { SupportTicket, TicketState } from '@/types';

const TABS = [
  { value: '', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'in_review', label: 'En revisión' },
  { value: 'resolved', label: 'Resueltos' },
];

function TicketModal({ ticket, onClose }: { ticket: SupportTicket | null; onClose: () => void }) {
  const update = useUpdateTicket();
  const [status, setStatus] = useState<TicketState>('pending');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (ticket) {
      setStatus(ticket.status);
      setNote(ticket.adminNote ?? '');
    }
  }, [ticket]);

  const save = async () => {
    if (!ticket) return;
    try {
      await update.mutateAsync({ id: ticket.id, status, adminNote: note || undefined });
      toast.success('Ticket actualizado');
      onClose();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <Modal
      open={Boolean(ticket)}
      onClose={onClose}
      title={ticket ? ticket.subject : ''}
      description={ticket ? `${ticket.code} · ${ticket.userName}` : undefined}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={update.isPending}>
            Cerrar
          </Button>
          <Button onClick={save} loading={update.isPending}>
            Guardar cambios
          </Button>
        </>
      }
    >
      {ticket && (
        <div className="space-y-4">
          <div className="rounded-xl bg-surface p-3 text-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
              {TICKET_CATEGORY_LABELS[ticket.category]}
            </p>
            <p className="mt-1.5 text-ink-soft">{ticket.message}</p>
            {ticket.reference && <p className="mt-2 text-xs text-ink-muted">Referencia: {ticket.reference}</p>}
          </div>
          <Field label="Estado">
            <Select value={status} onChange={(e) => setStatus(e.target.value as TicketState)}>
              <option value="pending">Pendiente</option>
              <option value="in_review">En revisión</option>
              <option value="resolved">Resuelto</option>
            </Select>
          </Field>
          <Field label="Nota interna (opcional)">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notas para el equipo…" maxLength={500} />
          </Field>
        </div>
      )}
    </Modal>
  );
}

export default function AdminSupportPage() {
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const { data, isLoading } = useAdminTickets({ status: status || undefined, limit: 50 });

  return (
    <div>
      <PageHeader title="Soporte" description="Reportes enviados por los usuarios de la plataforma." />

      <div className="mb-4">
        <Tabs tabs={TABS} value={status} onChange={setStatus} />
      </div>

      <Card className="overflow-hidden">
        {isLoading || !data ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : data.tickets.length === 0 ? (
          <EmptyState className="m-4 border-0" icon={<LifeBuoy className="h-6 w-6" />} title="Sin reportes" description="No hay reportes para este filtro." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-4 py-3 font-medium">Ticket</th>
                  <th className="px-4 py-3 font-medium">Usuario</th>
                  <th className="px-4 py-3 font-medium">Categoría</th>
                  <th className="px-4 py-3 font-medium">Asunto</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.tickets.map((t) => (
                  <tr key={t.id} onClick={() => setSelected(t)} className="cursor-pointer hover:bg-surface/60">
                    <td className="px-4 py-3 font-medium text-ink">{t.code}</td>
                    <td className="px-4 py-3 text-ink-soft">{t.userName}</td>
                    <td className="px-4 py-3 text-ink-soft">{TICKET_CATEGORY_LABELS[t.category]}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-ink-soft">{t.subject}</td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', TICKET_STATE_CONFIG[t.status].badge)}>
                        {TICKET_STATE_CONFIG[t.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{fmtDateTime(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <TicketModal ticket={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
