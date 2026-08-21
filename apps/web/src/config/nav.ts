import {
  LayoutDashboard,
  Map,
  CalendarClock,
  Car,
  History,
  ScanLine,
  Bell,
  LifeBuoy,
  Info,
  Cpu,
  Users,
  BarChart3,
  LayoutGrid,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export const USER_NAV: NavItem[] = [
  { to: '/app', label: 'Panel', icon: LayoutDashboard, end: true },
  { to: '/app/mapa', label: 'Mapa del parqueadero', icon: Map },
  { to: '/app/reservas', label: 'Mis reservas', icon: CalendarClock },
  { to: '/app/vehiculos', label: 'Mis vehículos', icon: Car },
  { to: '/app/historial', label: 'Historial', icon: History },
  { to: '/app/acceso', label: 'Simulador de acceso', icon: ScanLine },
  { to: '/app/notificaciones', label: 'Notificaciones', icon: Bell },
  { to: '/app/soporte', label: 'Centro de ayuda', icon: LifeBuoy },
  { to: '/app/acerca', label: 'Sobre el proyecto', icon: Info },
];

export const ADMIN_NAV: NavItem[] = [
  { to: '/admin', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/admin/espacios', label: 'Gestión de espacios', icon: LayoutGrid },
  { to: '/admin/iot', label: 'Simulador IoT', icon: Cpu },
  { to: '/admin/reservas', label: 'Reservas', icon: CalendarClock },
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { to: '/admin/analiticas', label: 'Analíticas', icon: BarChart3 },
  { to: '/admin/soporte', label: 'Soporte', icon: LifeBuoy },
];
