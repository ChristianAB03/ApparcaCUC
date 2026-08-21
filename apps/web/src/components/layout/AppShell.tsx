import { useState, type ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/brand/Logo';
import { DemoBadge } from '@/components/brand/DemoBadge';
import { Avatar } from '@/components/ui/Avatar';
import { NotificationsBell } from './NotificationsBell';
import { UserMenu } from './UserMenu';
import { USER_NAV, ADMIN_NAV, type NavItem } from '@/config/nav';
import { cn } from '@/lib/utils';

function SidebarContent({
  items,
  onNavigate,
  footer,
}: {
  items: NavItem[];
  onNavigate?: () => void;
  footer?: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center px-5 pt-5">
        <NavLink to="/app" onClick={onNavigate} aria-label="ApparcaCUC — inicio">
          <Logo />
        </NavLink>
      </div>
      <div className="px-5 pb-4 pt-3">
        <DemoBadge />
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-brand/10 text-brand' : 'text-ink-soft hover:bg-ink/5 hover:text-ink',
              )
            }
          >
            <item.icon className="h-[1.15rem] w-[1.15rem] shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      {footer && <div className="border-t border-line p-3">{footer}</div>}
    </div>
  );
}

function UserCard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  return (
    <div className="flex items-center gap-3 rounded-xl px-2 py-1.5">
      <Avatar name={user.name} color={user.avatarColor} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{user.name}</p>
        <p className="truncate text-xs text-ink-muted">{user.isDemo ? 'Cuenta demo' : user.email}</p>
      </div>
      <button
        onClick={() => {
          logout();
          navigate('/');
        }}
        className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink"
        aria-label="Cerrar sesión"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}

function Topbar({ variant, onMenu }: { variant: 'user' | 'admin'; onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-surface/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <button
        onClick={onMenu}
        className="rounded-xl p-2 text-ink-soft transition-colors hover:bg-ink/5 lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="lg:hidden">
        <Logo showText={false} markClassName="h-8 w-8" />
      </div>
      {variant === 'admin' && (
        <span className="hidden items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand sm:inline-flex">
          <ShieldCheck className="h-3.5 w-3.5" /> Panel administrativo
        </span>
      )}
      <div className="ml-auto flex items-center gap-1">
        <NotificationsBell />
        <UserMenu />
      </div>
    </header>
  );
}

export function AppShell({ variant }: { variant: 'user' | 'admin' }) {
  const items = variant === 'admin' ? ADMIN_NAV : USER_NAV;
  const [drawer, setDrawer] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] border-r border-line bg-card lg:flex">
        <SidebarContent items={items} footer={<UserCard />} />
      </aside>

      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] border-r border-line bg-card lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.3 }}
            >
              <SidebarContent items={items} onNavigate={() => setDrawer(false)} footer={<UserCard />} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-[264px]">
        <Topbar variant={variant} onMenu={() => setDrawer(true)} />
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
