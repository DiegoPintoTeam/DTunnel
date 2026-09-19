import { z } from 'zod';
import prisma from '../../../config/prisma-client';
import SafeCallback from '../../../utils/safe-callback';
import Authentication from '../../../middlewares/authentication';
import { R2Configuration, R2Storage } from '../../../services/r2/upload';
import { FastifyReply, FastifyRequest, RouteOptions } from 'fastify';

const paramsSchema = z.object({
  id: z.string(),
});

const toR2Configuration = (user: {
  r2_account_id: string | null;
  r2_access_key_id: string | null;
  r2_secret_access_key: string | null;
  r2_bucket_name: string | null;
  r2_public_domain: string | null;
} | null | undefined): R2Configuration | null =>
  user && user.r2_account_id && user.r2_access_key_id && user.r2_secret_access_key && user.r2_bucket_name && user.r2_public_domain
    ? {
        accountId: user.r2_account_id,
        accessKeyId: user.r2_access_key_id,
        secretAccessKey: user.r2_secret_access_key,
        bucketName: user.r2_bucket_name,
        publicDomain: user.r2_public_domain,
      }
    : null;

export default {
  url: '/reseller/:id',
  method: 'DELETE',
  onRequest: [Authentication.user, Authentication.admin],
  handler: async (req: FastifyRequest, reply: FastifyReply) => {
    const params = paramsSchema.parse(req.params);

    const reseller = await SafeCallback(() =>
      prisma.user.findFirst({
        where: { id: params.id, role: 'RESELLER' },
        include: {
          AppConfig: true,
          AppLayout: {
            include: {
              layout_storage: true,
            },
          },
        },
      })
    );

    if (!reseller) {
      reply.status(404);
      throw new Error('Revendedor no encontrado');
    }

    const r2Config = toR2Configuration(reseller) || toR2Configuration(req.user);

    const imageTargets: (string | null | undefined)[] = [];

    reseller.AppConfig.forEach((cfg) => {
      if (cfg.icon) imageTargets.push(cfg.icon);
    });

    reseller.AppLayout.forEach((layout) => {
      layout.layout_storage.forEach((item) => {
        if (item.value) imageTargets.push(item.value);
      });
    });

    if (r2Config && imageTargets.length > 0) {
      await SafeCallback(() => R2Storage.deleteFiles(imageTargets, r2Config));
    }

    const deleted = await SafeCallback(() =>
      prisma.$transaction([
        prisma.appLayoutStorage.deleteMany({
          where: {
            app_layout: {
              user_id: reseller.id,
            },
          },
        }),
        prisma.appLayout.deleteMany({
          where: {
            user_id: reseller.id,
          },
        }),
        prisma.appConfig.deleteMany({
          where: {
            user_id: reseller.id,
          },
        }),
        prisma.category.deleteMany({
          where: {
            user_id: reseller.id,
          },
        }),
        prisma.appText.deleteMany({
          where: {
            user_id: reseller.id,
          },
        }),
        prisma.user.deleteMany({
          where: {
            id: reseller.id,
            role: 'RESELLER',
          },
        }),
      ])
    );

    if (!deleted || deleted[5].count === 0) {
      reply.status(400);
      throw new Error('No se pudo borrar el revendedor');
    }

    reply.status(204).send();
  },
} as RouteOptions;
