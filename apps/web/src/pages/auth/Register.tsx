import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Lock, User } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/form';
import { useAuth } from '@/context/AuthContext';
import { errorMessage, type NormalizedError } from '@/lib/api';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (form.password.length < 8) {
      setErrors({ password: 'La contraseña debe tener al menos 8 caracteres.' });
      return;
    }
    setLoading(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      toast.success('¡Cuenta creada! Bienvenido a ApparcaCUC.');
      navigate('/app', { replace: true });
    } catch (err) {
      const n = err as NormalizedError;
      if (n.details) {
        setErrors(Object.fromEntries(Object.entries(n.details).map(([k, v]) => [k, v[0]])));
      } else {
        toast.error(errorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Crea tu cuenta demo"
      subtitle="Regístrate para probar ApparcaCUC. Usa datos ficticios, es solo una demostración."
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nombre" error={errors.name}>
          <Input
            placeholder="Tu nombre"
            leftIcon={<User className="h-4 w-4" />}
            value={form.name}
            onChange={set('name')}
            invalid={Boolean(errors.name)}
            required
          />
        </Field>
        <Field label="Correo electrónico" error={errors.email}>
          <Input
            type="email"
            placeholder="tucorreo@ejemplo.com"
            leftIcon={<Mail className="h-4 w-4" />}
            value={form.email}
            onChange={set('email')}
            invalid={Boolean(errors.email)}
            required
          />
        </Field>
        <Field label="Contraseña" error={errors.password} hint="Mínimo 8 caracteres.">
          <Input
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            value={form.password}
            onChange={set('password')}
            invalid={Boolean(errors.password)}
            required
          />
        </Field>
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Crear cuenta
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-soft">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-medium text-brand hover:underline">
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  );
}
