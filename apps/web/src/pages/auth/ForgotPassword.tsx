import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/form';
import { api } from '@/lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
    } catch {
      /* Intentionally ignored — the flow is simulated and never reveals account existence. */
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Flujo simulado para esta demo — no se envía ningún correo real."
    >
      {sent ? (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-xl border border-forest/25 bg-forest/8 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-forest" />
            <p className="text-sm text-ink-soft">
              Si <span className="font-medium text-ink">{email}</span> estuviera registrado, enviaríamos
              instrucciones para restablecer la contraseña. En esta demo el envío es simulado.
            </p>
          </div>
          <Link to="/login">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4" /> Volver a iniciar sesión
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field label="Correo electrónico">
            <Input
              type="email"
              placeholder="tucorreo@ejemplo.com"
              leftIcon={<Mail className="h-4 w-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Enviar instrucciones
          </Button>
          <Link
            to="/login"
            className="flex items-center justify-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
        </form>
      )}
    </AuthLayout>
  );
}
