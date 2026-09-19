import { z } from 'zod';
import BCrypt from '../../utils/bcrypt';
import prisma from '../../config/prisma-client';
import SafeCallback from '../../utils/safe-callback';
import CookieManager from '../../utils/cookie-manager';
import csrfProtection from '../../middlewares/csrf-protection';
import { FastifyReply, FastifyRequest, RouteOptions } from 'fastify';

const loginSchema = z.object({
  username: z
    .string({ required_error: 'El usuario es obligatorio' })
    .min(4, 'El usuario debe tener al menos 4 caracteres')
    .max(20, 'El usuario no debe superar los 20 caracteres'),
  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(20, 'La contraseña no debe superar los 20 caracteres'),
});

export default {
  url: '/login',
  method: 'POST',
  onRequest: [csrfProtection],
  handler: async (req: FastifyRequest, reply: FastifyReply) => {
    const { username, password } = loginSchema.parse(req.body);

    const user = await SafeCallback(() =>
      prisma.user.findFirst({
        where: { username },
      })
    );

    if (!user || !BCrypt.compare(password, user.password)) {
      reply.status(401);
      reply.header('csrf-token', req.csrfProtection.generateCsrf());
      throw new Error('Usuario o contraseña no válidos');
    }

    if (user.role === 'RESELLER' && user.expires_at) {
      const isExpired = new Date(user.expires_at).getTime() < Date.now();
      if (isExpired) {
        reply.status(403);
        reply.header('csrf-token', req.csrfProtection.generateCsrf());
        throw new Error('Tu servicio ha caducado. Por favor, contacta al administrador para renovar.');
      }
    }

    CookieManager.setCookiesLoggedIn(reply, user.id);

    reply.send({ status: 200, message: 'Éxito, espera estás siendo redirigido' });
  },
} as RouteOptions;
