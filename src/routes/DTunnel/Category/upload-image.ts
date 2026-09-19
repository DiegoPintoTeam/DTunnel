import { R2Configuration, R2Storage } from '../../../services/r2/upload';
import Authentication from '../../../middlewares/authentication';
import prisma from '../../../config/prisma-client';
import { FastifyReply, FastifyRequest, RouteOptions } from 'fastify';

const toR2Configuration = (user: {
  r2_account_id: string | null;
  r2_access_key_id: string | null;
  r2_secret_access_key: string | null;
  r2_bucket_name: string | null;
  r2_public_domain: string | null;
}): R2Configuration | null =>
  user.r2_account_id && user.r2_access_key_id && user.r2_secret_access_key && user.r2_bucket_name && user.r2_public_domain
    ? {
        accountId: user.r2_account_id,
        accessKeyId: user.r2_access_key_id,
        secretAccessKey: user.r2_secret_access_key,
        bucketName: user.r2_bucket_name,
        publicDomain: user.r2_public_domain,
      }
    : null;

export default {
  url: '/upload/image',
  method: 'POST',
  onRequest: [Authentication.user],
  handler: async (req: FastifyRequest, reply: FastifyReply) => {
    const file = await req.file();

    if (!file) {
      reply.status(400);
      throw new Error('Archivo no válido!');
    }

    let configuration = toR2Configuration(req.user);

    // revendedores no tienen configuración propia: usan la R2 del administrador
    if (!configuration && req.user.role !== 'ADMIN') {
      const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
      if (admin) {
        configuration = toR2Configuration(admin);
      }
    }

    let upload;
    if (configuration) {
      upload = await R2Storage.upload(file, configuration);
    } else {
      const { Imgbb } = await import('../../../services/imgbb/upload');
      upload = await Imgbb.upload(file);
    }

    reply.status(upload.status).send(upload);
  },
} as RouteOptions;
