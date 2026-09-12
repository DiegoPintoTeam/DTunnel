import Authentication from '../../../middlewares/authentication';
import { FastifyReply, FastifyRequest, RouteOptions } from 'fastify';

export default {
  url: '/panel/restart',
  method: 'POST',
  onRequest: [Authentication.user, Authentication.admin],
  handler: async (req: FastifyRequest, reply: FastifyReply) => {
    const isSupervised =
      process.env.DTUNNEL_SUPERVISED === '1' || process.env.pm_id !== undefined;

    if (!isSupervised) {
      return reply.status(409).send({
        status: 409,
        message: 'No se puede reiniciar: el panel no está ejecutándose como servicio.',
      });
    }

    reply.status(200).send({ status: 200, message: 'El panel se está reiniciando...' });

    setTimeout(() => process.exit(0), 500);
  },
} as RouteOptions;
