import fastify from 'fastify';
import { ICsrfProtection } from '../../utils/csrf-protection';

type User = {
  id: string;
  username: string;
  password: string;
  email: string;
  role: string;
  package_id: number | null;
  expires_at: Date | null;
  r2_account_id: string | null;
  r2_access_key_id: string | null;
  r2_secret_access_key: string | null;
  r2_bucket_name: string | null;
  r2_public_domain: string | null;
  created_at: Date;
  updated_at: Date;
};

declare module 'fastify' {
  export interface FastifyRequest {
    user: User;
    csrfProtection: ICsrfProtection;
  }
}
