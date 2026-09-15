import prisma from '../../../config/prisma-client';
import Authentication from '../../../middlewares/authentication';
import { FastifyReply, FastifyRequest, RouteOptions } from 'fastify';

export default {
  url: '/package_list',
  method: 'GET',
  onRequest: [Authentication.user, Authentication.admin],
  handler: async (req: FastifyRequest, reply: FastifyReply) => {
    const packages = await prisma.package.findMany({
      orderBy: { days: 'asc' },
    });

    reply.status(200).send({ status: 200, data: packages });
  },
} as RouteOptions;
