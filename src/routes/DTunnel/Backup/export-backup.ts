import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';
import Authentication from '../../../middlewares/authentication';
import { FastifyReply, FastifyRequest, RouteOptions } from 'fastify';

const projectRoot = path.resolve(__dirname, '../../../..');
const databasePath = path.join(projectRoot, 'prisma', 'database.db');
const envPath = path.join(projectRoot, '.env');

export default {
  url: '/backup/export',
  method: 'GET',
  onRequest: [Authentication.user, Authentication.admin],
  handler: async (req: FastifyRequest, reply: FastifyReply) => {
    if (!fs.existsSync(databasePath)) {
      reply.status(404);
      throw new Error('No se encontró la base de datos del panel');
    }

    const zip = new AdmZip();
    zip.addLocalFile(databasePath);

    if (fs.existsSync(envPath)) {
      zip.addLocalFile(envPath);
    }

    const buffer = zip.toBuffer();
    const filename = `dtunnel-backup-${new Date().toISOString().slice(0, 10)}.zip`;

    reply
      .header('Content-Type', 'application/zip')
      .header('Content-Disposition', `attachment; filename="${filename}"`)
      .send(buffer);
  },
} as RouteOptions;
