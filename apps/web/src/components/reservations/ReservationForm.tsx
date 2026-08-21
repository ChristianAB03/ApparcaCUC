import { useState, useEffect, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, Select, Input } from '@/components/ui/form';
import { StateBadge } from '@/components/ui/Badge';
import { useVehicles } from '@/hooks/useVehicles';
import { useCreateReservation } from '@/hooks/useReservations';
import { errorMessage } from '@/lib/api';
import { fmtDuration } from '@/lib/format';
import type { ParkingSpace, Reservation } from '@/types';

const DURATIONS = [60, 90, 120, 180, 240];

const todayStr = () => new Date().toISOString().slice(0, 10);
const soonTime = () => new Date(Date.now() + 10 * 60_000).toTimeString().slice(0, 5);

export function ReservationForm({
  space,
  open,
  onClose,
  onSuccess,
}: {
  space: ParkingSpace | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: (r: Reservation) => void;
}) {
  const { data: vehicles = [] } = useVehicles();
  const create = useCreateReservation();
  const [vehicleId, setVehicleId] = useState('');
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState(soonTime());
  const [duration, setDuration] = useState(120);

  useEffect(() => {
    if (!open) return;
    setDate(todayStr());
    setTime(soonTime());
    setDuration(120);
    const def = vehicles.find((v) => v.isDefault) ?? vehicles[0];
    setVehicleId(def?.id ?? '');
  }, [open, vehicles]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!space) return;
    const startAt = new Date(`${date}T${time}`);
    if (Number.isNaN(startAt.getTime())) {
      toast.error('La fecha u hora no es válida.');
      return;
    }
    try {
      const reservation = await create.mutateAsync({
        spaceId: space.id,
        vehicleId: vehicleId || undefined,
        startAt: startAt.toISOString(),
        durationMinutes: duration,
      });
      toast.success(`Reserva ${reservation.code} confirmada`);
      onSuccess?.(reservation);
      onClose();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva reserva"
      description={space ? `Espacio ${space.code} · Zona ${space.zone}` : undefined}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={create.isPending}>
            Cancelar
          </Button>
          <Button form="reservation-form" type="submit" loading={create.isPending}>
            Confirmar reserva
          </Button>
        </>
      }
    >
      <form id="reservation-form" onSubmit={submit} className="space-y-4">
        {space && (
          <div className="flex items-center justify-between rounded-xl bg-surface p-3">
            <span className="font-display text-lg font-bold text-ink">{space.code}</span>
            <StateBadge state={space.state} />
          </div>
        )}
        <Field
          label="Vehículo"
          hint={vehicles.length === 0 ? 'Puedes reservar sin vehículo y agregarlo luego en “Mis vehículos”.' : undefined}
        >
          <Select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
            <option value="">Sin vehículo</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.plate} — {v.brand} {v.model}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fecha">
            <Input type="date" value={date} min={todayStr()} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Hora de llegada">
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </Field>
        </div>
        <Field label="Duración">
          <Select value={String(duration)} onChange={(e) => setDuration(Number(e.target.value))}>
            {DURATIONS.map((d) => (
              <option key={d} value={d}>
                {fmtDuration(d)}
              </option>
            ))}
          </Select>
        </Field>
      </form>
    </Modal>
  );
}
