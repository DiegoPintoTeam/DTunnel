import { z } from 'zod';
import prisma from '../../../config/prisma-client';
import SafeCallback from '../../../utils/safe-callback';
import Authentication from '../../../middlewares/authentication';
import { FastifyReply, FastifyRequest, RouteOptions } from 'fastify';

const paramsSchema = z.object({
  id: z.string(),
});

export default {
  url: '/category/:id',
  method: 'DELETE',
  onRequest: [Authentication.user],
  handler: async (req: FastifyRequest, reply: FastifyReply) => {
    const params = paramsSchema.parse(req.params);
    const id = Number(params.id);

    const deleted = await SafeCallback(() =>
      prisma.$transaction([
        prisma.appConfig.deleteMany({
          where: {
            category_id: id,
            user_id: req.user.id,
          },
        }),
        prisma.category.deleteMany({
          where: {
            id,
            user_id: req.user.id,
          },
        }),
      ])
    );

    if (!deleted || deleted[1].count === 0) {
      reply.status(400);
      throw new Error('No se pudo borrar la categoría');
    }

    reply.status(204).send();
  },
} as RouteOptions;
