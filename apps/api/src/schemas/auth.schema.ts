import { z } from 'zod';

const password = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres.')
  .max(72, 'La contraseña es demasiado larga.');

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Ingresa tu nombre.').max(80),
    email: z.string().trim().toLowerCase().email('Correo electrónico inválido.'),
    password,
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Correo electrónico inválido.'),
    password: z.string().min(1, 'Ingresa tu contraseña.'),
  })
  .strict();

export const forgotPasswordSchema = z
  .object({ email: z.string().trim().toLowerCase().email('Correo electrónico inválido.') })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
