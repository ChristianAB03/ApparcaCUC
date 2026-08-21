import { useState, useEffect, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Cpu } from 'lucide-react';
import { useAdminSpaces, useCreateSpace, useUpdateSpace } from '@/hooks/useAdmin';
import { useSetSpaceState } from '@/hooks/useParking';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Select } from '@/components/ui/form';
import { StateBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/feedback';
import { SPACE_TYPE_CONFIG } from '@/config/parking';
import { DemoBadge } from '@/components/brand/DemoBadge';
import { errorMessage } from '@/lib/api';
import type { ParkingSpace, ParkingState, SpaceType } from '@/types';

const ZONE_TABS = [
  { value: '', label: 'Todas' },
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
];
const STATES: ParkingState[] = ['available', 'reserved', 'occupied', 'disabled'];
const STATE_LABELS: Record<ParkingState, string> = {
  available: 'Disponible',
  reserved: 'Reservado',
  occupied: 'Ocupado',
  disabled: 'Fuera de servicio',
};

function CreateSpaceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateSpace();
  const [form, setForm] = useState({ zone: 'A', position: 1, type: 'standard' as SpaceType, level: 1, state: 'available' as ParkingState });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await create.mutateAsync(form);
      toast.success('Espacio creado');
      onClose();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Crear espacio"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={create.isPending}>
            Cancelar
          </Button>
          <Button form="create-space" type="submit" loading={create.isPending}>
            Crear
          </Button>
        </>
      }
    >
      <form id="create-space" onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Zona">
            <Select value={form.zone} onChange={(e) => setForm((f) => ({ ...f, zone: e.target.value }))}>
              {['A', 'B', 'C', 'D'].map((z) => (
                <option key={z} value={z}>
                  Zona {z}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Posición">
            <Input
              type="number"
              min={1}
              max={99}
              value={form.position}
              onChange={(e) => setForm((f) => ({ ...f, position: Number(e.target.value) }))}
              required
            />
          </Field>
        </div>
        <Field label="Tipo">
          <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as SpaceType }))}>
            {Object.entries(SPACE_TYPE_CONFIG).map(([v, cfg]) => (
              <option key={v} value={v}>
                {cfg.label}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nivel">
            <Input
              type="number"
              min={1}
              max={5}
              value={form.level}
              onChange={(e) => setForm((f) => ({ ...f, level: Number(e.target.value) }))}
            />
          </Field>
          <Field label="Estado inicial">
            <Select value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value as ParkingState }))}>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {STATE_LABELS[s]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </form>
    </Modal>
  );
}

function EditSpaceModal({ space, onClose }: { space: ParkingSpace | null; onClose: () => void }) {
  const update = useUpdateSpace();
  const [form, setForm] = useState({ type: 'standard' as SpaceType, level: 1, note: '' });

  useEffect(() => {
    if (space) setForm({ type: space.type, level: space.level, note: space.note ?? '' });
  }, [space]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!space) return;
    try {
      await update.mutateAsync({ id: space.id, ...form, note: form.note || undefined });
      toast.success('Espacio actualizado');
      onClose();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <Modal
      open={Boolean(space)}
      onClose={onClose}
      title={space ? `Editar ${space.code}` : ''}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={update.isPending}>
            Cancelar
          </Button>
          <Button form="edit-space" type="submit" loading={update.isPending}>
            Guardar
          </Button>
        </>
      }
    >
      <form id="edit-space" onSubmit={submit} className="space-y-4">
        <Field label="Tipo">
          <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as SpaceType }))}>
            {Object.entries(SPACE_TYPE_CONFIG).map(([v, cfg]) => (
              <option key={v} value={v}>
                {cfg.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Nivel">
          <Input
            type="number"
            min={1}
            max={5}
            value={form.level}
            onChange={(e) => setForm((f) => ({ ...f, level: Number(e.target.value) }))}
          />
        </Field>
        <Field label="Nota">
          <Input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="Opcional" maxLength={160} />
        </Field>
      </form>
    </Modal>
  );
}

export default function AdminSpacesPage() {
  const { data: spaces, isLoading } = useAdminSpaces();
  const setState = useSetSpaceState();
  const [zone, setZone] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ParkingSpace | null>(null);

  const filtered = spaces?.filter((s) => !zone || s.zone === zone) ?? [];

  const changeState = async (space: ParkingSpace, state: ParkingState) => {
    try {
      await setState.mutateAsync({ id: space.id, state, source: 'admin' });
      toast.success(`${space.code} → ${STATE_LABELS[state]}`);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Gestión de espacios"
        description="Crea, edita y cambia el estado de los espacios del estacionamiento."
        badge={<DemoBadge />}
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> Crear espacio
          </Button>
        }
      />

      <div className="mb-4">
        <Tabs tabs={ZONE_TABS} value={zone} onChange={setZone} />
      </div>

      <Card className="overflow-hidden">
        {isLoading || !spaces ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-4 py-3 font-medium">Espacio</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Nivel</th>
                  <th className="px-4 py-3 font-medium">Estado actual</th>
                  <th className="px-4 py-3 font-medium">Cambiar estado</th>
                  <th className="px-4 py-3 font-medium">Sensor</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-surface/60">
                    <td className="px-4 py-3 font-display font-bold text-ink">{s.code}</td>
                    <td className="px-4 py-3 text-ink-soft">{SPACE_TYPE_CONFIG[s.type].label}</td>
                    <td className="px-4 py-3 text-ink-soft">{s.level}</td>
                    <td className="px-4 py-3">
                      <StateBadge state={s.state} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={s.state}
                        onChange={(e) => changeState(s, e.target.value as ParkingState)}
                        className="h-9 w-40"
                      >
                        {STATES.map((st) => (
                          <option key={st} value={st}>
                            {STATE_LABELS[st]}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
                        <Cpu className="h-3.5 w-3.5" /> {s.sensorId}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setEditing(s)}
                        className="rounded-lg p-1.5 text-ink-muted hover:bg-ink/5 hover:text-ink"
                        aria-label="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <CreateSpaceModal open={creating} onClose={() => setCreating(false)} />
      <EditSpaceModal space={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
