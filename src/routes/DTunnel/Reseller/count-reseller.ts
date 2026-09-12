import prisma from '../../../config/prisma-client';
import Authentication from '../../../middlewares/authentication';
import { FastifyReply, FastifyRequest, RouteOptions } from 'fastify';

export default {
  url: '/reseller_count',
  method: 'GET',
  onRequest: [Authentication.user, Authentication.admin],
  handler: async (req: FastifyRequest, reply: FastifyReply) => {
    const total_resellers = await prisma.user.count({
      where: { role: 'RESELLER' },
    });

    reply.send({ total_resellers });
  },
} as RouteOptions;
