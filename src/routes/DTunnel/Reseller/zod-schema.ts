import { z } from 'zod';

export const createResellerSchema = z.object({
  username: z
    .string({ required_error: 'El nombre de usuario es obligatorio' })
    .min(4, 'El nombre de usuario debe tener al menos 4 caracteres')
    .max(20, 'El nombre de usuario no debe superar los 20 caracteres'),
  email: z
    .string({ required_error: 'El correo electrónico es obligatorio' })
    .email('El correo electrónico no es válido'),
  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(20, 'La contraseña no debe superar los 20 caracteres'),
  package_id: z.union([z.number(), z.string()]).optional(),
});

export const updateResellerSchema = z.object({
  username: z
    .string({ required_error: 'El nombre de usuario es obligatorio' })
    .min(4, 'El nombre de usuario debe tener al menos 4 caracteres')
    .max(20, 'El nombre de usuario no debe superar los 20 caracteres'),
  email: z
    .string({ required_error: 'El correo electrónico es obligatorio' })
    .email('El correo electrónico no es válido'),
  password: z
    .union([
      z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(20, 'La contraseña no debe superar los 20 caracteres'),
      z.literal(''),
    ])
    .optional(),
  package_id: z.union([z.number(), z.string()]).optional(),
});
