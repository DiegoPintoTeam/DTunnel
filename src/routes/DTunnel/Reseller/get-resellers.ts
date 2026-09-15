import { z } from 'zod';
import prisma from '../../../config/prisma-client';
import Authentication from '../../../middlewares/authentication';
import { FastifyReply, FastifyRequest, RouteOptions } from 'fastify';

const querySchema = z.object({
  search: z.string().optional().default(''),
  offset: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
});

export default {
  url: '/reseller_list',
  method: 'GET',
  onRequest: [Authentication.user, Authentication.admin],
  handler: async (req: FastifyRequest, reply: FastifyReply) => {
    const query = querySchema.parse(req.query);

    const limit = parseInt(query.limit);
    const offset = parseInt(query.offset);

    const where = {
      role: 'RESELLER',
      ...(query.search ? { username: { contains: query.search } } : {}),
    };

    const total = await prisma.user.count({ where });

    const resellers = await prisma.user.findMany({
      where,
      skip: (offset - 1) * limit,
      take: limit,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        expires_at: true,
        created_at: true,
        package_id: true,
        package: { select: { id: true, name: true, days: true } },
      },
    });

    reply.status(200).send({
      status: 200,
      data: {
        total,
        count: resellers.length,
        limit,
        offset,
        result: resellers,
      },
    });
  },
} as RouteOptions;
