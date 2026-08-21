import { useRef, useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, ShieldCheck, LayoutDashboard, Info, LogOut, type LucideIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useClickAway } from '@/hooks/useClickAway';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

function MenuLink({
  icon: Icon,
  onClick,
  children,
  danger,
}: {
  icon: LucideIcon;
  onClick: () => void;
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        danger ? 'text-state-occupied hover:bg-state-occupied/10' : 'text-ink-soft hover:bg-ink/5 hover:text-ink',
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

export function UserMenu() {
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickAway(ref, () => setOpen(false));
  const navigate = useNavigate();
  const location = useLocation();
  const inAdmin = location.pathname.startsWith('/admin');

  if (!user) return null;
  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl p-1 pr-2 transition-colors hover:bg-ink/5"
      >
        <Avatar name={user.name} color={user.avatarColor} size="sm" />
        <span className="hidden max-w-[8rem] truncate text-sm font-medium text-ink sm:block">
          {user.name.split(' ')[0]}
        </span>
        <ChevronDown className="hidden h-4 w-4 text-ink-muted sm:block" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 animate-scale-in overflow-hidden rounded-2xl border border-line bg-card shadow-elevated">
          <div className="flex items-center gap-3 border-b border-line p-4">
            <Avatar name={user.name} color={user.avatarColor} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
              <p className="truncate text-xs text-ink-muted">{user.email}</p>
            </div>
          </div>
          <div className="p-1.5">
            {isAdmin &&
              (inAdmin ? (
                <MenuLink icon={LayoutDashboard} onClick={() => go('/app')}>
                  Ir al panel de usuario
                </MenuLink>
              ) : (
                <MenuLink icon={ShieldCheck} onClick={() => go('/admin')}>
                  Ir al panel admin
                </MenuLink>
              ))}
            <MenuLink icon={Info} onClick={() => go('/app/acerca')}>
              Sobre el proyecto
            </MenuLink>
            <MenuLink
              icon={LogOut}
              danger
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              Cerrar sesión
            </MenuLink>
          </div>
        </div>
      )}
    </div>
  );
}
