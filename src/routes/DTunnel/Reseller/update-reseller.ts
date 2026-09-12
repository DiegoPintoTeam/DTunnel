import { z } from 'zod';
import BCrypt from '../../../utils/bcrypt';
import prisma from '../../../config/prisma-client';
import SafeCallback from '../../../utils/safe-callback';
import Authentication from '../../../middlewares/authentication';
import { updateResellerSchema } from './zod-schema';
import { FastifyReply, FastifyRequest, RouteOptions } from 'fastify';

const paramsSchema = z.object({
  id: z.string(),
});

export default {
  url: '/reseller/:id',
  method: 'PUT',
  onRequest: [Authentication.user, Authentication.admin],
  handler: async (req: FastifyRequest, reply: FastifyReply) => {
    const params = paramsSchema.parse(req.params);
    const { username, email, password, package_id } = updateResellerSchema.parse(req.body);

    const reseller = await SafeCallback(() =>
      prisma.user.findFirst({ where: { id: params.id, role: 'RESELLER' } })
    );

    if (!reseller) {
      reply.status(404);
      throw new Error('Revendedor no encontrado');
    }

    let expiresAt = reseller.expires_at;
    let packageId = reseller.package_id;

    if (package_id) {
      const pkg = await SafeCallback(() => prisma.package.findUnique({ where: { id: Number(package_id) } }));
      if (!pkg) {
        reply.status(404);
        throw new Error('Paquete no encontrado');
      }
      packageId = pkg.id;
      expiresAt = new Date(Date.now() + pkg.days * 24 * 60 * 60 * 1000);
    }

    const updated = await SafeCallback(() =>
      prisma.user.update({
        where: { id: params.id },
        data: {
          username,
          email,
          password: password ? BCrypt.hash(password) : undefined,
          package_id: packageId,
          expires_at: expiresAt,
        },
      })
    );

    if (!updated) {
      reply.status(400);
      throw new Error('No se pudo actualizar el revendedor');
    }

    reply.status(200).send({ status: 200 });
  },
} as RouteOptions;
