import { Render } from '../../../config/render-config';
import Authentication from '../../../middlewares/authentication';
import { FastifyRequest, FastifyReply, RouteOptions } from 'fastify';

export default {
  url: '/login',
  method: 'GET',
  onRequest: [Authentication.user],
  handler: (req: FastifyRequest, reply: FastifyReply) => {
    if (req.user && req.user.id) reply.redirect('/');

    Render.page(req, reply, '/login/index.html', { csrfToken: req.csrfProtection.generateCsrf() });
  },
} as RouteOptions;
