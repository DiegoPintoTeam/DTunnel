import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1).max(200),
  color: z.string().min(1).max(200),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  sorter: z.union([z.number(), z.string()]),
});
