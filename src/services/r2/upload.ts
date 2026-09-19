import { S3Client, PutObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { MultipartFile } from '@fastify/multipart';
import * as crypto from 'crypto';
import * as path from 'path';

export type R2Configuration = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicDomain: string;
};

export class R2Storage {
  private static getClient(configuration: R2Configuration): S3Client {
    return new S3Client({
      region: 'auto',
      maxAttempts: 1,
      endpoint: `https://${configuration.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: configuration.accessKeyId,
        secretAccessKey: configuration.secretAccessKey,
      },
    });
  }

  static async upload(file: MultipartFile, configuration: R2Configuration) {
    try {
      const buffer = await file.toBuffer();
      const ext = path.extname(file.filename) || '.png';
      const randomName = crypto.randomBytes(16).toString('hex') + ext;
      const key = `operators/${randomName}`;

      const client = this.getClient(configuration);
      await client.send(
        new PutObjectCommand({
          Bucket: configuration.bucketName,
          Key: key,
          Body: buffer,
          ContentType: file.mimetype,
          CacheControl: 'public, max-age=31536000, immutable',
        })
      );

      const publicDomain = configuration.publicDomain.replace(/\/+$/, '');
      const url = `${publicDomain}/${key}`;

      return { status: 200, url };
    } catch (error: any) {
      const statusCode = error?.$metadata?.httpStatusCode;
      const errorName = error?.name;

      if (statusCode === 401 || statusCode === 403) {
        return { status: 502, message: 'Cloudflare R2 rechazó las credenciales. Verifica Access Key ID y Secret Access Key.' };
      }

      if (statusCode === 404 || errorName === 'NoSuchBucket') {
        return { status: 502, message: 'Cloudflare R2 no encontró el bucket. Escribe solo el nombre exacto del bucket.' };
      }

      if (errorName === 'CredentialsProviderError') {
        return { status: 502, message: 'Faltan las credenciales de Cloudflare R2.' };
      }

      return { status: 502, message: 'No se pudo conectar con Cloudflare R2. Verifica Account ID y la conexión del servidor.' };
    }
  }

  static async deleteFiles(keysOrUrls: (string | null | undefined)[], configuration: R2Configuration) {
    try {
      const keys = keysOrUrls
        .map((item) => {
          if (!item || typeof item !== 'string') return null;
          const match = item.match(/operators\/[a-zA-Z0-9_.-]+/);
          if (match) return match[0];
          if (item.startsWith('operators/')) return item;
          return null;
        })
        .filter((k): k is string => Boolean(k));

      if (keys.length === 0) return { status: 200, count: 0 };

      const uniqueKeys = Array.from(new Set(keys));
      const client = this.getClient(configuration);

      await client.send(
        new DeleteObjectsCommand({
          Bucket: configuration.bucketName,
          Delete: {
            Objects: uniqueKeys.map((Key) => ({ Key })),
            Quiet: true,
          },
        })
      );

      return { status: 200, count: uniqueKeys.length };
    } catch (error) {
      return { status: 500, error };
    }
  }
}
