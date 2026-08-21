import { useState, useEffect, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Plus, Car, Pencil, Trash2, Star, Bike, Zap } from 'lucide-react';
import {
  useVehicles,
  useCreateVehicle,
  useUpdateVehicle,
  useDeleteVehicle,
  type VehicleInput,
} from '@/hooks/useVehicles';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { Field, Input, Select } from '@/components/ui/form';
import { Skeleton, EmptyState } from '@/components/ui/feedback';
import { VEHICLE_TYPE_LABELS } from '@/config/parking';
import { errorMessage } from '@/lib/api';
import type { Vehicle, VehicleType } from '@/types';

const COLORS = ['Gris', 'Blanco', 'Negro', 'Rojo', 'Azul', 'Plata', 'Verde'];
const TYPE_ICON: Record<string, typeof Car> = { car: Car, suv: Car, motorcycle: Bike, ev: Zap, bicycle: Bike };
const EMPTY: VehicleInput = { plate: '', type: 'car', brand: '', model: '', color: 'Gris', isDefault: false };

function VehicleFormModal({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: Vehicle | null;
}) {
  const create = useCreateVehicle();
  const update = useUpdateVehicle();
  const [form, setForm] = useState<VehicleInput>(EMPTY);
  const busy = create.isPending || update.isPending;

  useEffect(() => {
    if (!open) return;
    setForm(
      editing
        ? {
            plate: editing.plate,
            type: editing.type,
            brand: editing.brand,
            model: editing.model,
            color: editing.color || 'Gris',
            isDefault: editing.isDefault,
          }
        : EMPTY,
    );
  }, [open, editing]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, ...form });
        toast.success('Vehículo actualizado');
      } else {
        await create.mutateAsync(form);
        toast.success('Vehículo agregado');
      }
      onClose();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Editar vehículo' : 'Agregar vehículo'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button form="vehicle-form" type="submit" loading={busy}>
            {editing ? 'Guardar' : 'Agregar'}
          </Button>
        </>
      }
    >
      <form id="vehicle-form" onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Placa">
            <Input
              value={form.plate}
              onChange={(e) => setForm((f) => ({ ...f, plate: e.target.value.toUpperCase() }))}
              placeholder="ABC123"
              maxLength={12}
              required
            />
          </Field>
          <Field label="Tipo">
            <Select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as VehicleType }))}
            >
              {Object.entries(VEHICLE_TYPE_LABELS).map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Marca">
            <Input
              value={form.brand}
              onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
              placeholder="Toyota"
            />
          </Field>
          <Field label="Modelo">
            <Input
              value={form.model}
              onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
              placeholder="Corolla"
            />
          </Field>
        </div>
        <Field label="Color">
          <Select value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}>
            {COLORS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <label className="flex items-center gap-2.5 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
            className="h-4 w-4 rounded border-line text-brand focus:ring-brand/40"
          />
          Marcar como vehículo principal
        </label>
      </form>
    </Modal>
  );
}

function VehicleCardItem({
  vehicle,
  onEdit,
  onDelete,
}: {
  vehicle: Vehicle;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const Icon = TYPE_ICON[vehicle.type] ?? Car;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <Icon className="h-5 w-5" />
        </span>
        <div className="flex items-center gap-1">
          {vehicle.isDefault && (
            <span className="mr-1 inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[0.68rem] font-medium text-[#846708]">
              <Star className="h-3 w-3 fill-current" /> Principal
            </span>
          )}
          <button
            onClick={onEdit}
            className="rounded-lg p-1.5 text-ink-muted hover:bg-ink/5 hover:text-ink"
            aria-label="Editar vehículo"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg p-1.5 text-ink-muted hover:bg-state-occupied/10 hover:text-state-occupied"
            aria-label="Eliminar vehículo"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="mt-3 font-display text-xl font-bold tracking-wide text-ink">{vehicle.plate}</p>
      <p className="text-sm text-ink-soft">
        {[vehicle.brand, vehicle.model].filter(Boolean).join(' ') || VEHICLE_TYPE_LABELS[vehicle.type]}
      </p>
      <p className="mt-1 text-xs text-ink-muted">
        {VEHICLE_TYPE_LABELS[vehicle.type]} · {vehicle.color || 'Sin color'}
      </p>
    </Card>
  );
}

export default function VehiclesPage() {
  const { data: vehicles, isLoading } = useVehicles();
  const remove = useDeleteVehicle();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState<Vehicle | null>(null);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (v: Vehicle) => {
    setEditing(v);
    setModalOpen(true);
  };

  const doDelete = async () => {
    if (!deleting) return;
    try {
      await remove.mutateAsync(deleting.id);
      toast.success('Vehículo eliminado');
      setDeleting(null);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Mis vehículos"
        description="Registra los vehículos que usarás para tus reservas."
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> Agregar vehículo
          </Button>
        }
      />

      {isLoading || !vehicles ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={<Car className="h-6 w-6" />}
            title="Aún no tienes vehículos"
            description="Agrega tu primer vehículo para asociarlo a tus reservas."
            action={
              <Button onClick={openAdd}>
                <Plus className="h-4 w-4" /> Agregar vehículo
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v) => (
            <VehicleCardItem key={v.id} vehicle={v} onEdit={() => openEdit(v)} onDelete={() => setDeleting(v)} />
          ))}
        </div>
      )}

      <VehicleFormModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} />
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={doDelete}
        loading={remove.isPending}
        title="Eliminar vehículo"
        description={deleting ? `¿Eliminar el vehículo ${deleting.plate}?` : ''}
        confirmLabel="Eliminar"
      />
    </div>
  );
}
