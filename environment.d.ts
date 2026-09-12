declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: number;
      CSRF_SECRET: string;
      JWT_SECRET_KEY: string;
      JWT_SECRET_REFRESH: string;
      NODE_ENV: 'development' | 'production';
      R2_ACCOUNT_ID?: string;
      R2_ACCESS_KEY_ID?: string;
      R2_SECRET_ACCESS_KEY?: string;
      R2_BUCKET_NAME?: string;
      R2_PUBLIC_DOMAIN?: string;
      DTUNNEL_SUPERVISED?: string;
      pm_id?: string;
    }
  }
}

export {};
