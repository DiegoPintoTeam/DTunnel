import { R2Storage } from '../../services/r2/upload';
import { Imgbb } from '../../services/imgbb/upload';
import Authentication from '../../middlewares/authentication';
import { FastifyReply, FastifyRequest, RouteOptions } from 'fastify';

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

    let upload;
    if (process.env.R2_SECRET_ACCESS_KEY) {
      upload = await R2Storage.upload(file);
    } else {
      upload = await Imgbb.upload(file);
    }

    reply.status(upload.status).send(upload);
  },
} as RouteOptions;
