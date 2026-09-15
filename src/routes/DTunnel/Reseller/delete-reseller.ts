import { z } from 'zod';
import prisma from '../../../config/prisma-client';
import SafeCallback from '../../../utils/safe-callback';
import Authentication from '../../../middlewares/authentication';
import { FastifyReply, FastifyRequest, RouteOptions } from 'fastify';

const paramsSchema = z.object({
  id: z.string(),
});

export default {
  url: '/reseller/:id',
  method: 'DELETE',
  onRequest: [Authentication.user, Authentication.admin],
  handler: async (req: FastifyRequest, reply: FastifyReply) => {
    const params = paramsSchema.parse(req.params);

    const reseller = await SafeCallback(() =>
      prisma.user.deleteMany({
        where: { id: params.id, role: 'RESELLER' },
      })
    );

    if (!reseller || reseller.count === 0) {
      reply.status(400);
      throw new Error('No se pudo borrar el revendedor');
    }

    reply.status(204).send();
  },
} as RouteOptions;
