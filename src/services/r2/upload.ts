import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { MultipartFile } from '@fastify/multipart';
import * as crypto from 'crypto';
import * as path from 'path';

const accountId = process.env.R2_ACCOUNT_ID || '7b1c03c6cc8464a36a9353384e78e707';
const accessKeyId = process.env.R2_ACCESS_KEY_ID || '5d42b4233010f99b869f0fbe9d66133c';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
const bucketName = process.env.R2_BUCKET_NAME || 'logos';
const publicDomain = (process.env.R2_PUBLIC_DOMAIN || '').replace(/\/+$/, '');

export class R2Storage {
  private static client: S3Client | null = null;

  private static getClient(): S3Client {
    if (!this.client) {
      this.client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    }
    return this.client;
  }

  static async upload(file: MultipartFile) {
    try {
      const buffer = await file.toBuffer();
      const ext = path.extname(file.filename) || '.png';
      const randomName = crypto.randomBytes(16).toString('hex') + ext;
      const key = `operators/${randomName}`;

      const client = this.getClient();
      await client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: buffer,
          ContentType: file.mimetype,
          CacheControl: 'public, max-age=31536000, immutable',
        })
      );

      const url = publicDomain ? `${publicDomain}/${key}` : `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${key}`;

      return { status: 200, url };
    } catch (err: any) {
      return { status: 500, message: 'Error al subir a Cloudflare R2', error: err.message };
    }
  }
}
