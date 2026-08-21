import { ShieldCheck, User as UserIcon } from 'lucide-react';
import { useAdminUsers } from '@/hooks/useAdmin';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/feedback';
import { DemoBadge } from '@/components/brand/DemoBadge';
import { fmtDate } from '@/lib/format';

export default function AdminUsersPage() {
  const { data: users, isLoading } = useAdminUsers();

  return (
    <div>
      <PageHeader
        title="Usuarios"
        description="Cuentas demo registradas en la plataforma."
        badge={<DemoBadge label="Datos ficticios" />}
      />

      <Card className="overflow-hidden">
        {isLoading || !users ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-4 py-3 font-medium">Usuario</th>
                  <th className="px-4 py-3 font-medium">Rol</th>
                  <th className="px-4 py-3 font-medium">Programa</th>
                  <th className="px-4 py-3 font-medium">Reservas</th>
                  <th className="px-4 py-3 font-medium">Vehículos</th>
                  <th className="px-4 py-3 font-medium">Registrado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-surface/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={u.name} color={u.avatarColor} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">{u.name}</p>
                          <p className="truncate text-xs text-ink-muted">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand">
                          <ShieldCheck className="h-3.5 w-3.5" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-ink-soft">
                          <UserIcon className="h-3.5 w-3.5" /> Usuario
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{u.program ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-soft">{u.reservations}</td>
                    <td className="px-4 py-3 text-ink-soft">{u.vehicles}</td>
                    <td className="px-4 py-3 text-ink-muted">{fmtDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
