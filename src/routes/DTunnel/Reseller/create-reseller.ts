import BCrypt from '../../../utils/bcrypt';
import prisma from '../../../config/prisma-client';
import SafeCallback from '../../../utils/safe-callback';
import Authentication from '../../../middlewares/authentication';
import { createResellerSchema } from './zod-schema';
import { FastifyReply, FastifyRequest, RouteOptions } from 'fastify';

export default {
  url: '/reseller',
  method: 'POST',
  onRequest: [Authentication.user, Authentication.admin],
  handler: async (req: FastifyRequest, reply: FastifyReply) => {
    const { username, email, password, package_id } = createResellerSchema.parse(req.body);

    const usernameAlreadyExists = await SafeCallback(() =>
      prisma.user.findFirst({ where: { username } })
    );

    if (usernameAlreadyExists) {
      reply.status(409);
      throw new Error('El nombre de usuario ya está en uso');
    }

    const emailAlreadyExists = await SafeCallback(() => prisma.user.findFirst({ where: { email } }));

    if (emailAlreadyExists) {
      reply.status(409);
      throw new Error('Correo electrónico ya registrado');
    }

    let expiresAt: Date | null = null;

    if (package_id) {
      const pkg = await SafeCallback(() => prisma.package.findUnique({ where: { id: Number(package_id) } }));
      if (!pkg) {
        reply.status(404);
        throw new Error('Paquete no encontrado');
      }
      expiresAt = new Date(Date.now() + pkg.days * 24 * 60 * 60 * 1000);
    }

    const reseller = await SafeCallback(() =>
      prisma.user.create({
        data: {
          username,
          email,
          password: BCrypt.hash(password),
          role: 'RESELLER',
          package_id: package_id ? Number(package_id) : null,
          expires_at: expiresAt,
        },
      })
    );

    if (!reseller) {
      throw new Error('No se pudo crear el revendedor');
    }

    reply.status(201).send({ reseller_id: reseller.id });
  },
} as RouteOptions;
