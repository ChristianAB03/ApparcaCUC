import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Lock, User, ShieldCheck } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/form';
import { useAuth } from '@/context/AuthContext';
import { errorMessage } from '@/lib/api';

export default function Login() {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/app';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<'user' | 'admin' | null>(null);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(email.trim(), password);
      navigate(u.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const quick = async (role: 'user' | 'admin') => {
    setDemoLoading(role);
    try {
      await demoLogin(role);
      navigate(role === 'admin' ? '/admin' : '/app', { replace: true });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <AuthLayout title="Inicia sesión" subtitle="Accede a tu panel de ApparcaCUC.">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <Button variant="outline" onClick={() => quick('user')} loading={demoLoading === 'user'} disabled={demoLoading !== null}>
            <User className="h-4 w-4" /> Usuario DEMO
          </Button>
          <Button variant="outline" onClick={() => quick('admin')} loading={demoLoading === 'admin'} disabled={demoLoading !== null}>
            <ShieldCheck className="h-4 w-4" /> Admin DEMO
          </Button>
        </div>
        <p className="text-center text-xs text-ink-muted">Acceso instantáneo para explorar la demo.</p>

        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-line" />
          <span className="text-xs text-ink-muted">o con tu correo</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Field label="Correo electrónico">
            <Input
              type="email"
              autoComplete="email"
              placeholder="demo@apparcacuc.com"
              leftIcon={<Mail className="h-4 w-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field
            label="Contraseña"
            error={error || undefined}
          >
            <Input
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              invalid={Boolean(error)}
              required
            />
          </Field>
          <div className="flex justify-end">
            <Link to="/recuperar" className="text-xs font-medium text-brand hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Ingresar
          </Button>
        </form>

        <p className="text-center text-sm text-ink-soft">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="font-medium text-brand hover:underline">
            Crea una cuenta demo
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
