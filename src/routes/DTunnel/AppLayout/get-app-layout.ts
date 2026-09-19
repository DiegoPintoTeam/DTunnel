import { z } from 'zod';
import prisma from '../../../config/prisma-client';
import SafeCallback from '../../../utils/safe-callback';
import Authentication from '../../../middlewares/authentication';
import { FastifyReply, FastifyRequest, RouteOptions } from 'fastify';
import { AppLayoutParser } from '../../../utils/parsers/app-layout-parser';
import { AppLayoutDefault } from './defaults';

const querySchema = z.object({
  offset: z.string().optional().default('1'),
  limit: z.string().optional().default('200'),
});

export default {
  url: '/app_layout/list',
  method: 'GET',
  onRequest: [Authentication.user],
  handler: async (req: FastifyRequest, reply: FastifyReply) => {
    const query = querySchema.parse(req.query);

    const limit = parseInt(query.limit);
    const offset = parseInt(query.offset);

    let total = await prisma.appLayout.count({
      where: { user_id: req.user.id },
    });

    if (total === 0) {
      const createAppLayout = await SafeCallback(() =>
        prisma.appLayout.create({
          data: {
            is_active: true,
            user_id: req.user.id,
          },
        })
      );

      if (createAppLayout) {
        for (const AppLayout of AppLayoutDefault) {
          await SafeCallback(() => {
            const value =
              typeof AppLayout.value === 'object' && AppLayout.type == 'SELECT'
                ? AppLayout.value?.selected
                : AppLayout.value;

            return prisma.appLayoutStorage.create({
              data: {
                label: AppLayout.label,
                name: AppLayout.name,
                status: AppLayout.status,
                type: AppLayout.type,
                value: String(value) == 'null' ? null : String(value),
                app_layout_id: createAppLayout.id,
              },
            });
          });
        }
        total = 1;
      }
    }

    const appLayouts = AppLayoutParser(
      await prisma.appLayout.findMany({
        where: { user_id: req.user.id },
        select: {
          id: true,
          user_id: true,
          is_active: true,
          layout_storage: {
            select: {
              id: true,
              label: true,
              name: true,
              status: true,
              type: true,
              value: true,
            },
          },
        },
        skip: (offset - 1) * limit,
        take: limit,
      })
    );

    const response = {
      status: 200,
      data: {
        total,
        count: appLayouts.length,
        limit,
        offset,
        result: appLayouts,
      },
    };

    reply.send(response);
  },
} as RouteOptions;
