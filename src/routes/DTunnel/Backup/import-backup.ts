import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';
import prisma from '../../../config/prisma-client';
import Authentication from '../../../middlewares/authentication';
import { FastifyReply, FastifyRequest, RouteOptions } from 'fastify';

const projectRoot = path.resolve(__dirname, '../../../..');
const databasePath = path.join(projectRoot, 'prisma', 'database.db');
const databaseSafetyPath = path.join(projectRoot, 'prisma', 'database.db.before-restore');

export default {
  url: '/backup/import',
  method: 'POST',
  onRequest: [Authentication.user, Authentication.admin],
  handler: async (req: FastifyRequest, reply: FastifyReply) => {
    const file = await req.file();

    if (!file || !file.filename.toLowerCase().endsWith('.zip')) {
      reply.status(400);
      throw new Error('Debes subir un archivo .zip de copia de seguridad válido');
    }

    const buffer = await file.toBuffer();

    let zip: AdmZip;
    try {
      zip = new AdmZip(buffer);
    } catch {
      reply.status(400);
      throw new Error('El archivo subido no es un .zip válido');
    }

    const databaseEntry = zip.getEntries().find((entry) => entry.entryName === 'database.db');

    if (!databaseEntry) {
      reply.status(400);
      throw new Error('El archivo .zip no contiene database.db');
    }

    // Copia de respaldo por si la restauración falla, para no dejar el panel sin base de datos.
    if (fs.existsSync(databasePath)) {
      fs.copyFileSync(databasePath, databaseSafetyPath);
    }

    try {
      await prisma.$disconnect();
      fs.writeFileSync(databasePath, databaseEntry.getData());
    } catch (error) {
      if (fs.existsSync(databaseSafetyPath)) {
        fs.copyFileSync(databaseSafetyPath, databasePath);
      }
      throw error;
    }

    reply.status(200).send({ status: 200, message: 'Copia de seguridad restaurada con éxito' });
  },
} as RouteOptions;
