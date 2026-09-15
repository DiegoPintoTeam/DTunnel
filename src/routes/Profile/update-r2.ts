import { z } from 'zod';
import prisma from '../../config/prisma-client';
import SafeCallback from '../../utils/safe-callback';
import Authentication from '../../middlewares/authentication';
import csrfProtection from '../../middlewares/csrf-protection';
import { FastifyReply, FastifyRequest, RouteOptions } from 'fastify';

const bodySchema = z.object({
  r2_account_id: z
    .string()
    .trim()
    .regex(/^[a-f0-9]{32}$/i, 'El Account ID debe contener los 32 caracteres hexadecimales de Cloudflare')
    .nullable(),
  r2_access_key_id: z.string().trim().max(128).nullable(),
  r2_secret_access_key: z.string().trim().max(256).nullable(),
  r2_bucket_name: z
    .string()
    .trim()
    .regex(/^[a-z0-9][a-z0-9.-]{0,61}[a-z0-9]$|^[a-z0-9]$/, 'El bucket debe ser solo su nombre, no una URL')
    .nullable(),
  r2_public_domain: z.string().trim().url().max(2048).nullable(),
});

export default {
  url: '/profile/r2',
  method: 'PUT',
  onRequest: [csrfProtection, Authentication.user, Authentication.admin],
  handler: async (req: FastifyRequest, reply: FastifyReply) => {
    const body = bodySchema.parse(req.body);
    const r2SecretAccessKey = body.r2_secret_access_key || req.user.r2_secret_access_key;

    const user = await SafeCallback(() =>
      prisma.user.update({
        where: { id: req.user.id },
        data: {
          r2_account_id: body.r2_account_id || null,
          r2_access_key_id: body.r2_access_key_id || null,
          r2_secret_access_key: r2SecretAccessKey || null,
          r2_bucket_name: body.r2_bucket_name || null,
          r2_public_domain: body.r2_public_domain || null,
        },
      })
    );

    if (!user) throw new Error('No se pudo guardar la configuración de Cloudflare R2');

    reply.header('csrf-token', req.csrfProtection.generateCsrf());
    reply.status(200).send();
  },
} as RouteOptions;