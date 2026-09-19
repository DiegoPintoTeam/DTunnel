import { Render } from '../../../config/render-config';
import Authentication from '../../../middlewares/authentication';
import { FastifyRequest, FastifyReply, RouteOptions } from 'fastify';

export default {
  url: '/resellers',
  method: 'GET',
  onRequest: [Authentication.user],
  handler: (req: FastifyRequest, reply: FastifyReply) => {
    if (req.user.role !== 'ADMIN') return reply.redirect('/');

    Render.page(req, reply, '/resellers/index.html', {
      user: req.user,
      active: 'resellers',
      csrfToken: req.csrfProtection.generateCsrf(),
    });
  },
} as RouteOptions;
