import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { LogoMark } from '@/components/brand/Logo';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 text-center">
      <LogoMark className="h-14 w-14" />
      <p className="mt-6 font-display text-6xl font-bold text-brand">404</p>
      <h1 className="mt-2 font-display text-2xl font-bold text-ink">Página no encontrada</h1>
      <p className="mt-2 max-w-sm text-ink-soft">La ruta que buscas no existe o fue movida.</p>
      <Link to="/" className="mt-6">
        <Button>Volver al inicio</Button>
      </Link>
    </div>
  );
}
