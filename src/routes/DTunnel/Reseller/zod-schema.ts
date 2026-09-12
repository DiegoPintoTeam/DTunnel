import { z } from 'zod';

export const createResellerSchema = z.object({
  username: z.string().min(4).max(20),
  email: z.string().email(),
  password: z.string().min(6).max(20),
  package_id: z.union([z.number(), z.string()]).optional(),
});

export const updateResellerSchema = z.object({
  username: z.string().min(4).max(20),
  email: z.string().email(),
  password: z.union([z.string().min(6).max(20), z.literal('')]).optional(),
  package_id: z.union([z.number(), z.string()]).optional(),
});
