import { User, hashPassword } from '../models/User';
import { signToken } from '../utils/jwt';
import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';
import { publicUser } from '../utils/serializers';
import { notify } from '../services/notification.service';
import { env } from '../config/env';

const AVATAR_COLORS = ['#A3161A', '#078930', '#C9A227', '#595959', '#7A1014', '#B0641C'];

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body as { name: string; email: string; password: string };

  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('Ya existe una cuenta con ese correo.');

  const passwordHash = await hashPassword(password);
  const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  const user = await User.create({ name, email, passwordHash, role: 'user', avatarColor, isDemo: false });

  await notify({
    user: user._id,
    type: 'system',
    title: '¡Bienvenido a ApparcaCUC!',
    message: 'Tu cuenta fue creada. Explora el mapa del estacionamiento y crea tu primera reserva.',
  });

  const token = signToken({ sub: user.id, role: user.role, email: user.email });
  res.status(201).json({ token, user: publicUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Correo o contraseña incorrectos.');
  }
  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken({ sub: user.id, role: user.role, email: user.email });
  res.json({ token, user: publicUser(user) });
});

/** One-click login for the public demo accounts (no credentials in the frontend). */
export const demoLogin = asyncHandler(async (req, res) => {
  const role = (req.body as { role?: string }).role === 'admin' ? 'admin' : 'user';
  const email = role === 'admin' ? env.DEMO_ADMIN_EMAIL : env.DEMO_USER_EMAIL;

  const user = await User.findOne({ email });
  if (!user) throw ApiError.notFound('La cuenta demo no está disponible. Ejecuta el seed de datos.');

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken({ sub: user.id, role: user.role, email: user.email });
  res.json({ token, user: publicUser(user) });
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user!.sub);
  if (!user) throw ApiError.unauthorized();
  res.json({ user: publicUser(user) });
});

export const logout = asyncHandler(async (_req, res) => {
  // Stateless JWT: the client discards the token. Endpoint kept for symmetry.
  res.json({ ok: true });
});

export const forgotPassword = asyncHandler(async (_req, res) => {
  // Simulated flow — never reveals whether an email exists (avoids enumeration).
  res.json({
    ok: true,
    message:
      'Si el correo está registrado, enviaremos instrucciones para restablecer la contraseña. (Flujo simulado en esta demo.)',
  });
});
