import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute, AdminRoute } from '@/components/routes/Guards';
import { AppShell } from '@/components/layout/AppShell';
import { Spinner } from '@/components/ui/feedback';
import Landing from '@/pages/Landing';
import Login from '@/pages/auth/Login';

// Route-level code splitting keeps the initial bundle small; heavy deps
// (charts, QR) load only when their route is visited.
const Register = lazy(() => import('@/pages/auth/Register'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const Dashboard = lazy(() => import('@/pages/app/Dashboard'));
const ParkingMapPage = lazy(() => import('@/pages/app/ParkingMapPage'));
const ReservationsPage = lazy(() => import('@/pages/app/ReservationsPage'));
const VehiclesPage = lazy(() => import('@/pages/app/VehiclesPage'));
const HistoryPage = lazy(() => import('@/pages/app/HistoryPage'));
const AccessSimulatorPage = lazy(() => import('@/pages/app/AccessSimulatorPage'));
const NotificationsPage = lazy(() => import('@/pages/app/NotificationsPage'));
const SupportPage = lazy(() => import('@/pages/app/SupportPage'));
const AboutPage = lazy(() => import('@/pages/app/AboutPage'));
const AdminOverviewPage = lazy(() => import('@/pages/admin/AdminOverviewPage'));
const AdminSpacesPage = lazy(() => import('@/pages/admin/AdminSpacesPage'));
const AdminIoTPage = lazy(() => import('@/pages/admin/AdminIoTPage'));
const AdminReservationsPage = lazy(() => import('@/pages/admin/AdminReservationsPage'));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));
const AdminAnalyticsPage = lazy(() => import('@/pages/admin/AdminAnalyticsPage'));
const AdminSupportPage = lazy(() => import('@/pages/admin/AdminSupportPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner className="h-7 w-7" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/recuperar" element={<ForgotPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppShell variant="user" />}>
            <Route index element={<Dashboard />} />
            <Route path="mapa" element={<ParkingMapPage />} />
            <Route path="reservas" element={<ReservationsPage />} />
            <Route path="vehiculos" element={<VehiclesPage />} />
            <Route path="historial" element={<HistoryPage />} />
            <Route path="acceso" element={<AccessSimulatorPage />} />
            <Route path="notificaciones" element={<NotificationsPage />} />
            <Route path="soporte" element={<SupportPage />} />
            <Route path="acerca" element={<AboutPage />} />
          </Route>
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AppShell variant="admin" />}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="espacios" element={<AdminSpacesPage />} />
            <Route path="iot" element={<AdminIoTPage />} />
            <Route path="reservas" element={<AdminReservationsPage />} />
            <Route path="usuarios" element={<AdminUsersPage />} />
            <Route path="analiticas" element={<AdminAnalyticsPage />} />
            <Route path="soporte" element={<AdminSupportPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
